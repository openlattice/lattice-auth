/*
 * @flow
 */

/* eslint-disable global-require */

import { randomId } from '../utils/Utils';

import {
  ERR_A0L_FRAGMENT_NOT_PARSED,
  ERR_A0L_ON_AUTHORIZATION_ERROR,
  ERR_A0L_ON_UNRECOVERABLE_ERROR,
  ERR_A0L_ON_AUTH__AUTH_INFO_MISSING,
  ERR_A0L_ON_AUTH__AUTH_TOKEN_EXPIRED,
  ERR_A0L_ON_HASH__AUTH_INFO_MISSING,
  ERR_A0L_ON_HASH__AUTH_TOKEN_EXPIRED
} from '../utils/Errors';

import {
  LOGIN_PATH
} from './AuthConstants';

// injected by Jest
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;

const MOCK_AUTH_TOKEN :string = `${randomId()}.${randomId()}.${randomId()}`;
const MOCK_URL :string = 'https://openlattice.com';
const MOCK_AUTH0_URL :string = `${MOCK_URL}/#access_token=${randomId()}&id_token=${randomId()}`;
const MOCK_LOGIN_URL :string = `${MOCK_URL}/#${LOGIN_PATH}`;

// TODO: improve perf - not every test needs to do require('./Auth0'), I think
// TODO: mock Auth0Lock, and test for given options, test getConfig().getIn(['auth0Lock', 'logo'], '')
describe('Auth0', () => {

  beforeAll(() => {
    jest.doMock('auth0-lock', () => jest.fn());
    jest.doMock('./AuthUtils', () => ({
      clearAuthInfo: jest.fn(() => {}),
      getAuthToken: jest.fn(() => MOCK_AUTH_TOKEN),
      hasAuthTokenExpired: jest.fn(() => true)
    }));
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('initialize()', () => {

    test('should be a function', () => {
      const Auth0 = require('./Auth0');
      expect(Auth0.initialize).toBeInstanceOf(Function);
    });

    test('should not throw', () => {
      expect(() => {
        const Auth0 = require('./Auth0');
        Auth0.initialize();
      }).not.toThrow();
    });

    // TODO: test against the config object
    test('should create a new Auth0Lock instance', () => {
      const Auth0 = require('./Auth0');
      const Auth0Lock = require('auth0-lock');
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
      const Auth0 = require('./Auth0');
      const AuthUtils = require('./AuthUtils');
      Auth0.initialize();
      expect(AuthUtils.getAuthToken).toHaveBeenCalledTimes(1);
    });

    test('should call AuthUtils.hasAuthTokenExpired()', () => {
      const Auth0 = require('./Auth0');
      const AuthUtils = require('./AuthUtils');
      Auth0.initialize();
      expect(AuthUtils.hasAuthTokenExpired).toHaveBeenCalledTimes(1);
      expect(AuthUtils.hasAuthTokenExpired).toHaveBeenCalledWith(MOCK_AUTH_TOKEN);
    });

  });

  describe('getAuth0LockInstance', () => {

    test('should be a function', () => {
      const Auth0 = require('./Auth0');
      expect(Auth0.getAuth0LockInstance).toBeInstanceOf(Function);
    });

    test('should throw if Auth0Lock has not been initialized', () => {
      expect(() => {
        const Auth0 = require('./Auth0');
        Auth0.getAuth0LockInstance();
      }).toThrow();
    });

    test('should return the Auth0Lock instance', () => {

      const mockAuth0LockInstance = {
        test: randomId()
      };

      jest.doMock('auth0-lock', () => jest.fn(() => mockAuth0LockInstance));

      const Auth0 = require('./Auth0');
      Auth0.initialize();
      const auth0LockInstance = Auth0.getAuth0LockInstance();
      expect(auth0LockInstance).toBeDefined();
      expect(auth0LockInstance).toBe(mockAuth0LockInstance);
    });

  });

  describe('parseUrl()', () => {

    test('should be a function', () => {
      const Auth0 = require('./Auth0');
      expect(Auth0.parseUrl).toBeInstanceOf(Function);
    });

    test('should return default object if the given location is missing properties', () => {
      const Auth0 = require('./Auth0');
      expect(Auth0.parseUrl({})).toEqual({
        fragment: '',
        redirectUrl: ''
      });
    });

    test('should not replace url if "access_token" is missing', () => {
      const Auth0 = require('./Auth0');
      const replaceSpy = jest.spyOn(window.location, 'replace');
      const fragment :string = `/id_token=${randomId()}`;
      const url :string = `${MOCK_URL}/#${fragment}`;
      global.jsdom.reconfigure({ url });
      expect(Auth0.parseUrl({ href: url })).toEqual({
        fragment,
        redirectUrl: ''
      });
      expect(replaceSpy).not.toHaveBeenCalled();
    });

    test('should not replace url if "id_token" is missing', () => {
      const Auth0 = require('./Auth0');
      const replaceSpy = jest.spyOn(window.location, 'replace');
      const fragment :string = `/access_token=${randomId()}`;
      const url :string = `${MOCK_URL}/#${fragment}`;
      global.jsdom.reconfigure({ url });
      expect(Auth0.parseUrl({ href: url })).toEqual({
        fragment,
        redirectUrl: ''
      });
      expect(replaceSpy).not.toHaveBeenCalled();
    });

    test('should replace url when both "access_token" and "id_token" are present', () => {

      const Auth0 = require('./Auth0');
      const replaceSpy = jest.spyOn(window.location, 'replace');

      const fragment = `access_token=${randomId()}&id_token=${randomId()}`;
      let url :string = `${MOCK_URL}#${fragment}`;
      global.jsdom.reconfigure({ url });
      expect(Auth0.parseUrl({ href: url })).toEqual({
        fragment,
        redirectUrl: ''
      });
      expect(window.location.href).toEqual(MOCK_LOGIN_URL);

      url = `${MOCK_URL}/#${fragment}`;
      global.jsdom.reconfigure({ url });
      expect(Auth0.parseUrl({ href: url })).toEqual({
        fragment,
        redirectUrl: ''
      });
      expect(window.location.href).toEqual(MOCK_LOGIN_URL);

      url = `${MOCK_URL}/#/${fragment}`;
      global.jsdom.reconfigure({ url });
      expect(Auth0.parseUrl({ href: url })).toEqual({
        fragment: `/${fragment}`,
        redirectUrl: ''
      });
      expect(window.location.href).toEqual(MOCK_LOGIN_URL);

      expect(replaceSpy).toHaveBeenCalledTimes(3);
      expect(replaceSpy).toHaveBeenCalledWith(MOCK_LOGIN_URL);
    });

  });

  describe('authenticate()', () => {

    test('should be a function', () => {
      const Auth0 = require('./Auth0');
      expect(Auth0.authenticate).toBeInstanceOf(Function);
    });

    test('should return a Promise', () => {
      const Auth0 = require('./Auth0');
      const promise = Auth0.authenticate().catch(() => {});
      expect(promise).toEqual(expect.any(Promise));
    });

    test('should fail to authenticate if the url hash path has not been set', (done) => {

      const Auth0 = require('./Auth0');
      Auth0.authenticate()
        .then(() => done.fail())
        .catch((e :Error) => {
          expect(e).toEqual(expect.any(Error));
          expect(e.message).toEqual(ERR_A0L_FRAGMENT_NOT_PARSED);
          done();
        });
    });

    // TODO: how do we mock what "new Auth0Lock" returns?
    // test('should fail to authenticate if the Auth0Lock has not been instantiated', () => {});

    test('should fail to authenticate if Auth0Lock calls on("authorization_error")', (done) => {

      jest.doMock('auth0-lock', () => jest.fn(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authorization_error') {
            callback();
          }
        }),
        resumeAuth: jest.fn()
      })));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      const Auth0 = require('./Auth0');
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

      jest.doMock('auth0-lock', () => jest.fn(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'unrecoverable_error') {
            callback();
          }
        }),
        resumeAuth: jest.fn()
      })));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      const Auth0 = require('./Auth0');
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

      jest.doMock('auth0-lock', () => jest.fn(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authenticated') {
            callback();
          }
        }),
        resumeAuth: jest.fn()
      })));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      const Auth0 = require('./Auth0');
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

      jest.doMock('auth0-lock', () => jest.fn(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authenticated') {
            callback({ idToken: randomId() });
          }
        }),
        resumeAuth: jest.fn()
      })));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      const Auth0 = require('./Auth0');
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

      jest.doMock('auth0-lock', () => jest.fn(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authenticated') {
            callback({ accessToken: randomId() });
          }
        }),
        resumeAuth: jest.fn()
      })));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      const Auth0 = require('./Auth0');
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

      jest.doMock('auth0-lock', () => jest.fn(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authenticated') {
            callback({ accessToken: randomId(), idToken: -1 });
          }
        }),
        resumeAuth: jest.fn()
      })));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      const Auth0 = require('./Auth0');
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

      jest.doMock('auth0-lock', () => jest.fn(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'hash_parsed') {
            callback();
          }
        }),
        resumeAuth: jest.fn()
      })));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      const Auth0 = require('./Auth0');
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

      jest.doMock('auth0-lock', () => jest.fn(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'hash_parsed') {
            callback({ idToken: randomId() });
          }
        }),
        resumeAuth: jest.fn()
      })));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      const Auth0 = require('./Auth0');
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

      jest.doMock('auth0-lock', () => jest.fn(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'hash_parsed') {
            callback({ accessToken: randomId() });
          }
        }),
        resumeAuth: jest.fn()
      })));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      const Auth0 = require('./Auth0');
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

      jest.doMock('auth0-lock', () => jest.fn(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'hash_parsed') {
            callback({ accessToken: randomId(), idToken: -1 });
          }
        }),
        resumeAuth: jest.fn()
      })));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      const Auth0 = require('./Auth0');
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

      jest.doMock('./AuthUtils', () => ({
        clearAuthInfo: jest.fn(),
        getAuthToken: jest.fn(),
        hasAuthTokenExpired: jest.fn(() => false)
      }));

      jest.doMock('auth0-lock', () => jest.fn(() => ({
        on: jest.fn((event :string, callback :Function) => {
          if (event === 'authenticated') {
            callback(mockAuthInfo);
          }
        }),
        resumeAuth: jest.fn()
      })));
      global.jsdom.reconfigure({ url: MOCK_AUTH0_URL });

      const Auth0 = require('./Auth0');
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
