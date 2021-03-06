let path = require('path');
let { createConfig } = require('@fluentui/scripts/jest/jest-resources');
module.exports = createConfig({
  moduleNameMapper: require('lerna-alias').jest(),
  setupFiles: [path.resolve(path.join(__dirname, 'config', 'tests.js'))],
});
