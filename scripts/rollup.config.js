
// Rollup plugins
const buble = require('rollup-plugin-buble');
const cjs = require('rollup-plugin-cjs-es');
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
      'react': 'React',
      'react-dom': 'ReactDOM',
      'prop-types': 'PropTypes',
      'classnames': 'classNames'
    },
    name: 'dialog',
    banner,
    extend: true,
    sourceMap: !isProduct
  };
  const build = {
    input: `${basePath}/src/index.js`,
    output: [['umd', ''], ['esm', 'esm'], ['cjs', 'common']].map(cur => {
      return Object.assign({}, outputFile, {
        format: cur[0],
        exports: 'named',
        file: `${distBasePath}/dialog${cur[1] ? '.' + cur[1] : ''}.js`
      });
    }),
    watch: {
      clearScreen: false,
      watch: {
        exclude: 'node_modules/**'
      }
    },
    external: [
      'react',
      'react-dom',
      'prop-types',
      'classnames'
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
      opts.cssPlugin,
      buble({
        'objectAssign': 'Object.assign',
        transforms: {
          dangerousForOf: true,
          dangerousTaggedTemplateString: true,
          generator: false,
          asyncAwait: false
        }
      }),
      cjs({
        nested: true
      }),
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
