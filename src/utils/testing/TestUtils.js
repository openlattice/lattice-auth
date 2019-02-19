/*
 * @flow
 */

/* eslint-disable import/prefer-default-export */

const OBJECT_TAG :string = '[object Object]';

function genRandomString() :string {

  return Math.random().toString(36).slice(2);
}

export {
  OBJECT_TAG,
  genRandomString,
};
