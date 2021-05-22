// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  exclude: '**/*+(index|e2e|spec|types).ts',
  excludeExternals: true,
  excludeNotExported: true,
  excludePrivate: true,
  excludeProtected: true,
  hideGenerator: true,
  includeDeclarations: false,
  module: 'commonjs',
  moduleResolution: 'node',
  name: 'tetcoin{.js}',
  out: 'docs',
  stripInternal: 'true',
  theme: 'markdown'
};
