const fs = require('fs');
const rollup = require('rollup');

const demo =  require('./rollup.config.demo');
const config =  require('./rollup.config');

module.exports = [
  demo, config
];

// if (!fs.existsSync('../dist')) {
//   fs.mkdirSync('../dist');
// }

// function buildEntry (config) {
//   return rollup.rollup(config)
//     .then(bundle => bundle.write(config))
//     .catch(err => console.error(err));
// }

// buildEntry(config);
