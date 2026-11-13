<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

- Project structure: Explain app/ routes, components/, lib/server/, lib/validators/, and public/.
- Commands: Document pnpm install, pnpm dev, pnpm build, and pnpm lint.
- Code conventions: Follow surrounding TypeScript style; use PascalCase components and existing @/ imports.
- Access control: Document current supplier-only guards. Require server-side role and station checks when adding manager access.
- Backend integration: Reuse existing request helpers. Clearly distinguish real API operations from mock or local state.
- Verification: Run lint and build. No test script currently exists; record manual checks for affected flows.
- Security: Never commit secrets or expose session tokens. Keep ADMIN_MOCK_AUTH limited to local development.
- Commits and PRs: Follow <type>: <description>, with descriptions capped at 50 characters. Include validation results and screenshots for UI changes.
- Agent documentation: Preserve the generated Next.js block. Add your Context7 instructions so future sessions retain them.

Also fix contradictory commit examples in CONTRIBUTING.MD: several “bad” examples follow its stated convention.


## Project guide

- `app/` contains App Router routes. `(auth)` covers sign-in and recovery; `(dashboard)` contains supplier pages; `(manager)/sub` contains manager dashboard, orders, and inventory; `(focused)` contains focused setup flows.
- `components/` contains shared UI, supplier components in `admin/`, and manager components in `substation/`. Use PascalCase component names, surrounding TypeScript style, and existing `@/` imports.
- `lib/server/` contains authenticated backend requests and access guards. Reuse these request helpers for real API operations.
- `lib/validators/` contains input schemas. `public/` contains static assets served from the site root.
- Run `pnpm install` to install dependencies, `pnpm dev` for development, `pnpm build` for production validation, and `pnpm lint` for lint checks. No test script currently exists; record manual checks for affected flows.
- Supplier route layouts use server-side `requireAccess("supplier")`; manager routes use `requireAccess("manager")`. Verified profile roles determine access. Any manager data API must also verify the assigned station on the server; never trust a client station ID.
- `/sub/inventory` currently uses in-memory preview state, starting empty. Add, edit, remove, and availability changes do not call the backend and reset on refresh or unmount. `/sub/inventory?add=true` opens the reusable Add Product dialog from any link. Supplier inventory continues using its existing API reads.
- Never commit secrets or expose session tokens. Keep `ADMIN_MOCK_AUTH` restricted to local development.

## Context7 documentation

Use Context7 for library, framework, SDK, API, CLI, or cloud-service syntax, configuration, migrations, setup, and library-specific debugging. Start with `resolve-library-id` unless given an exact `/org/project` ID. Select the closest reputable match, then call `query-docs` for one specific concept at a time. Use separate queries for distinct concepts. Prefer Context7 over web search. General programming, business-logic debugging, code review, and refactoring do not require Context7.
