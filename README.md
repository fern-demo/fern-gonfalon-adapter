# Fern Gonfalon Adapter

Fern Docs will fetch the LDClient context from a single endpoint.

Gonfalon exposes 2 endpoints:

- `/internal/docs/context/anonymous` - used when the user is not authenticated
- `/internal/docs/context/authenticated` - used when the user is authenticated (requires `ldso` cookie)

In LD's gatsby docs repo, there is "business logic" implemented that determines which endpoint to use based on the user's authentication status, and then mutates the final context object with context from the docs itself.

This adapter attempts to replicate that logic, inside a single function (endpoint), so that fern docs can fetch the context from a single endpoint and does not need to inline the gonfalon-specific business logic.

The original source files that were reproduced in this adapter are:

- https://github.com/launchdarkly/ld-docs-private/blob/main/src/utils/secureMode/getGonfalonContext.ts
- https://github.com/launchdarkly/ld-docs-private/blob/main/src/utils/secureMode/initGonfalonSecureMode.ts
- https://github.com/launchdarkly/ld-docs-private/blob/main/src/utils/secureMode/types.ts
- https://github.com/launchdarkly/ld-docs-private/blob/main/src/utils/secureMode/utils.ts
- https://github.com/launchdarkly/ld-docs-private/blob/main/src/hooks/secureMode/useSecureLDClient.ts
- https://github.com/launchdarkly/ld-docs-private/blob/main/src/hooks/secureMode/useGonfalonContext.ts
- https://github.com/launchdarkly/ld-docs-private/blob/main/src/hooks/secureMode/useInitGonfalonSecureMode.ts
- https://github.com/launchdarkly/ld-docs-private/blob/main/src/utils/loginAndLogoutUtils.ts#L5-L46

(all these files are copied into this repo and refactored to avoid using react hooks, so that they can be run server-side)

---

- This adapter is written to run in a cloudflare worker, but can be run in any edge environment, as long as latency is minimal.
- The endpoint must be deployed in a .launchdarkly.com subdomain, to support sending cookies between fern docs and the adapter (cookies cannot be sent cross-origin).
