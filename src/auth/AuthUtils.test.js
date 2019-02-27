/*
 * @flow
 */

import cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import moment from 'moment';

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
} from './AuthConstants';

// https://momentjs.com/docs/#/manipulating/add/
// https://momentjs.com/docs/#/manipulating/subtract/
const MOMENT_UNITS = ['s', 'm', 'h', 'd', 'w', 'M', 'y'];

const MOCK_PROD_URL :string = 'https://openlattice.com';
const MOCK_EXPIRATION_IN_SECONDS :number = moment().add(1, 'h').unix(); // 1 hour ahead

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

describe('AuthUtils', () => {

  beforeAll(() => {
    cookies.get.mockImplementation(() => `Bearer ${MOCK_AUTH_TOKEN}`);
  });

  beforeEach(() => {
    localStorage.clear();
    cookies.get.mockClear();
    cookies.remove.mockClear();
    cookies.set.mockClear();
  });

  describe('getAuthToken()', () => {

    test('should return null if the stored auth token is invalid', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        cookies.get.mockImplementationOnce(() => invalid);
        expect(AuthUtils.getAuthToken()).toBeNull();
        expect(cookies.get).toHaveBeenCalledWith(AUTH_COOKIE);
      });
    });

    test('should return the stored auth token', () => {

      cookies.get.mockImplementationOnce(() => MOCK_AUTH_TOKEN);
      expect(AuthUtils.getAuthToken()).toEqual(MOCK_AUTH_TOKEN);
      expect(cookies.get).toHaveBeenCalledWith(AUTH_COOKIE);

      cookies.get.mockImplementationOnce(() => `Bearer ${MOCK_AUTH_TOKEN}`);
      expect(AuthUtils.getAuthToken()).toEqual(MOCK_AUTH_TOKEN);
      expect(cookies.get).toHaveBeenCalledWith(AUTH_COOKIE);
    });

  });

  describe('getAuthTokenExpiration()', () => {

    test('should return -1 if the stored auth token is invalid', () => {
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        cookies.get.mockImplementationOnce(() => invalid);
        expect(AuthUtils.getAuthTokenExpiration()).toEqual(AUTH_TOKEN_EXPIRED);
        expect(cookies.get).toHaveBeenCalledWith(AUTH_COOKIE);
      });
    });

    test('should return -1 if given an invalid value', () => {

      cookies.get.mockImplementation(() => undefined);
      INVALID_SS_PARAMS.forEach((invalid :any) => {
        expect(AuthUtils.getAuthTokenExpiration(invalid)).toEqual(AUTH_TOKEN_EXPIRED);
      });

      // 2 because "null" and "undefined" will call getAuthToken()
      expect(cookies.get).toHaveBeenCalledTimes(2);
      expect(cookies.get).toHaveBeenCalledWith(AUTH_COOKIE);
    });

    test('should return -1 if given an invalid value even if the stored auth token is valid', () => {
      INVALID_PARAMS_FOR_OPTIONAL_PARAM.forEach((invalid :any) => {
        expect(AuthUtils.getAuthTokenExpiration(invalid)).toEqual(AUTH_TOKEN_EXPIRED);
        expect(cookies.get).toHaveBeenCalledTimes(0);
      });
    });

    test('should return the correct expiration', () => {

      const expInSecondsSinceEpoch :number = moment().add(1, 'h').unix(); // 1 hour ahead
      const expInMillisSinceEpoch :number = expInSecondsSinceEpoch * 1000;

      const mockAuthToken :string = jwt.sign({ data: genRandomString(), exp: expInSecondsSinceEpoch }, 'secret');
      cookies.get.mockImplementationOnce(() => `Bearer ${mockAuthToken}`);
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

    test('should remove "authorization" cookie', () => {

      AuthUtils.clearAuthInfo();
      expect(cookies.remove).toHaveBeenCalledTimes(1);
      expect(cookies.remove).toHaveBeenCalledWith(AUTH_COOKIE, { domain: 'localhost', path: '/' });
    });

    test(`should remove "${AUTH0_USER_INFO}" from localStorage`, () => {
      localStorage.setItem(AUTH0_USER_INFO, genRandomString());
      AuthUtils.clearAuthInfo();
      expect(localStorage).toHaveLength(0);
      expect(localStorage.getItem(AUTH0_USER_INFO)).toEqual(null);
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

    test('should set the "authorization" cookie with the correct auth token - dev', () => {
      AuthUtils.storeAuthInfo(MOCK_AUTH0_PAYLOAD);
      expect(cookies.set).toHaveBeenCalledTimes(1);
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

    test('should set the "authorization" cookie with the correct auth token - prod', () => {
      global.jsdom.reconfigure({ url: MOCK_PROD_URL });
      AuthUtils.storeAuthInfo(MOCK_AUTH0_PAYLOAD);
      expect(cookies.set).toHaveBeenCalledTimes(1);
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

    test('should set the "authorization" cookie with the correct auth token even if user info is missing', () => {

      localStorage.clear();

      AuthUtils.storeAuthInfo({ idToken: MOCK_AUTH_TOKEN, idTokenPayload: null });
      expect(cookies.set).toHaveBeenCalledTimes(1);
      expect(cookies.set).toHaveBeenCalledWith(AUTH_COOKIE, `Bearer ${MOCK_AUTH_TOKEN}`, expect.any(Object));
      expect(localStorage).toHaveLength(1);
      expect(localStorage.getItem(AUTH0_ID_TOKEN)).toEqual(MOCK_AUTH_TOKEN);
      expect(localStorage.getItem(AUTH0_USER_INFO)).toEqual(null);

      localStorage.clear();
      cookies.set.mockClear();

      AuthUtils.storeAuthInfo({ idToken: MOCK_AUTH_TOKEN, idTokenPayload: undefined });
      expect(cookies.set).toHaveBeenCalledTimes(1);
      expect(cookies.set).toHaveBeenCalledWith(AUTH_COOKIE, `Bearer ${MOCK_AUTH_TOKEN}`, expect.any(Object));
      expect(localStorage).toHaveLength(1);
      expect(localStorage.getItem(AUTH0_ID_TOKEN)).toEqual(MOCK_AUTH_TOKEN);
      expect(localStorage.getItem(AUTH0_USER_INFO)).toEqual(null);
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

      AuthUtils.storeAuthInfo(MOCK_AUTH0_PAYLOAD);
      expect(cookies.set).toHaveBeenCalledTimes(1);
      expect(cookies.set).toHaveBeenCalledWith(AUTH_COOKIE, `Bearer ${MOCK_AUTH_TOKEN}`, expect.any(Object));
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
        cookies.get.mockImplementationOnce(() => invalid);
        expect(AuthUtils.isAuthenticated()).toEqual(false);
        expect(cookies.get).toHaveBeenCalledWith(AUTH_COOKIE);
      });
    });

    test('should return false if the stored auth token is expired', () => {
      MOMENT_UNITS.forEach((unit :string) => {
        const expInSecondsSinceEpoch :number = moment().subtract(1, unit).unix();
        const mockAuthToken :string = jwt.sign({ data: genRandomString(), exp: expInSecondsSinceEpoch }, 'secret');
        cookies.get.mockImplementationOnce(() => mockAuthToken);
        expect(AuthUtils.isAuthenticated()).toEqual(false);
        expect(cookies.get).toHaveBeenCalledWith(AUTH_COOKIE);
      });
    });

    test('should return false if the stored auth token expires in the future', () => {
      MOMENT_UNITS.forEach((unit :string) => {
        const expInSecondsSinceEpoch :number = moment().add(1, unit).unix();
        const mockAuthToken :string = jwt.sign({ data: genRandomString(), exp: expInSecondsSinceEpoch }, 'secret');
        cookies.get.mockImplementationOnce(() => mockAuthToken);
        expect(AuthUtils.isAuthenticated()).toEqual(true);
        expect(cookies.get).toHaveBeenCalledWith(AUTH_COOKIE);
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
