#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const babel = require('@babel/cli/lib/babel/dir').default;
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const copySync = require('./copySync.cjs');
const execSync = require('./execSync.cjs');

const CPX = ['css', 'gif', 'hbs', 'jpg', 'js', 'json', 'png', 'svg', 'd.ts'].map((e) => `src/**/*.${e}`);

console.log('$ polkadot-dev-build-ts', process.argv.slice(2).join(' '));

function buildWebpack () {
  execSync('yarn polkadot-exec-webpack --config webpack.config.js --mode production');
}

async function buildBabel (dir) {
  await Promise.all(
    ['cjs', 'esm'].map(async (type) => {
      const buildDir = `build/${type}`;
      const outDir = path.join(process.cwd(), buildDir);

      await babel({
        babelOptions: {
          configFile: `@polkadot/dev/config/babel-config-${type}.cjs`
        },
        cliOptions: {
          extensions: ['.ts', '.tsx'],
          filenames: ['src'],
          ignore: '**/*.d.ts',
          outDir,
          outFileExtension: '.js'
        }
      });

      fs.writeFileSync(path.join(outDir, 'package.json'), `{"type":"${type === 'cjs' ? 'commonjs' : 'module'}"}`);

      [...CPX]
        .concat(`../../build/${dir}/src/**/*.d.ts`, `../../build/packages/${dir}/src/**/*.d.ts`)
        .forEach((src) => copySync(src, buildDir));
    })
  );

  copySync('package.json', 'build');
}

async function buildJs (dir) {
  if (!fs.existsSync(path.join(process.cwd(), '.skip-build'))) {
    const { name, version } = require(path.join(process.cwd(), './package.json'));

    if (!name.startsWith('@polkadot/')) {
      return;
    }

    console.log(`*** ${name} ${version}`);

    mkdirp.sync('build');

    if (fs.existsSync(path.join(process.cwd(), 'public'))) {
      buildWebpack(dir);
    } else {
      await buildBabel(dir);
    }

    console.log();
  }
}

async function main () {
  execSync('yarn polkadot-dev-clean-build');

  process.chdir('packages');

  execSync('yarn polkadot-exec-tsc --emitDeclarationOnly --outdir ../build');

  const dirs = fs
    .readdirSync('.')
    .filter((dir) => fs.statSync(dir).isDirectory() && fs.existsSync(path.join(process.cwd(), dir, 'src')));

  for (const dir of dirs) {
    process.chdir(dir);

    await buildJs(dir);

    process.chdir('..');
  }

  process.chdir('..');
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
