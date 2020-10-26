const path = require('path');
const easywebpack = require('easywebpack-react');
const resolve = filepath => path.resolve(__dirname, filepath);
const alias = {
  '@element-react/react-dialog' : 'src/index.js'
};
const config = {
  entry:{
    include:['examples'],
    exclude:[]
  },
  target: 'web',
  framework: 'react',
  template: './view/template.html',
  alias,
  loaders: {
    less: true
  }
};

const res = easywebpack.getWebWebpackConfig(config);
console.log(res);

module.exports = config;
