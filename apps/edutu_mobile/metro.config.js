const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// 🔥 HARD BLOCK ws
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  ws: require.resolve("./empty.js"),
};

module.exports = withNativeWind(config, { input: "./global.css" });