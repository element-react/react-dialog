
// Rollup plugins
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const html = require('rollup-plugin-bundle-html');
const commonjs = require('rollup-plugin-commonjs');
const postcss = require('rollup-plugin-postcss');
const path = require('path');
const serve = require('rollup-plugin-serve');
// PostCSS plugins
const cssnext = require('postcss-cssnext');
const cssnano = require('cssnano');

const basePath = path.resolve(__dirname, '../');
const distBasePath = path.resolve(basePath, 'dist');

const getCssPlugin = function () {
  return postcss({
    plugins: [
      cssnext({ warnForDuplicates: false }),
      cssnano()
    ],
    extract: `${distBasePath}/demo.css`,
    extensions: ['.css', '.less']
  });
};

function genConfig () {
  const config = {
    input: `${basePath}/examples/index.js`,
    output: {
      name: 'demo',
      format: 'iife',
      file: `${basePath}/dist/examples/index.js`
    },
    plugins: [
      resolve({ jsnext: true, main: true, browser: true }),
      commonjs(),
      babel({
        babelrc: false,
        runtimeHelpers: true,
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
            corejs: 2,
            helpers: true
          }]
        ]
      }),
      serve({
        contentBase: ['dist'],
        port: 9002,
        open: true,
        openPage: '/examples/index.html'
      }),
      html({
        template: 'view/template.html',
        dest: 'dist/examples',
        filename: 'index.html',
        inject: 'head'
      }),
      getCssPlugin()
    ]
  };
  return config;
}
module.exports = genConfig();
// console.log(genConfig());
