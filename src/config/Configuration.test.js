/*
 * @flow
 */

import Lattice from 'lattice';
import { List, fromJS } from 'immutable';

import * as Config from './Configuration';

import * as Auth0 from '../auth/Auth0';
import { INVALID_PARAMS } from '../utils/testing/InvalidParams';
import { genRandomString } from '../utils/testing/TestUtils';

// injected by Jest
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;

const MOCK_AUTH0_LOCK = fromJS({
  allowSignUp: true,
  logo: '/static/assets/images/logo.abc123.png',
  title: 'OpenLattice, Inc.',
  primaryColor: '#6124e2'
});
const MOCK_AUTH_TOKEN :string = `${genRandomString()}.${genRandomString()}.${genRandomString()}`;

jest.mock('lattice', () => ({
  configure: jest.fn(),
}));

jest.mock('../auth/Auth0');

describe('Configuration', () => {

  beforeEach(() => {

    /*
     *
     * TODO: Configuration.js is not being reloaded for every test, so calling configure() is affecting other tests
     *
     */

    jest.resetModules();
    Auth0.initialize.mockClear();
    Lattice.configure.mockClear();
  });

  describe('configure()', () => {

    test('should throw if configuration object is missing', () => {
      expect(() => {
        Config.configure();
      }).toThrow();
    });

    test('should throw if configuration object is invalid', () => {
      INVALID_PARAMS.forEach((invalid :any) => {
        expect(() => {
          Config.configure(invalid);
        }).toThrow();
      });
    });

    test('should correctly set the configuration object', () => {
      Config.configure({
        auth0Lock: MOCK_AUTH0_LOCK.toJS(),
        authToken: MOCK_AUTH_TOKEN,
        baseUrl: 'production'
      });
      expect(Config.getConfig().toJS()).toEqual({
        auth0ClientId: __AUTH0_CLIENT_ID__,
        auth0Domain: __AUTH0_DOMAIN__,
        auth0Lock: MOCK_AUTH0_LOCK.toJS(),
        authToken: MOCK_AUTH_TOKEN,
        baseUrl: 'https://api.openlattice.com'
      });
      expect(Auth0.initialize).toHaveBeenCalledTimes(1);
    });

    test('should correctly configure lattice-js', () => {

      Config.configure({
        auth0Lock: MOCK_AUTH0_LOCK.toJS(),
        authToken: MOCK_AUTH_TOKEN,
        baseUrl: 'production'
      });

      expect(Auth0.initialize).toHaveBeenCalledTimes(1);
      expect(Lattice.configure).toHaveBeenCalledTimes(1);
      expect(Lattice.configure).toHaveBeenCalledWith({
        authToken: MOCK_AUTH_TOKEN,
        baseUrl: 'https://api.openlattice.com',
        csrfToken: null,
      });
    });

    describe('auth0ClientId', () => {

      test('should not throw if auth0ClientId is missing', () => {
        expect(() => {
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
        }).not.toThrow();
      });

      test('should throw if auth0ClientId is invalid', () => {
        List(INVALID_PARAMS)
          .delete(0) // remove undefined
          .delete(0) // remove null
          .delete(14) // remove "invalid_special_string_value"
          .forEach((invalid :any) => {
            expect(() => {
              Config.configure({
                auth0ClientId: invalid,
                auth0Lock: MOCK_AUTH0_LOCK.toJS(),
                authToken: MOCK_AUTH_TOKEN,
                baseUrl: 'localhost'
              });
            }).toThrow();
          });
      });

      test('should correctly set the default auth0ClientId if it is not specified', () => {
        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'localhost'
        });
        expect(Config.getConfig().get('auth0ClientId')).toEqual(__AUTH0_CLIENT_ID__);
      });

      test('should correctly set auth0ClientId', () => {
        const mockValue = genRandomString();
        Config.configure({
          auth0ClientId: mockValue,
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'localhost'
        });
        expect(Config.getConfig().get('auth0ClientId')).toEqual(mockValue);
      });

    });

    describe('auth0Domain', () => {

      test('should not throw if auth0Domain is missing', () => {
        expect(() => {
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
        }).not.toThrow();
      });

      test('should throw if auth0Domain is invalid', () => {
        List(INVALID_PARAMS)
          .delete(0) // remove undefined
          .delete(0) // remove null
          .delete(14) // remove "invalid_special_string_value"
          .forEach((invalid :any) => {
            expect(() => {
              Config.configure({
                auth0Domain: invalid,
                auth0Lock: MOCK_AUTH0_LOCK.toJS(),
                authToken: MOCK_AUTH_TOKEN,
                baseUrl: 'localhost'
              });
            }).toThrow();
          });
      });

      test('should correctly set the default auth0Domain if it is not specified', () => {
        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'localhost'
        });
        expect(Config.getConfig().get('auth0Domain')).toEqual(__AUTH0_DOMAIN__);
      });

      test('should correctly set auth0Domain', () => {
        const mockValue = genRandomString();
        Config.configure({
          auth0Domain: mockValue,
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'localhost'
        });
        expect(Config.getConfig().get('auth0Domain')).toEqual(mockValue);
      });

    });

    describe('auth0Lock', () => {

      test('should not throw if auth0Lock is missing', () => {
        expect(() => {
          Config.configure({
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
        }).not.toThrow();
      });

      test('should throw if auth0Lock is invalid', () => {
        List(INVALID_PARAMS)
          .delete(0) // remove undefined
          .delete(0) // remove null
          .forEach((invalid :any) => {
            expect(() => {
              Config.configure({
                auth0Lock: invalid,
                authToken: MOCK_AUTH_TOKEN,
                baseUrl: 'localhost'
              });
            }).toThrow();
          });
      });

      describe('allowSignUp', () => {

        test('should not throw if auth0Lock.allowSignUp is missing', () => {
          expect(() => {
            Config.configure({
              auth0Lock: MOCK_AUTH0_LOCK.delete('allowSignUp').toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).not.toThrow();
        });

        test('should throw if auth0Lock.allowSignUp is invalid', () => {
          const errors = [];
          List(INVALID_PARAMS)
            .delete(0) // remove undefined
            .delete(0) // remove null
            .delete(4) // remove true
            .delete(4) // remove false
            .delete(4) // remove new Boolean(true)
            .delete(4) // remove new Boolean(false)
            .forEach((invalid :any) => {
              try {
                Config.configure({
                  auth0Lock: MOCK_AUTH0_LOCK.set('allowSignUp', invalid).toJS(),
                  authToken: MOCK_AUTH_TOKEN,
                  baseUrl: 'localhost'
                });
                errors.push(`expected to throw - ${JSON.stringify(invalid)}`);
              }
              catch (e) { /* pass */ }
            });
          expect(errors).toEqual([]);
        });

        test('should correctly set auth0Lock.allowSignUp', () => {
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.set('allowSignUp', true).toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost',
          });
          expect(Config.getConfig().getIn(['auth0Lock', 'allowSignUp'])).toEqual(true);
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.set('allowSignUp', false).toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost',
          });
          expect(Config.getConfig().getIn(['auth0Lock', 'allowSignUp'])).toEqual(false);
        });

      });

      describe('logo', () => {

        test('should not throw if auth0Lock.logo is missing', () => {
          expect(() => {
            Config.configure({
              auth0Lock: MOCK_AUTH0_LOCK.delete('logo').toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).not.toThrow();
        });

        test('should throw if auth0Lock.logo is invalid', () => {
          List(INVALID_PARAMS)
            .delete(0) // remove undefined
            .delete(0) // remove null
            .delete(14) // remove "invalid_special_string_value"
            .forEach((invalid :any) => {
              expect(() => {
                Config.configure({
                  auth0Lock: MOCK_AUTH0_LOCK.set('logo', invalid).toJS(),
                  authToken: MOCK_AUTH_TOKEN,
                  baseUrl: 'localhost'
                });
              }).toThrow();
            });
        });

        // test('should correctly set the default auth0Lock.logo if it is not specified', () => {
        //   Config.configure({
        //     authToken: MOCK_AUTH_TOKEN,
        //     baseUrl: 'localhost'
        //   });
        //   expect(Config.getConfig().getIn(['auth0Lock', 'logo'])).toEqual('__FIGURE_THIS_OUT__');
        // });

        test('should correctly set auth0Lock.logo', () => {
          const mockValue :string = genRandomString();
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.set('logo', mockValue).toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
          expect(Config.getConfig().getIn(['auth0Lock', 'logo'])).toEqual(mockValue);
        });

      });

      describe('primaryColor', () => {

        test('should not throw if auth0Lock.primaryColor is missing', () => {
          expect(() => {
            Config.configure({
              auth0Lock: MOCK_AUTH0_LOCK.delete('primaryColor').toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).not.toThrow();
        });

        test('should throw if auth0Lock.primaryColor is invalid', () => {
          const errors = [];
          List(INVALID_PARAMS)
            .delete(0) // remove undefined
            .delete(0) // remove null
            .delete(14) // remove "invalid_special_string_value"
            .forEach((invalid :any) => {
              try {
                Config.configure({
                  auth0Lock: MOCK_AUTH0_LOCK.set('primaryColor', invalid).toJS(),
                  authToken: MOCK_AUTH_TOKEN,
                  baseUrl: 'localhost'
                });
                errors.push(`expected to throw - ${JSON.stringify(invalid)}`);
              }
              catch (e) { /* pass */ }
            });
          expect(errors).toEqual([]);
        });

        test('should correctly set auth0Lock.primaryColor', () => {
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.set('primaryColor', 'deeppink').toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost',
          });
          expect(Config.getConfig().getIn(['auth0Lock', 'primaryColor'])).toEqual('deeppink');
        });

      });

      describe('title', () => {

        test('should not throw if auth0Lock.title is missing', () => {
          expect(() => {
            Config.configure({
              auth0Lock: MOCK_AUTH0_LOCK.delete('title').toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).not.toThrow();
        });

        test('should throw if auth0Lock.title is invalid', () => {
          List(INVALID_PARAMS)
            .delete(0) // remove undefined
            .delete(0) // remove null
            .delete(14) // remove "invalid_special_string_value"
            .forEach((invalid :any) => {
              expect(() => {
                Config.configure({
                  auth0Lock: MOCK_AUTH0_LOCK.set('title', invalid).toJS(),
                  authToken: MOCK_AUTH_TOKEN,
                  baseUrl: 'localhost'
                });
              }).toThrow();
            });
        });

        // test('should correctly set the default auth0Lock.title if it is not specified', () => {
        //   Config.configure({
        //     authToken: MOCK_AUTH_TOKEN,
        //     baseUrl: 'localhost'
        //   });
        //   expect(Config.getConfig().getIn(['auth0Lock', 'title'])).toEqual('__FIGURE_THIS_OUT__');
        // });

        test('should correctly set auth0Lock.title', () => {
          const mockValue :string = genRandomString();
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.set('title', mockValue).toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
          expect(Config.getConfig().getIn(['auth0Lock', 'title'])).toEqual(mockValue);
        });

      });

    });

    describe('authToken', () => {

      test('should not throw if authToken is missing', () => {
        expect(() => {
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            baseUrl: 'localhost'
          });
        }).not.toThrow();
      });

      test('should throw if authToken is invalid', () => {
        List(INVALID_PARAMS)
          .delete(0) // remove undefined
          .delete(0) // remove null
          .delete(14) // remove "invalid_special_string_value"
          .forEach((invalid :any) => {
            expect(() => {
              Config.configure({
                auth0Lock: MOCK_AUTH0_LOCK.toJS(),
                authToken: invalid,
                baseUrl: 'localhost'
              });
            }).toThrow();
          });
      });

      test('should correctly set authToken', () => {
        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'localhost'
        });
        expect(Config.getConfig().get('authToken')).toEqual(MOCK_AUTH_TOKEN);
      });

    });

    describe('baseUrl', () => {

      test('should not throw if baseUrl is missing', () => {
        expect(() => {
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            authToken: MOCK_AUTH_TOKEN
          });
        }).not.toThrow();
      });

      test('should throw if baseUrl is invalid', () => {
        List(INVALID_PARAMS)
          .delete(0) // remove undefined
          .delete(0) // remove null
          .delete(14) // remove 'invalid_special_string_value'
          .forEach((invalid :any) => {
            expect(() => {
              Config.configure({
                auth0Lock: MOCK_AUTH0_LOCK.toJS(),
                authToken: MOCK_AUTH_TOKEN,
                baseUrl: invalid
              });
            }).toThrow();
          });
      });

      test('should correctly set baseUrl when a valid URL is passed in', () => {

        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'https://api.v2.openlattice.com'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('https://api.v2.openlattice.com');
      });

      test('should correctly set baseUrl to "http://localhost:8080"', () => {

        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'localhost'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('http://localhost:8080');

        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'http://localhost:8080'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('http://localhost:8080');
      });

      test('should correctly set baseUrl to "https://api.staging.openlattice.com"', () => {

        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'staging'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('https://api.staging.openlattice.com');

        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'https://api.staging.openlattice.com'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('https://api.staging.openlattice.com');
      });

      test('should correctly set baseUrl to "https://api.openlattice.com"', () => {

        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'production'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('https://api.openlattice.com');

        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'https://api.openlattice.com'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('https://api.openlattice.com');
      });

    });

  });

  describe('getConfig()', () => {

    test('should be an instance of Immutable.Map', () => {
      // expect(Config.getConfig()).toBeInstanceOf(Immutable.Map);
      expect(Config.getConfig()['@@__IMMUTABLE_MAP__@@']).toEqual(true);
    });

    test('should not be mutable', () => {
      Config.getConfig().set('foo', 'bar');
      expect(Config.getConfig().get('foo')).toBeUndefined();
    });

    test('should not be empty', () => {
      expect(Config.getConfig().isEmpty()).toEqual(false);
    });

  });

});
