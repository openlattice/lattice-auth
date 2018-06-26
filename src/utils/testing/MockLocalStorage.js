/*
 * @flow
 */

import { Map } from 'immutable';

let storage :Map<*, *> = Map();

function clear() :void {
  storage = storage.clear();
}

function getItem(key :any) :any {
  return storage.get(key, null);
}

function removeItem(key :any) :void {
  storage = storage.delete(key);
}

function setItem(key :any, value :any) :void {
  storage = storage.set(key, value);
}

function size() :number {
  return storage.size;
}

function initialize() :void {

  global.localStorage = {
    clear,
    getItem,
    removeItem,
    setItem
  };
}

// initialize here once so that localStorage is defined before tests are loaded
initialize();

export default {
  clear,
  getItem,
  initialize,
  removeItem,
  setItem,
  size
};
