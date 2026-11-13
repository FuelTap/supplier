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
