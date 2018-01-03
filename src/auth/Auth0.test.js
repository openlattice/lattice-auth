/*
 * @flow
 */

import Auth0Lock from 'auth0-lock';
import moment from 'moment';

import * as Auth0 from './Auth0';
import * as AuthUtils from './AuthUtils';
import { randomId } from '../utils/Utils';

import {
  ERR_A0L_ON_AUTHORIZATION_ERROR,
  ERR_A0L_ON_UNRECOVERABLE_ERROR,
  ERR_A0L_ON_AUTH__AUTH_INFO_MISSING,
  ERR_A0L_ON_AUTH__AUTH_TOKEN_EXPIRED,
  ERR_A0L_ON_HASH__AUTH_INFO_MISSING,
  ERR_A0L_ON_HASH__AUTH_TOKEN_EXPIRED,
  ERR_URL_HASH_PATH_MISSING
} from '../utils/Errors';

import {
  LOGIN_PATH
} from './AuthConstants';

// injected by Jest
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;

jest.mock('auth0-lock');
jest.mock('./AuthUtils');

const MOCK_AUTH_TOKEN :string = `${randomId()}.${randomId()}.${randomId()}`;
const MOCK_URL :string = 'https://openlattice.com';
const MOCK_AUTH0_URL :string = `${MOCK_URL}/#access_token=${randomId()}&id_token=${randomId()}`;
const MOCK_LOGIN_URL :string = `${MOCK_URL}/#${LOGIN_PATH}`

// TODO: mock Auth0Lock, and test for given options, test getConfig().getIn(['auth0Lock', 'logo'], '')
describe('Auth0', () => {

  beforeAll(() => {
    AuthUtils.getAuthToken.mockImplementation(() => MOCK_AUTH_TOKEN);
    AuthUtils.getAuthTokenExpiration.mockImplementation(() => moment().subtract(1, 'h').unix()); // 1 hour ahead
    AuthUtils.hasAuthTokenExpired.mockImplementation(() => true);
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  // TODO: getAuth0LockInstance() tests need to be first because the Auth0Lock instance gets set once
  // Auth0.initialize() is called. need to figure out how to reset the Auth0Lock instance.
  describe('getAuth0LockInstance', () => {

    test('should be a function', () => {
      expect(Auth0.getAuth0LockInstance).toBeInstanceOf(Function);
    });

    test('should throw if Auth0Lock has not been initialized', () => {
      expect(() => {
        Auth0.getAuth0LockInstance();
      }).toThrow();
    });

    test('should return the Auth0Lock instance', () => {
      const mockAuth0LockInstance = {
        test: randomId()
      };
      Auth0Lock.mockImplementationOnce(() => mockAuth0LockInstance);
      Auth0.initialize();
      const auth0LockInstance = Auth0.getAuth0LockInstance();
      expect(auth0LockInstance).toBeDefined();
      expect(auth0LockInstance).toBe(mockAuth0LockInstance);
    });

  });

  /*
   * for now, getAuth0LockInstance() tests need to come before any other tests because Auth0.initialize() sets the
   * Auth0Lock instance, and I don't know how to undo that for each tests
   */

  describe('initialize()', () => {

    test('should be a function', () => {
      expect(Auth0.initialize).toBeInstanceOf(Function);
    });

    test('should not throw', () => {
      expect(() => {
        Auth0.initialize();
      }).not.toThrow();
    });

    // TODO: test against the config object
    test('should create a new Auth0Lock instance', () => {

      Auth0.initialize();
      expect(Auth0Lock).toHaveBeenCalledTimes(1);
      expect(Auth0Lock).toHaveBeenCalledWith(
        __AUTH0_CLIENT_ID__,
        __AUTH0_DOMAIN__,
        expect.any(Object)
      );
    });

    // TODO: should call Auth0.parseHashPath()
    // test('should call Auth0.parseHashPath()', () => {});

    test('should call AuthUtils.getAuthToken()', () => {
      Auth0.initialize();
      expect(AuthUtils.getAuthToken).toHaveBeenCalledTimes(1);
    });

    test('should call AuthUtils.hasAuthTokenExpired()', () => {
      Auth0.initialize();
      expect(AuthUtils.hasAuthTokenExpired).toHaveBeenCalledTimes(1);
      expect(AuthUtils.hasAuthTokenExpired).toHaveBeenCalledWith(MOCK_AUTH_TOKEN);
    });

  });

  describe('parseHashPath()', () => {

    test('should be a function', () => {
      expect(Auth0.parseHashPath).toBeInstanceOf(Function);
    });

    test('should return null if the given href is missing', () => {
      expect(Auth0.parseHashPath()).toBeNull();
    });

    test('should not replace url if "access_token" is missing', () => {
      const replaceSpy = jest.spyOn(window.location, 'replace');
      const url :string = `${MOCK_URL}/#/id_token=${randomId()}`;
      global.jsdom.reconfigure({ url });
      expect(Auth0.parseHashPath(url)).toBeNull();
      expect(replaceSpy).not.toHaveBeenCalled();
    });

    test('should not replace url if "id_token" is missing', () => {
      const replaceSpy = jest.spyOn(window.location, 'replace');
      const url :string = `${MOCK_URL}/#/access_token=${randomId()}`;
      global.jsdom.reconfigure({ url });
      expect(Auth0.parseHashPath(url)).toBeNull();
      expect(replaceSpy).not.toHaveBeenCalled();
    });

    test('should replace url when both "access_token" and "id_token" are present', () => {

      const replaceSpy = jest.spyOn(window.location, 'replace');

      const hashPath = `access_token=${randomId()}&id_token=${randomId()}`;
      let url :string = `${MOCK_URL}#${hashPath}`;
      global.jsdom.reconfigure({ url });
      expect(Auth0.parseHashPath(url)).toEqual(hashPath);
      expect(window.location.href).toEqual(MOCK_LOGIN_URL);

      url = `${MOCK_URL}/#${hashPath}`;
      global.jsdom.reconfigure({ url });
      expect(Auth0.parseHashPath(url)).toEqual(hashPath);
      expect(window.location.href).toEqual(MOCK_LOGIN_URL);

      url = `${MOCK_URL}/#/${hashPath}`;
      global.jsdom.reconfigure({ url });
      expect(Auth0.parseHashPath(url)).toEqual(`/${hashPath}`);
      expect(window.location.href).toEqual(MOCK_LOGIN_URL);

      expect(replaceSpy).toHaveBeenCalledTimes(3);
      expect(replaceSpy).toHaveBeenCalledWith(MOCK_LOGIN_URL);
    });

  });

  describe('authenticate()', () => {

    test('should be a function', () => {
      expect(Auth0.authenticate).toBeInstanceOf(Function);
    });

    test('should return a Promise', () => {
      const promise = Auth0.authenticate().catch(() => {});
      expect(promise).toEqual(expect.any(Promise));
    });

    test('should fail to authenticate if the url hash path has not been set', (done) => {

      // global.jsdom.reconfigure({ url: MOCK_URL });
      // Auth0.initialize();
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_URL_HASH_PATH_MISSING);
          done();
        });
    });

    // TODO: how do we mock what "new Auth0Lock" returns?
    // test('should fail to authenticate if the Auth0Lock has not been instantiated', () => {});

    test('should fail to authenticate if Auth0Lock calls on("authorization_error")', (done) => {

      Auth0Lock.mockImplementationOnce(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authorization_error') {
            callback();
          }
        }),
        resumeAuth: jest.fn()
      }));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      Auth0.initialize();
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_A0L_ON_AUTHORIZATION_ERROR);
          done();
        });
    });

    test('should fail to authenticate if Auth0Lock calls on("unrecoverable_error")', (done) => {

      Auth0Lock.mockImplementationOnce(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'unrecoverable_error') {
            callback();
          }
        }),
        resumeAuth: jest.fn()
      }));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      Auth0.initialize();
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_A0L_ON_UNRECOVERABLE_ERROR);
          done();
        });
    });

    test('should fail to authenticate if Auth0Lock calls on("authenticated") with auth info missing', (done) => {

      Auth0Lock.mockImplementationOnce(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authenticated') {
            callback();
          }
        }),
        resumeAuth: jest.fn()
      }));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      Auth0.initialize();
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_A0L_ON_AUTH__AUTH_INFO_MISSING);
          done();
        });
    });

    test('should fail to authenticate if Auth0Lock calls on("authenticated") with "accessToken" missing', (done) => {

      Auth0Lock.mockImplementationOnce(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authenticated') {
            callback({ idToken: randomId() });
          }
        }),
        resumeAuth: jest.fn()
      }));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      Auth0.initialize();
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_A0L_ON_AUTH__AUTH_INFO_MISSING);
          done();
        });
    });

    test('should fail to authenticate if Auth0Lock calls on("authenticated") with "idToken" missing', (done) => {

      Auth0Lock.mockImplementationOnce(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authenticated') {
            callback({ accessToken: randomId() });
          }
        }),
        resumeAuth: jest.fn()
      }));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      Auth0.initialize();
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_A0L_ON_AUTH__AUTH_INFO_MISSING);
          done();
        });
    });

    test('should fail to authenticate if Auth0Lock calls on("authenticated") with an expired token', (done) => {

      Auth0Lock.mockImplementationOnce(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authenticated') {
            callback({ accessToken: randomId(), idToken: -1 });
          }
        }),
        resumeAuth: jest.fn()
      }));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      Auth0.initialize();
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_A0L_ON_AUTH__AUTH_TOKEN_EXPIRED);
          done();
        });
    });

    test('should fail to authenticate if Auth0Lock calls on("hash_parsed") with auth info missing', (done) => {

      Auth0Lock.mockImplementationOnce(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'hash_parsed') {
            callback();
          }
        }),
        resumeAuth: jest.fn()
      }));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      Auth0.initialize();
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_A0L_ON_HASH__AUTH_INFO_MISSING);
          done();
        });
    });

    test('should fail to authenticate if Auth0Lock calls on("hash_parsed") with "accessToken" missing', (done) => {

      Auth0Lock.mockImplementationOnce(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'hash_parsed') {
            callback({ idToken: randomId() });
          }
        }),
        resumeAuth: jest.fn()
      }));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      Auth0.initialize();
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_A0L_ON_HASH__AUTH_INFO_MISSING);
          done();
        });
    });

    test('should fail to authenticate if Auth0Lock calls on("hash_parsed") with "idToken" missing', (done) => {

      Auth0Lock.mockImplementationOnce(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'hash_parsed') {
            callback({ accessToken: randomId() });
          }
        }),
        resumeAuth: jest.fn()
      }));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      Auth0.initialize();
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_A0L_ON_HASH__AUTH_INFO_MISSING);
          done();
        });
    });

    test('should fail to authenticate if Auth0Lock calls on("hash_parsed") with an expired token', (done) => {

      Auth0Lock.mockImplementationOnce(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'hash_parsed') {
            callback({ accessToken: randomId(), idToken: -1 });
          }
        }),
        resumeAuth: jest.fn()
      }));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      Auth0.initialize();
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_A0L_ON_HASH__AUTH_TOKEN_EXPIRED);
          done();
        });
    });

    test('should authenticate successfully', (done) => {

      const mockAuthInfo = {
        accessToken: randomId(),
        idToken: randomId()
      };

      AuthUtils.hasAuthTokenExpired
        .mockImplementationOnce(() => false) // first time in Auth0.initialize()
        .mockImplementationOnce(() => false); // second time in Auth0.authenticate() in on('authenticated')

      Auth0Lock.mockImplementationOnce(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authenticated') {
            callback(mockAuthInfo);
          }
        }),
        resumeAuth: jest.fn()
      }));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      Auth0.initialize();
      Auth0.authenticate()
        .then((authInfo :Object) => {
          expect(authInfo).toBeDefined();
          expect(authInfo).toEqual(mockAuthInfo);
          done();
        })
        .catch(() => done.fail());
    });

  });

});
