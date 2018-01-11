/* eslint-disable import/extensions */

import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import Webpack from 'webpack';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import PACKAGE from '../../package.json';

import LIB_CONFIG from '../lib/lib.config.js';
import LIB_PATHS from '../lib/paths.config.js';
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '../auth/auth0.config.js';

import {
  TARGET_ENV,
  ifDev,
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

  const FILE_LOADER_ASSETS_IMAGES = {
    test: /\.(gif|ico|jpg|jpeg|png|svg|webp)(\?.*)?$/,
    exclude: /node_modules/,
    use: [{
      loader: 'file-loader',
      options: {
        name: `${LIB_PATHS.STATIC_ASSETS_IMAGES}/[name].[hash:8].[ext]`
      }
    }]
  };

  /*
   * plugins
   */

  const BANNER_PLUGIN = new Webpack.BannerPlugin({
    banner: LIB_CONFIG.BANNER,
    entryOnly: true
  });

  const DEFINE_PLUGIN = new Webpack.DefinePlugin({
    __AUTH0_CLIENT_ID__: JSON.stringify(AUTH0_CLIENT_ID),
    __AUTH0_DOMAIN__: JSON.stringify(AUTH0_DOMAIN),
    __ENV_DEV__: JSON.stringify(isDev),
    __ENV_PROD__: JSON.stringify(isProd),
    __ENV_TEST__: JSON.stringify(isTest),
    __PACKAGE__: JSON.stringify(PACKAGE.name),
    __VERSION__: JSON.stringify(`v${PACKAGE.version}`)
  });

  const UGLIFY_PLUGIN = new UglifyJsPlugin();

  // https://github.com/moment/moment/issues/2373
  // https://stackoverflow.com/a/25426019/196921
  // https://github.com/facebookincubator/create-react-app/pull/2187
  const IGNORE_MOMENT_LOCALES = new Webpack.IgnorePlugin(/^\.\/locale$/, /moment$/);

  /*
   * base webpack config
   */

  return {
    bail: true,
    entry: [
      LIB_PATHS.ENTRY
    ],
    externals: ifDev(
      {},
      {
        lattice: 'lattice',
        immutable: 'immutable',
        // moment: 'moment',
        react: 'react',
        'react-dom': 'react-dom',
        'react-redux': 'react-redux',
        'react-router': 'react-router',
        'react-router-redux': 'react-router-redux',
        redux: 'redux',
        'redux-saga/effects': 'redux-saga/effects'
      }
    ),
    module: {
      rules: [
        BABEL_LOADER,
        FILE_LOADER_ASSETS_IMAGES
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
      IGNORE_MOMENT_LOCALES,
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
