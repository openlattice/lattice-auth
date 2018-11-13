/*
 * @flow
 */

import * as AccountUtils from './AccountUtils';
import { randomId } from '../utils/Utils';

import { ORGANIZATION_ID } from './AccountConstants';
import { AUTH0_USER_INFO } from '../auth/AuthConstants';

const MOCK_USER_ID = randomId();
const MOCK_ORG_ID = randomId();

const MOCK_USER_INFO = JSON.stringify({
  id: MOCK_USER_ID
});

const MOCK_STORED_ORGS = JSON.stringify({
  [MOCK_USER_ID]: MOCK_ORG_ID
});

describe('AccountUtils', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  describe('retrieveOrganizationId()', () => {

    test('should throw if there is no user info in localStorage', () => {
      expect(() => AccountUtils.retrieveOrganizationId()).toThrow();
    });

    test('should return null if there is no organization id stored for the current user', () => {
      localStorage.setItem(AUTH0_USER_INFO, JSON.stringify({ id: randomId() }));
      expect(AccountUtils.retrieveOrganizationId()).toBeNull();
    });

    test('should return null if localStorage parameter has not been set', () => {
      localStorage.setItem(AUTH0_USER_INFO, MOCK_USER_INFO);
      expect(AccountUtils.retrieveOrganizationId()).toBeNull();
    });

    test('should correctly return stored organization id for user', () => {
      localStorage.setItem(AUTH0_USER_INFO, MOCK_USER_INFO);
      localStorage.setItem(ORGANIZATION_ID, MOCK_STORED_ORGS);
      expect(AccountUtils.retrieveOrganizationId()).toEqual(MOCK_ORG_ID);
    });
  });

  describe('storeOrganizationId()', () => {

    test('should throw if organizationId parameter is not passed', () => {
      localStorage.setItem(AUTH0_USER_INFO, MOCK_USER_INFO);
      expect(() => AccountUtils.storeOrganizationId()).toThrow();
    });

    test('should throw if there is no user info in localStorage', () => {
      expect(() => AccountUtils.storeOrganizationId(MOCK_ORG_ID)).toThrow();
    });

    test('should store organization id for current user', () => {
      localStorage.setItem(AUTH0_USER_INFO, MOCK_USER_INFO);
      AccountUtils.storeOrganizationId(MOCK_ORG_ID);
      expect(JSON.parse(localStorage.getItem(ORGANIZATION_ID))[MOCK_USER_ID]).toEqual(MOCK_ORG_ID);
    });

  });

  describe('clearOrganization()', () => {

    test('should throw if there is no user info in localStorage', () => {
      expect(() => AccountUtils.clearOrganization()).toThrow();
    });

    test('should remove stored organizations for current user from localStorage', () => {
      localStorage.setItem(AUTH0_USER_INFO, MOCK_USER_INFO);
      AccountUtils.storeOrganizationId(MOCK_ORG_ID);
      AccountUtils.clearOrganization();
      expect(JSON.parse(localStorage.getItem(ORGANIZATION_ID))[MOCK_USER_ID]).toBeUndefined();
    });

  });

});
