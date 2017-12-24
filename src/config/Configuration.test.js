/*
 * @flow
 */

/* eslint-disable global-require */

import Immutable from 'immutable';
import Lattice from 'lattice';

import * as Auth0 from '../auth/Auth0';
import * as Config from './Configuration';
import { randomId } from '../utils/Utils';
import {
  INVALID_PARAMS,
  INVALID_PARAMS_EMPTY_STRING_ALLOWED,
  INVALID_PARAMS_NOT_DEFINED_ALLOWED
} from '../utils/testing/Invalid';

// injected by Webpack.DefinePlugin
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;

const MOCK_AUTH0_LOCK = Immutable.fromJS({
  logo: '/static/assets/images/logo.abc123.png',
  redirectUrl: 'https://openlattice.com',
  title: 'OpenLattice, Inc.'
});
const MOCK_AUTH_TOKEN :string = `${randomId()}.${randomId()}.${randomId()}`;

jest.mock('../auth/Auth0');

describe('Configuration', () => {

  beforeEach(() => {
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
      const expectedConfig :Map<*, *> = Immutable.fromJS({
        auth0ClientId: __AUTH0_CLIENT_ID__,
        auth0Domain: __AUTH0_DOMAIN__,
        auth0Lock: MOCK_AUTH0_LOCK,
        authToken: `Bearer ${MOCK_AUTH_TOKEN}`,
        baseUrl: 'https://api.openlattice.com'
      });
      expect(Config.getConfig().equals(expectedConfig)).toEqual(true);
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
        baseUrl: 'production'
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
        INVALID_PARAMS_NOT_DEFINED_ALLOWED.forEach((invalid :any) => {
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
        const mockValue = randomId();
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
        INVALID_PARAMS_NOT_DEFINED_ALLOWED.forEach((invalid :any) => {
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
        const mockValue = randomId();
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

      test('should throw if auth0Lock is missing', () => {
        expect(() => {
          Config.configure({
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
        }).toThrow();
      });

      test('should throw if auth0Lock is invalid', () => {
        INVALID_PARAMS.forEach((invalid :any) => {
          expect(() => {
            Config.configure({
              auth0Lock: invalid,
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).toThrow();
        });
      });

      describe('logo', () => {

        test('should throw if auth0Lock.logo is missing', () => {
          expect(() => {
            Config.configure({
              auth0Lock: MOCK_AUTH0_LOCK.delete('logo').toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).toThrow();
        });

        test('should throw if auth0Lock.logo is invalid', () => {
          INVALID_PARAMS.forEach((invalid :any) => {
            expect(() => {
              Config.configure({
                auth0Lock: MOCK_AUTH0_LOCK.set('logo', invalid).toJS(),
                authToken: MOCK_AUTH_TOKEN,
                baseUrl: 'localhost'
              });
            }).toThrow();
          });
        });

        test('should correctly set auth0Lock.logo', () => {
          const mockValue :string = randomId();
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.set('logo', mockValue).toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
          expect(Config.getConfig().getIn(['auth0Lock', 'logo'])).toEqual(mockValue);
        });

      });

      describe('redirectUrl', () => {

        test('should not throw if auth0Lock.redirectUrl is missing', () => {
          expect(() => {
            Config.configure({
              auth0Lock: MOCK_AUTH0_LOCK.delete('redirectUrl').toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).not.toThrow();
        });

        test('should not throw if auth0Lock.redirectUrl is null', () => {
          expect(() => {
            Config.configure({
              auth0Lock: MOCK_AUTH0_LOCK.set('redirectUrl', null).toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).not.toThrow();
        });

        test('should not throw if auth0Lock.redirectUrl is undefined', () => {
          expect(() => {
            Config.configure({
              auth0Lock: MOCK_AUTH0_LOCK.set('redirectUrl', undefined).toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).not.toThrow();
        });

        test('should throw if auth0Lock.redirectUrl is invalid', () => {
          INVALID_PARAMS_NOT_DEFINED_ALLOWED.forEach((invalid :any) => {
            expect(() => {
              Config.configure({
                auth0Lock: MOCK_AUTH0_LOCK.set('redirectUrl', invalid).toJS(),
                authToken: MOCK_AUTH_TOKEN,
                baseUrl: 'localhost'
              });
            }).toThrow();
          });
        });

        test('should correctly set auth0Lock.redirectUrl to the empty string', () => {
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.delete('redirectUrl').toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
          expect(Config.getConfig().getIn(['auth0Lock', 'redirectUrl'])).toEqual('');
        });

        test('should correctly set auth0Lock.redirectUrl', () => {
          const mockValue :string = randomId();
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.set('redirectUrl', mockValue).toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
          expect(Config.getConfig().getIn(['auth0Lock', 'redirectUrl'])).toEqual(mockValue);
        });

      });

      describe('title', () => {

        test('should throw if auth0Lock.title is missing', () => {
          expect(() => {
            Config.configure({
              auth0Lock: MOCK_AUTH0_LOCK.delete('title').toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).toThrow();
        });

        test('should throw if auth0Lock.title is invalid', () => {
          INVALID_PARAMS.forEach((invalid :any) => {
            expect(() => {
              Config.configure({
                auth0Lock: MOCK_AUTH0_LOCK.set('title', invalid).toJS(),
                authToken: MOCK_AUTH_TOKEN,
                baseUrl: 'localhost'
              });
            }).toThrow();
          });
        });

        test('should correctly set auth0Lock.title', () => {
          const mockValue :string = randomId();
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
        INVALID_PARAMS_EMPTY_STRING_ALLOWED.forEach((invalid :any) => {
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
        expect(Config.getConfig().get('authToken')).toEqual(`Bearer ${MOCK_AUTH_TOKEN}`);
      });

    });

    describe('baseUrl', () => {

      test('should throw if baseUrl is missing', () => {
        expect(() => {
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            authToken: MOCK_AUTH_TOKEN
          });
        }).toThrow();
      });

      test('should throw if baseUrl is invalid', () => {
        INVALID_PARAMS.forEach((invalid :any) => {
          expect(() => {
            Config.configure({
              auth0Lock: MOCK_AUTH0_LOCK.toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: invalid
            });
          }).toThrow();
        });
      });

      test('should throw if baseUrl is not https', () => {
        expect(() => {
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'http://api.openlattice.com'
          });
        }).toThrow();
      });

      test('should throw if baseUrl does not match known URLs', () => {

        expect(() => {
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'justbeamit.com'
          });
        }).toThrow();

        expect(() => {
          Config.configure({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'https://justbeamit.com'
          });
        }).toThrow();
      });

      test('should correctly set baseUrl when a valid URL is passed in', () => {

        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'https://api.staging.openlattice.com'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('https://api.staging.openlattice.com');

        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'https://api.openlattice.com'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('https://api.openlattice.com');
      });

      test('should correctly set baseUrl to "http://localhost:8080"', () => {
        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'localhost'
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
      });

      test('should correctly set baseUrl to "https://api.openlattice.com"', () => {
        Config.configure({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'production'
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

    test('should not be empty', () => {
      expect(Config.getConfig().isEmpty()).toEqual(false);
    });

    it('should not be mutable', () => {
      Config.getConfig().set('foo', 'bar');
      expect(Config.getConfig().get('foo')).toBeUndefined();
    });

  });

});
