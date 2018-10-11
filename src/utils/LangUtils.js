/*
 * @flow
 */

import isEmpty from 'lodash/isEmpty';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import trim from 'lodash/trim';

function isNonEmptyObject(value :any) :boolean {

  return isPlainObject(value) && !isEmpty(value);
}

function isNonEmptyString(value :any) :boolean {

  return isString(value) && !isEmpty(trim(value));
}

export {
  isNonEmptyObject,
  isNonEmptyString,
};
