/*
 * @flow
 */

import cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import uuid from 'uuid/v4';

import * as AuthUtils from './AuthUtils';
import { genRandomString } from '../utils/testing/TestUtils';

import {
  INVALID_PARAMS,
  INVALID_PARAMS_FOR_OPTIONAL_PARAM,
  INVALID_SS_PARAMS,
} from '../utils/testing/Invalid';

import {
  ADMIN_ROLE,
  AUTH0_ID_TOKEN,
  AUTH0_USER_INFO,
  AUTH_COOKIE,
  AUTH_TOKEN_EXPIRED,
  CSRF_COOKIE,
} from './AuthConstants';

// https://momentjs.com/docs/#/manipulating/add/
// https://momentjs.com/docs/#/manipulating/subtract/
const MOMENT_UNITS = ['s', 'm', 'h', 'd', 'w', 'M', 'y'];

const MOCK_PROD_URL :string = 'https://openlattice.com';
const MOCK_EXPIRATION_IN_SECONDS :number = moment().add(1, 'h').unix(); // 1 hour ahead
const MOCK_CSRF_TOKEN :UUID = '40015ad9-fb3e-4741-9547-f7ac33cf4663';

const MOCK_AUTH_TOKEN :string = jwt.sign(
  {
    data: 'mock_data',
    // Auth0 JWT tokens set the expiration date as seconds since the Unix Epoch, not milliseconds
    exp: MOCK_EXPIRATION_IN_SECONDS,
  },
  'mock_secret',
);

const MOCK_AUTH0_PAYLOAD = {
  idToken: MOCK_AUTH_TOKEN,
  idTokenPayload: {
    email: 'test@openlattice.com',
    family_name: 'James',
    given_name: 'Hetfield',
    name: 'James Hetfield',
    picture: genRandomString(),
    roles: ['TEST_ROLE_1', 'TEST_ROLE_2'],
    user_id: genRandomString(),
  },
};

jest.mock('js-cookie');
jest.mock('uuid/v4');

describe('AuthUtils', () => {

  beforeEach(() => {
    localStorage.clear();
    cookies.get.mockClear();
    cookies.remove.mockClear();
    cookies.set.mockClear();
    uuid.mockClear();
  });

  describe('getAuthToken()', () => {

    test('should return null if the stored auth token is invalid', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        localStorage.setItem(AUTH0_ID_TOKEN, invalid);
        expect(AuthUtils.getAuthToken()).toBeNull();
        expect(cookies.get).not.toHaveBeenCalled();
      });
    });

    test('should return the stored auth token', () => {
      localStorage.setItem(AUTH0_ID_TOKEN, MOCK_AUTH_TOKEN);
      expect(AuthUtils.getAuthToken()).toEqual(MOCK_AUTH_TOKEN);
      expect(cookies.get).not.toHaveBeenCalled();
    });

  });

  describe('getAuthTokenExpiration()', () => {

    test('should return -1 if the stored auth token is invalid', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        localStorage.setItem(AUTH0_ID_TOKEN, invalid);
        expect(AuthUtils.getAuthTokenExpiration()).toEqual(AUTH_TOKEN_EXPIRED);
        expect(cookies.get).not.toHaveBeenCalled();
      });
    });

    test('should return -1 if given an invalid value', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        expect(AuthUtils.getAuthTokenExpiration(invalid)).toEqual(AUTH_TOKEN_EXPIRED);
        expect(cookies.get).not.toHaveBeenCalled();
      });
    });

    test('should return -1 if given an invalid value even if the stored auth token is valid', () => {
      INVALID_PARAMS_FOR_OPTIONAL_PARAM.forEach((invalid :any) => {
        expect(AuthUtils.getAuthTokenExpiration(invalid)).toEqual(AUTH_TOKEN_EXPIRED);
        expect(cookies.get).not.toHaveBeenCalled();
      });
    });

    test('should return the correct expiration', () => {
      const expInSecondsSinceEpoch :number = moment().add(1, 'h').unix(); // 1 hour ahead
      const expInMillisSinceEpoch :number = expInSecondsSinceEpoch * 1000;
      const mockAuthToken :string = jwt.sign({ data: genRandomString(), exp: expInSecondsSinceEpoch }, 'secret');
      localStorage.setItem(AUTH0_ID_TOKEN, mockAuthToken);
      expect(AuthUtils.getAuthTokenExpiration()).toEqual(expInMillisSinceEpoch);
      expect(cookies.get).not.toHaveBeenCalled();
    });

  });

  describe('getCSRFToken', () => {

    test('should return null if the stored csrf token is invalid', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        cookies.get.mockImplementationOnce(() => invalid);
        expect(AuthUtils.getCSRFToken()).toBeNull();
        expect(cookies.get).toHaveBeenCalledTimes(1);
        expect(cookies.get).toHaveBeenCalledWith(CSRF_COOKIE);
        cookies.get.mockClear();
      });
    });

    test('should return the stored csrf token', () => {
      cookies.get.mockImplementationOnce(() => MOCK_CSRF_TOKEN);
      expect(AuthUtils.getCSRFToken()).toEqual(MOCK_CSRF_TOKEN);
      expect(cookies.get).toHaveBeenCalledTimes(1);
      expect(cookies.get).toHaveBeenCalledWith(CSRF_COOKIE);
    });

  });

  describe('hasAuthTokenExpired()', () => {

    test('should return true when given an invalid parameter', () => {
      INVALID_PARAMS.forEach((invalid :any) => {
        expect(AuthUtils.hasAuthTokenExpired(invalid)).toEqual(true);
      });
    });

    test('should return true when given an expired expiration', () => {
      MOMENT_UNITS.forEach((unit :string) => {
        expect(AuthUtils.hasAuthTokenExpired(moment().subtract(1, unit).valueOf())).toEqual(true);
      });
    });

    test('should return true when given an expired auth token', () => {
      MOMENT_UNITS.forEach((unit :string) => {
        const expInSecondsSinceEpoch :number = moment().subtract(1, unit).unix();
        const mockAuthToken :string = jwt.sign({ data: genRandomString(), exp: expInSecondsSinceEpoch }, 'secret');
        expect(AuthUtils.hasAuthTokenExpired(mockAuthToken)).toEqual(true);
      });
    });

    test('should return false when given an auth token with an expiration in the future', () => {
      MOMENT_UNITS.forEach((unit :string) => {
        const expInSecondsSinceEpoch :number = moment().add(1, unit).unix();
        const mockAuthToken :string = jwt.sign({ data: genRandomString(), exp: expInSecondsSinceEpoch }, 'secret');
        expect(AuthUtils.hasAuthTokenExpired(mockAuthToken)).toEqual(false);
      });
    });

  });

  describe('clearAuthInfo()', () => {

    test('should remove all cookies', () => {
      AuthUtils.clearAuthInfo();
      expect(cookies.remove).toHaveBeenCalledTimes(2);
      expect(cookies.remove).toHaveBeenCalledWith(AUTH_COOKIE, { domain: 'localhost', path: '/' });
      expect(cookies.remove).toHaveBeenCalledWith(CSRF_COOKIE, { domain: 'localhost', path: '/' });
    });

    test(`should remove ${AUTH0_ID_TOKEN} from localStorage`, () => {
      localStorage.setItem(AUTH0_ID_TOKEN, genRandomString()); // the value doesn't matter
      AuthUtils.clearAuthInfo();
      expect(localStorage).toHaveLength(0);
      expect(localStorage.getItem(AUTH0_ID_TOKEN)).toBeNull();
    });

    test(`should remove "${AUTH0_USER_INFO}" from localStorage`, () => {
      localStorage.setItem(AUTH0_USER_INFO, genRandomString()); // the value doesn't matter
      AuthUtils.clearAuthInfo();
      expect(localStorage).toHaveLength(0);
      expect(localStorage.getItem(AUTH0_USER_INFO)).toBeNull();
    });

  });

  describe('storeAuthInfo()', () => {

    test('should not store anything when given invalid auth info', () => {
      INVALID_PARAMS.forEach((invalid :any) => {
        AuthUtils.storeAuthInfo(invalid);
        expect(localStorage).toHaveLength(0);
        expect(cookies.set).not.toHaveBeenCalled();
      });
    });

    describe('should set cookies - dev', () => {

      test(`"${AUTH_COOKIE}" cookie`, () => {
        AuthUtils.storeAuthInfo(MOCK_AUTH0_PAYLOAD);
        expect(cookies.set).toHaveBeenCalledTimes(2);
        expect(cookies.set).toHaveBeenCalledWith(
          AUTH_COOKIE,
          `Bearer ${MOCK_AUTH_TOKEN}`,
          {
            SameSite: 'strict',
            domain: 'localhost',
            expires: new Date(MOCK_EXPIRATION_IN_SECONDS * 1000),
            path: '/',
            secure: false,
          }
        );
      });

      test(`"${CSRF_COOKIE}" cookie`, () => {
        uuid.mockImplementationOnce(() => MOCK_CSRF_TOKEN);
        AuthUtils.storeAuthInfo(MOCK_AUTH0_PAYLOAD);
        expect(cookies.set).toHaveBeenCalledTimes(2);
        expect(cookies.set).toHaveBeenCalledWith(
          CSRF_COOKIE,
          MOCK_CSRF_TOKEN,
          {
            SameSite: 'strict',
            domain: 'localhost',
            expires: new Date(MOCK_EXPIRATION_IN_SECONDS * 1000),
            path: '/',
            secure: false,
          }
        );
      });

    });

    describe('should set cookies - prod', () => {

      test(`"${AUTH_COOKIE}" cookie`, () => {
        global.jsdom.reconfigure({ url: MOCK_PROD_URL });
        AuthUtils.storeAuthInfo(MOCK_AUTH0_PAYLOAD);
        expect(cookies.set).toHaveBeenCalledTimes(2);
        expect(cookies.set).toHaveBeenCalledWith(
          AUTH_COOKIE,
          `Bearer ${MOCK_AUTH_TOKEN}`,
          {
            SameSite: 'strict',
            domain: '.openlattice.com',
            expires: new Date(MOCK_EXPIRATION_IN_SECONDS * 1000),
            path: '/',
            secure: true,
          }
        );
      });

      test(`"${CSRF_COOKIE}" cookie`, () => {
        uuid.mockImplementationOnce(() => MOCK_CSRF_TOKEN);
        global.jsdom.reconfigure({ url: MOCK_PROD_URL });
        AuthUtils.storeAuthInfo(MOCK_AUTH0_PAYLOAD);
        expect(cookies.set).toHaveBeenCalledTimes(2);
        expect(cookies.set).toHaveBeenCalledWith(
          CSRF_COOKIE,
          MOCK_CSRF_TOKEN,
          {
            SameSite: 'strict',
            domain: '.openlattice.com',
            expires: new Date(MOCK_EXPIRATION_IN_SECONDS * 1000),
            path: '/',
            secure: true,
          }
        );
      });

    });

    test('should set cookies even if user info is missing', () => {
      INVALID_PARAMS.forEach((invalid :any) => {
        localStorage.clear();
        uuid.mockImplementationOnce(() => MOCK_CSRF_TOKEN);
        AuthUtils.storeAuthInfo({ idToken: MOCK_AUTH_TOKEN, idTokenPayload: invalid });
        expect(cookies.set).toHaveBeenCalledTimes(2);
        expect(cookies.set).toHaveBeenCalledWith(AUTH_COOKIE, `Bearer ${MOCK_AUTH_TOKEN}`, expect.any(Object));
        expect(cookies.set).toHaveBeenCalledWith(CSRF_COOKIE, MOCK_CSRF_TOKEN, expect.any(Object));
        expect(localStorage).toHaveLength(1);
        expect(localStorage.getItem(AUTH0_ID_TOKEN)).toEqual(MOCK_AUTH_TOKEN);
        expect(localStorage.getItem(AUTH0_USER_INFO)).toBeNull();
        cookies.set.mockClear();
        uuid.mockClear();
      });
    });

    test('should update localStorage with the correct user info', () => {

      const mockUserInfo :UserInfo = {
        email: MOCK_AUTH0_PAYLOAD.idTokenPayload.email,
        familyName: MOCK_AUTH0_PAYLOAD.idTokenPayload.family_name,
        givenName: MOCK_AUTH0_PAYLOAD.idTokenPayload.given_name,
        id: MOCK_AUTH0_PAYLOAD.idTokenPayload.user_id,
        name: MOCK_AUTH0_PAYLOAD.idTokenPayload.name,
        picture: MOCK_AUTH0_PAYLOAD.idTokenPayload.picture,
        roles: MOCK_AUTH0_PAYLOAD.idTokenPayload.roles,
      };

      uuid.mockImplementationOnce(() => MOCK_CSRF_TOKEN);
      AuthUtils.storeAuthInfo(MOCK_AUTH0_PAYLOAD);
      expect(cookies.set).toHaveBeenCalledTimes(2);
      expect(cookies.set).toHaveBeenCalledWith(AUTH_COOKIE, `Bearer ${MOCK_AUTH_TOKEN}`, expect.any(Object));
      expect(cookies.set).toHaveBeenCalledWith(CSRF_COOKIE, MOCK_CSRF_TOKEN, expect.any(Object));
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
        email: genRandomString(),
        familyName: genRandomString(),
        givenName: genRandomString(),
        id: genRandomString(),
        name: genRandomString(),
        picture: genRandomString(),
        roles: [genRandomString()]
      };

      localStorage.setItem(AUTH0_USER_INFO, JSON.stringify(mockUserInfo));
      expect(AuthUtils.getUserInfo()).toEqual(mockUserInfo);
    });

  });

  describe('isAuthenticated()', () => {

    test('should return false if localStorage does not hold an auth token', () => {
      expect(AuthUtils.isAuthenticated()).toEqual(false);
    });

    test('should return false if the stored auth token is invalid', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        localStorage.setItem(AUTH0_ID_TOKEN, invalid);
        expect(AuthUtils.isAuthenticated()).toEqual(false);
        expect(cookies.get).not.toHaveBeenCalled();
      });
    });

    test('should return false if the stored auth token is expired', () => {
      MOMENT_UNITS.forEach((unit :string) => {
        const expInSecondsSinceEpoch :number = moment().subtract(1, unit).unix();
        const mockAuthToken :string = jwt.sign({ data: genRandomString(), exp: expInSecondsSinceEpoch }, 'secret');
        localStorage.setItem(AUTH0_ID_TOKEN, mockAuthToken);
        expect(AuthUtils.isAuthenticated()).toEqual(false);
        expect(cookies.get).not.toHaveBeenCalled();
      });
    });

    test('should return false if the stored auth token expires in the future', () => {
      MOMENT_UNITS.forEach((unit :string) => {
        const expInSecondsSinceEpoch :number = moment().add(1, unit).unix();
        const mockAuthToken :string = jwt.sign({ data: genRandomString(), exp: expInSecondsSinceEpoch }, 'secret');
        localStorage.setItem(AUTH0_ID_TOKEN, mockAuthToken);
        expect(AuthUtils.isAuthenticated()).toEqual(true);
        expect(cookies.get).not.toHaveBeenCalled();
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

      mockUserInfo.roles = [genRandomString(), ADMIN_ROLE];
      localStorage.setItem(AUTH0_USER_INFO, JSON.stringify(mockUserInfo));
      expect(AuthUtils.isAdmin()).toEqual(true);
    });

  });

  // TODO: blocked by JSDOM, can't figure out how to mock window.location properly, specifically "origin"
  // describe('redirectToLogin()', () => {});

});
