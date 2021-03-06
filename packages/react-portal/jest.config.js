const { createConfig } = require('@fluentui/scripts/jest/jest-resources');
const path = require('path');

const config = createConfig({
  moduleNameMapper: require('lerna-alias').jest(),
  setupFiles: [path.resolve(path.join(__dirname, 'config', 'tests.js'))],
  snapshotSerializers: ['@fluentui/jest-serializer-make-styles'],
});

module.exports = config;
