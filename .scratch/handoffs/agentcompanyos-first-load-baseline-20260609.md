# AgentCompanyOS first-load performance baseline - 2026-06-09

Branch: `codex/brutal-slimming-20260606`

Baseline commit: `72117ff49b Remove Calls residual references`

Command:

```bash
cd /home/ziho/CodeXProject/mattermost-slimming-windows
source tools/agentcompanyos-slimming-env.sh
cd webapp/channels
npm run build
```

Build result:

- `webpack 5.103.0 compiled with 74 warnings`
- Warnings are the existing MUI styled-engine export warning, Sass deprecations, CSS order warnings, and asset size warnings.
- Docker was not available in WSL and was not used for this baseline.

Dist counts:

- `webapp/channels/dist`: `126M`
- JS files at dist root: `250`
- CSS files at dist root: `39`
- i18n JSON files: `62`
- emoji PNG files: `3306`

Largest JS/CSS assets at dist root:

```text
3674054 webapp/channels/dist/148.08913916feb75f87e5ce.js
2111642 webapp/channels/dist/2232.03c4cbe69c2260d4d7cf.js
1727324 webapp/channels/dist/6069.2f03f0670bc3118cebbf.js
1709561 webapp/channels/dist/5414.d7325913a12950b95816.js
1652078 webapp/channels/dist/1959.407c8b23a8cad4544fae.js
1297276 webapp/channels/dist/1548.898dd962779eeb840155.js
1215009 webapp/channels/dist/4502.f65fd022e035c60dad19.js
684086 webapp/channels/dist/editor.worker.js
637730 webapp/channels/dist/9229.67f9d64e06956e800171.js
605070 webapp/channels/dist/6838.af2c9e353ad27a36cf5f.css
326821 webapp/channels/dist/1965.12ad0d6d3b1aaac841d7.js
265966 webapp/channels/dist/3076.40c97a2d130aac0b0d00.js
```

Largest i18n assets:

```text
782920 webapp/channels/dist/i18n/be.8d83602c9d79c2bcf68b.json
706303 webapp/channels/dist/i18n/uk.40f9b6398769fea5c083.json
687179 webapp/channels/dist/i18n/ru.d5fd1555b7f6d5a3751c.json
635763 webapp/channels/dist/i18n/ja.8ca671c61af3871749e5.json
626553 webapp/channels/dist/i18n/de.ca461522b627cbf79c5c.json
613449 webapp/channels/dist/i18n/nl.aabbd66bef089df6b977.json
613434 webapp/channels/dist/i18n/pl.ff4a043c86ce32a8ab6d.json
562297 webapp/channels/dist/i18n/tr.2ed0016ebf7fff25590b.json
557773 webapp/channels/dist/i18n/ko.f6bdf3096ee835dec65a.json
555218 webapp/channels/dist/i18n/en-AU.642016de408ce8b477fc.json
548821 webapp/channels/dist/i18n/bg.77a2a79f06743f5b2846.json
541296 webapp/channels/dist/i18n/sv.17c7e0946353a78c1c6f.json
```

Next performance targets:

- Reduce emoji payload first; it is 3306 PNG files in the build output.
- Reduce shipped i18n/locales, or defer non-default locales if product requirements allow.
- Inspect the largest numbered JS chunks before changing lazy-load boundaries.
- Check whether `@mattermost/compass-icons` imports remain tree-shaken or pull in a broad icon surface.
- Check whether crypto/browser polyfills are still in first-load chunks.
- Defer non-essential startup requests for drafts, threads, stats, agent status, and plugin webapp surfaces where safe.
