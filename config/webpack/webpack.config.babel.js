/* eslint-disable import/extensions */

import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import Webpack from 'webpack';

import PACKAGE from '../../package.json';

import LIB_CONFIG from '../lib/lib.config.js';
import LIB_PATHS from '../lib/paths.config.js';

import {
  TARGET_ENV,
  ifMin,
  isDev,
  isProd,
  isTest
} from '../lib/env.config.js';

export default function webpackConfig() {

  /*
   * loaders
   */

  const BABEL_LOADER = {
    test: /\.js$/,
    exclude: /node_modules/,
    include: [
      LIB_PATHS.SOURCE
    ],
    use: ['babel-loader']
  };

  /*
   * plugins
   */

  const BANNER_PLUGIN = new Webpack.BannerPlugin({
    banner: LIB_CONFIG.BANNER,
    entryOnly: true
  });

  const DEFINE_PLUGIN = new Webpack.DefinePlugin({
    __DEV__: JSON.stringify(isDev),
    __PROD__: JSON.stringify(isProd),
    __TEST__: JSON.stringify(isTest),
    __VERSION__: JSON.stringify(`v${PACKAGE.version}`)
  });

  const UGLIFY_PLUGIN = new UglifyJsPlugin();

  /*
   * base webpack config
   */

  return {
    bail: true,
    entry: [
      LIB_PATHS.ENTRY
    ],
    module: {
      rules: [
        BABEL_LOADER
      ]
    },
    output: {
      library: LIB_CONFIG.LIB_NAMESPACE,
      libraryTarget: 'umd',
      path: LIB_PATHS.BUILD,
      publicPath: '/',
      filename: ifMin(
        `${LIB_CONFIG.LIB_FILE_NAME}.min.js`,
        `${LIB_CONFIG.LIB_FILE_NAME}.js`
      )
    },

    performance: {
      hints: false // disable performance hints for now
    },
    plugins: [
      DEFINE_PLUGIN,
      BANNER_PLUGIN,
      ...ifMin([UGLIFY_PLUGIN], [])
    ],
    resolve: {
      extensions: ['.js'],
      modules: [
        LIB_PATHS.SOURCE,
        LIB_PATHS.NODE
      ]
    },
    target: TARGET_ENV
  };
}
