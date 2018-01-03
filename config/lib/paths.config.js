/* eslint-disable import/extensions */

import path from 'path';

import LIB_CONFIG from './lib.config.js';

const ROOT = path.resolve(__dirname, '../..');

const BUILD = path.resolve(ROOT, 'build');
const NODE = path.resolve(ROOT, 'node_modules');
const SOURCE = path.resolve(ROOT, 'src');

const ENTRY = path.resolve(SOURCE, LIB_CONFIG.ENTRY_FILE_NAME);

const STATIC = 'static';
const STATIC_ASSETS = path.join(STATIC, 'assets');
const STATIC_ASSETS_IMAGES = path.join(STATIC_ASSETS, 'images');

export default {
  BUILD,
  ENTRY,
  NODE,
  SOURCE,
  STATIC_ASSETS_IMAGES
};
