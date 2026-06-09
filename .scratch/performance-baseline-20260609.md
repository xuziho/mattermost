# AgentCompanyOS Webapp Performance Baseline - 2026-06-09

Branch: `codex/brutal-slimming-20260606`

Source path:

```bash
cd /home/ziho/CodeXProject/mattermost-slimming-windows
source tools/agentcompanyos-slimming-env.sh
cd webapp/channels
npm run build
```

Build result:

- Webpack compiled successfully.
- Warning count: 74.
- Entrypoint `main`: 21.6 KiB, made of `main.ed93b3bed01cbe431f53.css` 3.61 KiB and `main.1e368610f760eb55dee2.js` 18 KiB.
- Entrypoint `mattermost_webapp`: 18.4 KiB, made of `remote_entry.js?bt=1781006624056`.
- Built modules: 34.5 MiB JavaScript, 1.47 MiB CSS, 14.5 MiB asset.
- Asset status summary from webpack: 40.9 MiB cached assets, 505 assets.

Dist asset counts and byte totals:

- JavaScript files: 250 files, 18,783,852 bytes.
- CSS files: 43 files, 1,605,400 bytes.
- i18n JSON files: 62 files, 14,853,080 bytes.
- Emoji PNG files: 3,306 files, 17,845,631 bytes.
- Total `webapp/channels/dist` bytes: 121,424,070 bytes.

Largest emitted assets:

| Bytes | Asset |
| ---: | --- |
| 4,868,073 | `files/9ea8998d9c0389f02c43.png` |
| 3,674,054 | `148.08913916feb75f87e5ce.js` |
| 2,111,642 | `2232.03c4cbe69c2260d4d7cf.js` |
| 1,723,317 | `6069.5124cde847943827dc42.js` |
| 1,709,309 | `5414.86dac47bd9d7981141a1.js` |
| 1,652,078 | `1959.407c8b23a8cad4544fae.js` |
| 1,247,385 | `4965.f240c46ca05a2fd650c2.js` |
| 1,215,009 | `4502.f65fd022e035c60dad19.js` |
| 782,611 | `i18n/be.cfe58a20ace0db46ea5d.json` |
| 706,135 | `i18n/uk.70d0d6ef7a3286694a7b.json` |
| 687,011 | `i18n/ru.fd50347749cb89c9dbf1.json` |
| 684,086 | `editor.worker.js` |
| 637,730 | `9229.67f9d64e06956e800171.js` |
| 635,595 | `i18n/ja.8f2c024766a49310ae20.json` |
| 626,385 | `i18n/de.0c6cda993eb5b33a286a.json` |
| 613,286 | `i18n/nl.79b6c12a6acd126a4d34.json` |
| 613,266 | `i18n/pl.d5e78e170ac4275f52a3.json` |
| 605,070 | `6838.af2c9e353ad27a36cf5f.css` |

Next slimming targets suggested by this baseline:

- Emoji payload: 3,306 PNG files and 17.85 MB in `dist/emoji`.
- i18n payload: 62 locale JSON files and 14.85 MB total; many individual locale files exceed 500 KiB.
- Large async JavaScript chunks: `148`, `2232`, `6069`, `5414`, `1959`, `4965`, and `4502`.
- Large static assets: `files/9ea8998d9c0389f02c43.png` and `files/0e266bf6f9d07469ad71.svg`.
- Existing warnings are mostly Sass deprecation, CSS order, MUI styled-engine export, and asset-size warnings; future changes should not increase the warning count.

## After Emoji Payload Cut

Commit scope: stop copying the full static system emoji PNG directory and render system emoji image URLs as inline SVG data URLs. Custom emoji still use the API image route.

Build result:

- Webpack compiled successfully.
- Warning count: 74.
- Entrypoint `main`: 21.6 KiB, made of `main.ed93b3bed01cbe431f53.css` 3.61 KiB and `main.2a9bb695e34d62199ff8.js` 18 KiB.
- Entrypoint `mattermost_webapp`: 18.4 KiB, made of `remote_entry.js?bt=1781007127443`.

Dist asset counts and byte totals:

- JavaScript files: 250 files, 18,784,084 bytes.
- CSS files: 43 files, 1,605,400 bytes.
- i18n JSON files: 62 files, 14,853,080 bytes.
- Emoji PNG files: 0 files, 0 bytes.
- Total `webapp/channels/dist` bytes: 103,579,255 bytes.

Measured reduction:

- Total `dist` reduction: 17,844,815 bytes.
- Emoji PNG reduction: 3,306 files and 17,845,631 bytes.
- JavaScript delta: +232 bytes from the inline SVG URL helper.
- CSS delta: 0 bytes.
- Warning delta: 0.

## After Moment Locale Cut

Commit scope: ignore Moment's bundled locale context during webpack builds. This keeps `moment` and `moment-timezone` available while avoiding automatic inclusion of the full Moment locale set.

Build result:

- Webpack compiled successfully.
- Warning count: 74.
- Entrypoint `main`: 21.6 KiB, made of `main.ed93b3bed01cbe431f53.css` 3.61 KiB and `main.77faa989f4e524de16b9.js` 18 KiB.
- Entrypoint `mattermost_webapp`: 18.4 KiB, made of `remote_entry.js?bt=1781007386191`.

Dist asset counts and byte totals:

- JavaScript files: 250 files, 18,541,223 bytes.
- CSS files: 43 files, 1,605,400 bytes.
- i18n JSON files: 62 files, 14,853,080 bytes.
- Emoji PNG files: 0 files, 0 bytes.
- Total `webapp/channels/dist` bytes: 102,630,091 bytes.

Measured reduction from the previous emoji-cut build:

- Total `dist` reduction: 949,164 bytes.
- JavaScript reduction: 242,861 bytes.
- CSS delta: 0 bytes.
- Warning delta: 0.
