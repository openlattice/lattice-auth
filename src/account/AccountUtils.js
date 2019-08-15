/*
 * @flow
 */

import Logger from '../utils/Logger';
import { ORGANIZATION_ID } from './AccountConstants';
import { getUserInfo } from '../auth/AuthUtils';
import { isNonEmptyObject, isNonEmptyString } from '../utils/LangUtils';
import type { UserInfo } from '../auth/AuthUtils';

const LOG = new Logger('AccountUtils');

function getStoredValues() :Object {

  let storedValues = {};
  const storedValuesStr :string = localStorage.getItem(ORGANIZATION_ID) || '';

  if (isNonEmptyString(storedValuesStr)) {
    try {
      const maybeStoredValues = JSON.parse(storedValuesStr);
      if (isNonEmptyObject(maybeStoredValues)) {
        storedValues = maybeStoredValues;
      }
    }
    catch (error) {
      LOG.warn('unable to parse JSON from value', storedValuesStr);
    }
  }

  return storedValues;
}

function storeOrganizationId(organizationId :string) {

  if (!isNonEmptyString(organizationId)) {
    throw new Error('organizationId must be a non-empty string');
  }

  const user :?UserInfo = getUserInfo();
  if (!user) {
    throw new Error('cannot store organization id without a valid login');
  }

  const { id } = user;
  if (!id) {
    throw new Error('cannot store organization id because the current user does not have a valid user id');
  }

  const storedValues = getStoredValues();
  const updatedStoredValues = { ...storedValues, [id]: organizationId };

  localStorage.setItem(ORGANIZATION_ID, JSON.stringify(updatedStoredValues));
}

function retrieveOrganizationId() :?UUID {

  const user :?UserInfo = getUserInfo();
  if (!user) {
    throw new Error('cannot retrieve organization id without a valid login');
  }

  const { id } = user;
  if (!id) {
    throw new Error('cannot retrieve organization id because the current user does not have a valid user id');
  }

  const storedValues :Object = getStoredValues();
  const storedOrganizationForUser :?UUID = storedValues[id] || null;

  return storedOrganizationForUser;
}

function clearOrganization() {

  const user :?UserInfo = getUserInfo();
  if (!user) {
    throw new Error('cannot clear organization id without a valid login');
  }

  const { id } = user;
  if (!id) {
    throw new Error('cannot clear organization id because the current user does not have a valid user id');
  }

  const storedValues :Object = getStoredValues();
  delete storedValues[id];

  localStorage.setItem(ORGANIZATION_ID, JSON.stringify(storedValues));
}

export {
  clearOrganization,
  retrieveOrganizationId,
  storeOrganizationId,
};
