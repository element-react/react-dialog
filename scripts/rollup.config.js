
// Rollup plugins
// const buble = require('rollup-plugin-buble');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const postcss = require('rollup-plugin-postcss');
const path = require('path');
const replace = require('rollup-plugin-replace');
const  globals = require('rollup-plugin-node-globals');

// PostCSS plugins
const cssnext = require('postcss-cssnext');
const cssnano = require('cssnano');
const version = process.env.VERSION || require('../package.json').version;
let env = process.env.NODE_ENV;
// 找不到env就认为是开发环境
if (!env) {
  env = process.env.NODE_ENV = 'development';
}
const isProduct = env === 'production';

const banner =
    '/*!\n' +
    ' * dialog.js v' + version + '\n' +
    ' * (c) 2019-' + new Date().getFullYear() + ' jianxcao@126.com\n' +
    ' * Released under the MIT License.\n' +
    ' */';

const basePath = path.resolve(__dirname, '../');
const distBasePath = path.resolve(basePath, 'dist');

const getCssPlugin = function () {
  return postcss({
    plugins: [
      cssnext({ warnForDuplicates: false }),
      cssnano()
    ],
    extract: `${distBasePath}/dialog.css`,
    extensions: ['.css', '.less']
  });
};

function getBuild () {
  const plugins = [];
  const outputFile = {
    globals: {
      'react': 'React'
    },
    name: 'dialog',
    banner,
    extend: true,
    paths: {
      react: 'react'
    },
    sourceMap: !isProduct
  };
  const build = {
    input: `${basePath}/src/index.js`,
    output: [['umd', ''], ['esm', 'ems'], ['cjs', 'common']].map(cur => {
      return Object.assign({}, outputFile, {
        format: cur[0],
        exports: 'named',
        file: `${distBasePath}/dialog${cur[1] ? '.' + cur[1] : ''}.js`
      });
    }),
    external: [
      'react'
    ],
    plugins,
    cssPlugin: getCssPlugin()
  };
  return build;
}


function genConfig (opts) {
  const config = {
    input: opts.input,
    output: opts.output,
    external: opts.external,
    plugins: [
      babel({
        babelrc: false,
        runtimeHelpers: false,
        exclude: 'node_modules/**',
        presets: [['@babel/preset-env', {
          'targets' : {
            'browsers':  ['> 1%', 'last 2 versions', 'iOS >= 8', 'Android >= 4', 'Explorer >= 8', 'Firefox >= 43', 'Chrome >= 45']
          },
          modules: false
        }], '@babel/preset-react'],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          ['@babel/plugin-proposal-decorators', { 'legacy': true }],
          '@babel/plugin-proposal-export-namespace-from',
          '@babel/plugin-proposal-function-sent',
          '@babel/plugin-proposal-json-strings',
          '@babel/plugin-proposal-numeric-separator',
          '@babel/plugin-proposal-throw-expressions',
          '@babel/plugin-syntax-dynamic-import',
          '@babel/plugin-syntax-import-meta',
          ['@babel/plugin-transform-runtime', {
            'absoluteRuntime': false,
            corejs: false,
            helpers: false
          }]
        ]
      }),      
      commonjs(),
      resolve({ jsnext: true, main: true, browser: true }),
      opts.cssPlugin,
      // buble({
      //   transforms: {
      //     dangerousForOf: true,
      //     dangerousTaggedTemplateString: true,
      //     generator: false,
      //     asyncAwait: false
      //   }
      // }),
      globals()
    ].concat(opts.plugins || [])
  };

  if (opts.env) {
    config.plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }));
  }
  return config;
}
module.exports = genConfig(getBuild());
