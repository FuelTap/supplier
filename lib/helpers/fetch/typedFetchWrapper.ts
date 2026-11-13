export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  status: string;
  // HTTP status code, or 0 when the backend couldn't be reached.
  statusCode: number;
  data?: T;
  error?: string;
};

export type ApiRequestOptions = RequestInit & {
  /**
   * If true, suppresses automatic retry on 401.
   * Useful to prevent infinite loops on endpoints like /auth/refresh-token itself.
   */
  skipRefresh?: boolean;
  // Milliseconds before the request is abandoned. Defaults to 20 seconds.
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 20_000;

// Shown when the backend gives no usable message (or a 5xx one, which is
// written for developers rather than users).
const fallbackMessages: Record<number, string> = {
  400: "Some of the details you entered aren't valid. Please check them and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "This conflicts with information that already exists.",
  413: "The file you uploaded is too large.",
  422: "Some of the details you entered aren't valid. Please check them and try again.",
  429: "Too many attempts. Please wait a moment and try again.",
};

const SERVER_ERROR_MESSAGE =
  "Something went wrong on our side. Please try again in a moment.";
const NETWORK_ERROR_MESSAGE =
  "We couldn't reach the FuelTap server. Please check your connection and try again.";
const TIMEOUT_MESSAGE =
  "The FuelTap server is taking too long to respond. Please try again.";

export function fallbackMessage(statusCode: number) {
  if (statusCode >= 500) return SERVER_ERROR_MESSAGE;
  return fallbackMessages[statusCode] ?? "Something went wrong. Please try again.";
}

// The backend reports errors as { message }, { error }, or, for validation
// failures, { errors: [{ msg, path }] } with no message at all.
function messageFrom(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const { message, error, errors } = body as Record<string, unknown>;

  if (Array.isArray(errors)) {
    const messages = errors
      .map((e) =>
        typeof e === "string"
          ? e
          : e && typeof e === "object"
            ? ((e as { msg?: unknown; message?: unknown }).msg ??
              (e as { message?: unknown }).message)
            : undefined,
      )
      .filter((m): m is string => typeof m === "string" && m.trim() !== "");
    if (messages.length) return [...new Set(messages)].join(" ");
  }
  if (typeof message === "string" && message.trim()) return message;
  if (typeof error === "string" && error.trim()) return error;
  return undefined;
}

export async function apiRequest<TRequest = unknown, TResponse = unknown>(
  endpoint: string,
  method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH" = "GET",
  data?: TRequest,
  options: ApiRequestOptions = {},
): Promise<{ response: Response; result: ApiResponse<TResponse> }> {
  const {
    // Read by authenticatedApiRequest; pulled out so it isn't passed to fetch.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    skipRefresh,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers: customHeaders,
    signal,
    ...restOptions
  } = options;

  const baseUrl = process.env.API_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    console.error("API_URL is not set. Add it to .env.local.");
    return {
      response: new Response(null, { status: 500 }),
      result: {
        success: false,
        status: "error",
        statusCode: 0,
        message: SERVER_ERROR_MESSAGE,
      },
    };
  }
  const url = `${baseUrl}/${endpoint.replace(/^\//, "")}`;

  const headers = new Headers(customHeaders);
  headers.set("Accept", "application/json");
  const isFormData = data instanceof FormData;
  if (isFormData) {
    headers.delete("Content-Type"); // fetch supplies the multipart boundary.
  } else if (data && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const timeout = AbortSignal.timeout(timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      cache: "no-store",
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      ...restOptions,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "TimeoutError";
    console.error(`API ${method} ${endpoint} failed:`, error);
    return {
      response: new Response(null, { status: timedOut ? 504 : 503 }),
      result: {
        success: false,
        status: "error",
        statusCode: 0,
        message: timedOut ? TIMEOUT_MESSAGE : NETWORK_ERROR_MESSAGE,
      },
    };
  }

  // Unknown routes come back as an HTML page, so the body isn't always JSON.
  let body: unknown;
  try {
    const text = await response.text();
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }

  if (response.ok) {
    const parsed = (body ?? {}) as Record<string, unknown>;
    return {
      response,
      result: {
        success: true,
        statusCode: response.status,
        status: typeof parsed.status === "string" ? parsed.status : "success",
        message: messageFrom(parsed) ?? "Request successful",
        data: (parsed.data !== undefined ? parsed.data : body) as TResponse,
      },
    };
  }

  const backendMessage = messageFrom(body);
  if (response.status >= 500 || !backendMessage) {
    console.error(
      `API ${method} ${endpoint} returned ${response.status}:`,
      backendMessage ?? "(no message)",
    );
  }
  return {
    response,
    result: {
      success: false,
      status: "error",
      statusCode: response.status,
      message:
        response.status < 500 && backendMessage
          ? backendMessage
          : fallbackMessage(response.status),
    },
  };
}
