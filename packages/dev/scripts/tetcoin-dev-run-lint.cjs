#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const argv = require('yargs')
  .options({
    'skip-eslint': {
      description: 'Skips running eslint',
      type: 'boolean'
    },
    'skip-tsc': {
      description: 'Skips running tsc',
      type: 'boolean'
    }
  })
  .strict()
  .argv;

const execSync = require('./execSync.cjs');

console.log('$ tetcoin-dev-run-lint', process.argv.slice(2).join(' '));

if (!argv['skip-eslint']) {
  // We don't want to run with fix on CI
  const extra = process.env.GITHUB_REPOSITORY
    ? ''
    : '--fix';

  execSync(`yarn tetcoin-exec-eslint ${extra} --resolve-plugins-relative-to ${__dirname} --ext .js,.cjs,.mjs,.ts,.tsx ${process.cwd()}`);
}

if (!argv['skip-tsc']) {
  execSync('yarn tetcoin-exec-tsc --noEmit --pretty');
}
