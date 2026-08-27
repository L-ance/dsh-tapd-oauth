#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'

const packageName = 'dsh-tapd-mcp'
const target = new URL('../lib/client.js', import.meta.url)
const code = readFileSync(target, 'utf8')
const indented = code.split('\n').map(line => `\t${line}`).join('\n')

const wrapped = `window.__ModuleLoader__.load({
\tid: ${JSON.stringify(packageName)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${indented}
\t\treturn module.exports;
\t}
});
`

writeFileSync(target, wrapped)
