module.exports = function (api) {
  api.cache(true);
  return {
    // Use NativeWind / react-native-css-interop as a *preset*,
    // not a plugin – it returns an object with its own plugins array.
    presets: ['babel-preset-expo', 'nativewind/babel'],
  };
};



