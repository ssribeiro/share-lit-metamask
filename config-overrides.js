const webpack = require("webpack");

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    vm: require.resolve("vm-browserify"),
    buffer: require.resolve("buffer"),
    // "@walletconnect/jsonrpc-ws-connection": require.resolve(
    //   "@walletconnect/jsonrpc-ws-connection"
    // ),
    // "@walletconnect/jsonrpc-utils": require.resolve(
    //   "@walletconnect/jsonrpc-utils"
    // ),
    // "@walletconnect/heartbeat": require.resolve("@walletconnect/heartbeat"),
    // "@walletconnect/events": require.resolve("@walletconnect/events"),
    // "@walletconnect/environment": require.resolve("@walletconnect/environment"),
    // "@walletconnect/jsonrpc-provider": require.resolve(
    //   "@walletconnect/jsonrpc-provider"
    // ),
    // "@walletconnect/core": require.resolve("@walletconnect/core"),
    // "@walletconnect/ethereum-provider": require.resolve(
    //   "@walletconnect/ethereum-provider"
    // ),
    // core: require.resolve("@lit-protocol/core"),
    // "contracts-sdk": require.resolve("@lit-protocol/contracts-sdk"),
    // "@lit-protocol/contracts-sdk": require.resolve(
    //   "@lit-protocol/contracts-sdk"
    // ),
    // constants: require.resolve("@lit-protocol/constants"),
    // "auth-helpers": require.resolve("@lit-protocol/auth-helpers"),
    // "access-control-conditions": require.resolve(
    //   "@lit-protocol/access-control-conditions"
    // ),
    // "@lit-protocol/lit-node-client": require.resolve(
    //   "@lit-protocol/lit-node-client"
    // ),
    // "@lit-protocol/lit-node-client-nodejs": require.resolve(
    //   "@lit-protocol/lit-node-client-nodejs"
    // ),
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    })
  );
  return config;
};
