/*
 * @flow
 */

/* eslint-disable import/prefer-default-export */

function genRandomString() :string {

  return Math.random().toString(36).slice(2);
}

export {
  genRandomString,
};
