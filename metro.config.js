const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// 1. Get the default config
const config = getDefaultConfig(__dirname);

// 2. Add 'wasm' to asset extensions to fix the expo-sqlite/web error
config.resolver.assetExts.push("wasm");

// 3. Export with NativeWind wrapper
module.exports = withNativeWind(config, { input: "./global.css" });
