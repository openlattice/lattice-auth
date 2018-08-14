/*
 * @flow
 */

import jwt from 'jsonwebtoken';
import moment from 'moment';

import * as AuthUtils from './AuthUtils';
import { randomId } from '../utils/Utils';

import {
  INVALID_PARAMS,
  INVALID_PARAMS_NOT_DEFINED_ALLOWED,
  INVALID_SS_PARAMS
} from '../utils/testing/Invalid';

import {
  ADMIN_ROLE,
  AUTH0_ID_TOKEN,
  AUTH0_USER_INFO,
  AUTH_TOKEN_EXPIRED
} from './AuthConstants';

const MOCK_SECRET :string = 'secret';
const MOCK_AUTH_TOKEN :string = jwt.sign(
  {
    data: randomId(),
    exp: moment().add(1, 'h').unix() // 1 hour ahead
  },
  MOCK_SECRET
);

describe('AuthUtils', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  describe('getAuthToken()', () => {

    test('should return null if the auth token is not in localStorage', () => {
      expect(AuthUtils.getAuthToken()).toBeNull();
    });

    test('should return null if the stored auth token is invalid', () => {
      INVALID_PARAMS.forEach((invalid :any) => {
        localStorage.setItem(AUTH0_ID_TOKEN, invalid);
        expect(AuthUtils.getAuthToken()).toBeNull();
      });
    });

    test('should return the stored auth token', () => {
      localStorage.setItem(AUTH0_ID_TOKEN, MOCK_AUTH_TOKEN);
      expect(AuthUtils.getAuthToken()).toEqual(MOCK_AUTH_TOKEN);
    });

  });

  describe('getAuthTokenExpiration()', () => {

    test('should return -1 if localStorage does not hold an auth token', () => {
      expect(AuthUtils.getAuthTokenExpiration()).toEqual(AUTH_TOKEN_EXPIRED);
    });

    test('should return -1 if localStorage holds an invalid value', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        localStorage.setItem(AUTH0_ID_TOKEN, invalid);
        expect(AuthUtils.getAuthTokenExpiration()).toEqual(AUTH_TOKEN_EXPIRED);
      });
    });

    test('should return -1 if given an invalid value', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        expect(AuthUtils.getAuthTokenExpiration(invalid)).toEqual(AUTH_TOKEN_EXPIRED);
      });
    });

    test('should return -1 if given an invalid defined value even if localStorage holds a valid value', () => {
      localStorage.setItem(AUTH0_ID_TOKEN, MOCK_AUTH_TOKEN);
      INVALID_PARAMS_NOT_DEFINED_ALLOWED.forEach((invalid :any) => {
        expect(AuthUtils.getAuthTokenExpiration(invalid)).toEqual(AUTH_TOKEN_EXPIRED);
      });
    });

    test('should return the correct expiration', () => {

      const expInSecondsSinceEpoch :number = moment().add(1, 'h').unix(); // 1 hour ahead
      const expInMillisSinceEpoch :number = expInSecondsSinceEpoch * 1000;

      const mockAuthToken :string = jwt.sign({ data: randomId(), exp: expInSecondsSinceEpoch }, 'secret');
      localStorage.setItem(AUTH0_ID_TOKEN, mockAuthToken);
      expect(AuthUtils.getAuthTokenExpiration()).toEqual(expInMillisSinceEpoch);
    });

  });

  describe('hasAuthTokenExpired()', () => {

    test('should return true when given an invalid parameter', () => {
      INVALID_PARAMS.forEach((invalid :any) => {
        expect(AuthUtils.hasAuthTokenExpired(invalid)).toEqual(true);
      });
    });

    test('should return true when given an expired expiration', () => {
      // https://momentjs.com/docs/#/manipulating/add
      ['s', 'm', 'h', 'd', 'w', 'M', 'y'].forEach((unit :string) => {
        expect(AuthUtils.hasAuthTokenExpired(moment().subtract(1, unit).valueOf())).toEqual(true);
      });
    });

    test('should return true when given an expired auth token', () => {
      ['s', 'm', 'h', 'd', 'w', 'M', 'y'].forEach((unit :string) => {
        const expInSecondsSinceEpoch :number = moment().subtract(1, unit).unix();
        const mockAuthToken :string = jwt.sign({ data: randomId(), exp: expInSecondsSinceEpoch }, 'secret');
        expect(AuthUtils.hasAuthTokenExpired(mockAuthToken)).toEqual(true);
      });
    });

    test('should return false when given an auth token with an expiration in the future', () => {
      ['s', 'm', 'h', 'd', 'w', 'M', 'y'].forEach((unit :string) => {
        const expInSecondsSinceEpoch :number = moment().add(1, unit).unix();
        const mockAuthToken :string = jwt.sign({ data: randomId(), exp: expInSecondsSinceEpoch }, 'secret');
        expect(AuthUtils.hasAuthTokenExpired(mockAuthToken)).toEqual(false);
      });
    });

  });

  describe('clearAuthInfo()', () => {

    test(`should remove ${AUTH0_ID_TOKEN} from localStorage`, () => {
      localStorage.setItem(AUTH0_ID_TOKEN, randomId());
      AuthUtils.clearAuthInfo();
      expect(localStorage).toHaveLength(0);
      expect(localStorage.getItem(AUTH0_ID_TOKEN)).toEqual(null);
    });

    test(`should remove ${AUTH0_USER_INFO} from localStorage`, () => {
      localStorage.setItem(AUTH0_USER_INFO, randomId());
      AuthUtils.clearAuthInfo();
      expect(localStorage).toHaveLength(0);
      expect(localStorage.getItem(AUTH0_USER_INFO)).toEqual(null);
    });

  });

  describe('storeAuthInfo()', () => {

    test('should not update localStorage when given invalid auth info', () => {
      INVALID_PARAMS.forEach((invalid :any) => {
        AuthUtils.storeAuthInfo(invalid);
        expect(localStorage).toHaveLength(0);
      });
    });

    test('should update localStorage with the correct auth token even if user info is missing', () => {

      localStorage.clear();
      AuthUtils.storeAuthInfo({
        idToken: MOCK_AUTH_TOKEN,
        idTokenPayload: null
      });
      expect(localStorage).toHaveLength(1);
      expect(localStorage.getItem(AUTH0_ID_TOKEN)).toEqual(MOCK_AUTH_TOKEN);
      expect(localStorage.getItem(AUTH0_USER_INFO)).toEqual(null);

      localStorage.clear();
      AuthUtils.storeAuthInfo({
        idToken: MOCK_AUTH_TOKEN,
        idTokenPayload: undefined
      });
      expect(localStorage).toHaveLength(1);
      expect(localStorage.getItem(AUTH0_ID_TOKEN)).toEqual(MOCK_AUTH_TOKEN);
      expect(localStorage.getItem(AUTH0_USER_INFO)).toEqual(null);
    });

    test('should update localStorage with the correct auth token and user info', () => {

      const mockAuthInfo :Object = {
        idToken: MOCK_AUTH_TOKEN,
        idTokenPayload: {
          email: randomId(),
          picture: randomId(),
          roles: [randomId()],
          user_id: randomId()
        }
      };

      const mockUserInfo :UserInfo = {
        email: mockAuthInfo.idTokenPayload.email,
        id: mockAuthInfo.idTokenPayload.user_id,
        picture: mockAuthInfo.idTokenPayload.picture,
        roles: mockAuthInfo.idTokenPayload.roles
      };

      AuthUtils.storeAuthInfo(mockAuthInfo);
      expect(localStorage).toHaveLength(2);
      expect(localStorage.getItem(AUTH0_ID_TOKEN)).toEqual(MOCK_AUTH_TOKEN);
      expect(localStorage.getItem(AUTH0_USER_INFO)).toEqual(JSON.stringify(mockUserInfo));
    });

  });

  describe('getUserInfo()', () => {

    test('should return null if the user info is not in localStorage', () => {
      expect(AuthUtils.getUserInfo()).toBeNull();
    });

    test('should return null if the stored user info is invalid', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        localStorage.setItem(AUTH0_USER_INFO, invalid);
        expect(AuthUtils.getUserInfo()).toBeNull();
      });
    });

    test('should return the stored user info', () => {

      const mockUserInfo :UserInfo = {
        email: randomId(),
        id: randomId(),
        picture: randomId(),
        roles: [randomId()]
      };

      localStorage.setItem(AUTH0_USER_INFO, JSON.stringify(mockUserInfo));
      expect(AuthUtils.getUserInfo()).toEqual(mockUserInfo);
    });

  });

  describe('isAuthenticated()', () => {

    test('should return false if localStorage does not hold an auth token', () => {
      expect(AuthUtils.isAuthenticated()).toEqual(false);
    });

    test('should return false if localStorage holds an invalid auth token', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        localStorage.setItem(AUTH0_ID_TOKEN, invalid);
        expect(AuthUtils.isAuthenticated()).toEqual(false);
      });
    });

    test('should return false if localStorage holds an expired auth token', () => {
      ['s', 'm', 'h', 'd', 'w', 'M', 'y'].forEach((unit :string) => {
        const expInSecondsSinceEpoch :number = moment().subtract(1, unit).unix();
        const mockAuthToken :string = jwt.sign({ data: randomId(), exp: expInSecondsSinceEpoch }, 'secret');
        localStorage.setItem(AUTH0_ID_TOKEN, mockAuthToken);
        expect(AuthUtils.isAuthenticated()).toEqual(false);
      });
    });

    test('should return true if localStorage holds an auth token with an expiration in the future', () => {
      ['s', 'm', 'h', 'd', 'w', 'M', 'y'].forEach((unit :string) => {
        const expInSecondsSinceEpoch :number = moment().add(1, unit).unix();
        const mockAuthToken :string = jwt.sign({ data: randomId(), exp: expInSecondsSinceEpoch }, 'secret');
        localStorage.setItem(AUTH0_ID_TOKEN, mockAuthToken);
        expect(AuthUtils.isAuthenticated()).toEqual(true);
      });
    });

  });

  describe('isAdmin()', () => {

    test('should return false if the user info is not in localStorage', () => {
      expect(AuthUtils.isAdmin()).toEqual(false);
    });

    test('should return false if the stored user info is invalid', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        localStorage.setItem(AUTH0_USER_INFO, invalid);
        expect(AuthUtils.isAdmin()).toEqual(false);
      });
    });

    test(`should return false if the stored user info does not have the "${ADMIN_ROLE}" role`, () => {

      const mockUserInfo :UserInfo = {};
      localStorage.setItem(AUTH0_USER_INFO, JSON.stringify(mockUserInfo));
      expect(AuthUtils.isAdmin()).toEqual(false);

      INVALID_SS_PARAMS.forEach((invalid :any) => {
        mockUserInfo.roles = [invalid];
        localStorage.setItem(AUTH0_USER_INFO, JSON.stringify(mockUserInfo));
        expect(AuthUtils.isAdmin()).toEqual(false);
        mockUserInfo.roles = [invalid, invalid];
        localStorage.setItem(AUTH0_USER_INFO, JSON.stringify(mockUserInfo));
        expect(AuthUtils.isAdmin()).toEqual(false);
      });
    });

    test(`should return false because the "${ADMIN_ROLE}" role is case sensitive`, () => {

      const mockUserInfo :UserInfo = { roles: ['ADMIN', 'Admin'] };
      localStorage.setItem(AUTH0_USER_INFO, JSON.stringify(mockUserInfo));
      expect(AuthUtils.isAdmin()).toEqual(false);
    });

    test(`should return true if the stored user info contains the "${ADMIN_ROLE}" role`, () => {

      const mockUserInfo :UserInfo = { roles: [ADMIN_ROLE] };
      localStorage.setItem(AUTH0_USER_INFO, JSON.stringify(mockUserInfo));
      expect(AuthUtils.isAdmin()).toEqual(true);

      mockUserInfo.roles = [randomId(), ADMIN_ROLE];
      localStorage.setItem(AUTH0_USER_INFO, JSON.stringify(mockUserInfo));
      expect(AuthUtils.isAdmin()).toEqual(true);
    });

  });

  // TODO: blocked by JSDOM, can't figure out how to mock window.location properly, specifically "origin"
  // describe('redirectToLogin()', () => {});

});
