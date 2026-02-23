/**
 * @type {Record<string, string | string[] | ((filenames: string[]) => string | string[] | Promise<string | string[]>)>}
 */
export default {
  'packages/**/*.{ts,js,cjs,mjs,json,md,html,css,scss}': ['vitest related --run --silent=true'],
  '*.{js,cjs,mjs,ts,cts,mts}': ['eslint --cache --fix'],
  '*.{js,cjs,mjs,ts,cts,mts,json,yml,yaml,md}': ['cspell lint --no-progress --no-summary --no-must-find-files'],
  '*': (files) => [
    // Spell check file names
    `sh -c 'echo "${files.join('\n')}" | cspell --show-context stdin'`,
    `prettier --write --ignore-unknown ${files.join(' ')}`,
    `secretlint ${files.join(' ')}`,
  ],
};
