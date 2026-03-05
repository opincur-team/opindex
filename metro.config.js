const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add Node.js polyfills like the example project
config.resolver.extraNodeModules = {
  crypto: require.resolve("crypto-browserify"),
  stream: require.resolve("stream-browserify"),
  buffer: require.resolve("buffer"),
  process: require.resolve("process"),
  assert: require.resolve("assert"),
  events: require.resolve("events"),
};

// Make Buffer available globally
config.resolver.alias = {
  ...config.resolver.alias,
  buffer: 'buffer',
};

module.exports = config;