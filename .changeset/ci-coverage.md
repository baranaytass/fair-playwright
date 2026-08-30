---
'fair-playwright': patch
---

Test the Playwright compatibility range that package.json promises.

`peerDependencies` claims `@playwright/test >=1.40.0`, but integration tests only
ever ran against one version. CI now runs them against the floor of that range
(1.40.0), a recent stable (1.49.1) and `latest`.

Deliberately failing demo specs moved to `*.failing.spec.ts` and are excluded
from the default run, so the integration suite exits 0 and CI can actually go
green. Run them on purpose with `npm run test:failing`.
