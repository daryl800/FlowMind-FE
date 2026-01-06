const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    // For GitHub Pages deployment
    config.output = {
        ...config.output,
        publicPath: '/FlowMind-FE/'
    };

    return config;
};