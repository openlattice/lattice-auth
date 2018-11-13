/*
 * @flow
 */

import { ORGANIZATION_ID } from './AccountConstants';
import { getUserInfo } from '../auth/AuthUtils';
import { isNonEmptyObject, isNonEmptyString } from '../utils/LangUtils';

function getStoredValues() :Object {

  let storedValues = {};
  const storedValuesStr :string = localStorage.getItem(ORGANIZATION_ID) || '';

  if (isNonEmptyString(storedValuesStr)) {
    const maybeStoredValues = JSON.parse(storedValuesStr);
    if (isNonEmptyObject(maybeStoredValues)) {
      storedValues = maybeStoredValues;
    }
  }

  return storedValues;
}

export function storeOrganizationId(organizationId :string) {

  if (!isNonEmptyString(organizationId)) {
    throw new Error('Error: organizationId must be a non-empty string');
  }

  const user :?UserInfo = getUserInfo();
  if (!user) {
    throw new Error('Error: cannot store organization id without a valid login.');
  }

  const { id } = user;
  if (!id) {
    throw new Error('Error: cannot store organization id because the current user does not have a valid user id.');
  }

  const storedValues = getStoredValues();
  const updatedStoredValues = Object.assign({}, storedValues, {
    [id]: organizationId
  });

  localStorage.setItem(ORGANIZATION_ID, JSON.stringify(updatedStoredValues));
}

export function retrieveOrganizationId() :?UUID {

  const user :?UserInfo = getUserInfo();
  if (!user) {
    throw new Error('Error: cannot retrieve organization id without a valid login.');
  }

  const { id } = user;
  if (!id) {
    throw new Error('Error: cannot retrieve organization id because the current user does not have a valid user id.');
  }

  const storedValues :Object = getStoredValues();
  const storedOrganizationForUser :?UUID = storedValues[id] || null;

  return storedOrganizationForUser;
}

export function clearOrganization() {

  const user :?UserInfo = getUserInfo();
  if (!user) {
    throw new Error('Error: cannot clear organization id without a valid login.');
  }

  const { id } = user;
  if (!id) {
    throw new Error('Error: cannot clear organization id because the current user does not have a valid user id.');
  }

  const storedValues :Object = getStoredValues();
  delete storedValues[id];

  localStorage.setItem(ORGANIZATION_ID, JSON.stringify(storedValues));
}
