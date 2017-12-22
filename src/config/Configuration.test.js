/*
 * @flow
 */

/* eslint-disable global-require */

import Immutable from 'immutable';
// import Lattice from 'lattice';

import { INVALID_PARAMS, INVALID_PARAMS_NOT_DEFINED_ALLOWED } from '../utils/testing/Invalid';
import { randomId } from '../utils/Utils';

// injected by Webpack.DefinePlugin
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;

let Config = null;
let Lattice = null;

const MOCK_AUTH_TOKEN :string = 'j.w.t';
const MOCK_AUTH0_LOCK = Immutable.fromJS({
  logo: '/static/assets/images/logo.abc123.png',
  redirectUrl: 'https://openlattice.com',
  title: 'OpenLattice, Inc.'
});

jest.mock('lattice', () => ({
  configure: jest.fn()
}));

describe('Configuration', () => {

  beforeEach(() => {
    jest.resetModules();
    Lattice = require('lattice');
    Config = require('./Configuration');
  });

  describe('configureLatticeAuth()', () => {

    test('should throw if configuration object is missing', () => {
      expect(() => {
        Config.configureLatticeAuth();
      }).toThrow();
    });

    test('should throw if configuration object is invalid', () => {
      INVALID_PARAMS.forEach((invalid :any) => {
        expect(() => {
          Config.configureLatticeAuth(invalid);
        }).toThrow();
      });
    });

    test('should correctly set the configuration object', () => {
      Config.configureLatticeAuth({
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
    });

    test('should correctly configure lattice-js', () => {

      Config.configureLatticeAuth({
        auth0Lock: MOCK_AUTH0_LOCK.toJS(),
        authToken: MOCK_AUTH_TOKEN,
        baseUrl: 'production'
      });

      expect(Lattice.configure).toHaveBeenCalledTimes(1);
      expect(Lattice.configure).toHaveBeenCalledWith({
        authToken: MOCK_AUTH_TOKEN,
        baseUrl: 'production'
      });
    });

    describe('auth0Lock', () => {

      test('should throw if auth0Lock is missing', () => {
        expect(() => {
          Config.configureLatticeAuth({
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
        }).toThrow();
      });

      test('should throw if auth0Lock is invalid', () => {
        INVALID_PARAMS.forEach((invalid :any) => {
          expect(() => {
            Config.configureLatticeAuth({
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
            Config.configureLatticeAuth({
              auth0Lock: MOCK_AUTH0_LOCK.delete('logo').toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).toThrow();
        });

        test('should throw if auth0Lock.logo is invalid', () => {
          INVALID_PARAMS.forEach((invalid :any) => {
            expect(() => {
              Config.configureLatticeAuth({
                auth0Lock: MOCK_AUTH0_LOCK.set('logo', invalid).toJS(),
                authToken: MOCK_AUTH_TOKEN,
                baseUrl: 'localhost'
              });
            }).toThrow();
          });
        });

        test('should correctly set auth0Lock.logo', () => {
          const mockValue :string = randomId();
          Config.configureLatticeAuth({
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
            Config.configureLatticeAuth({
              auth0Lock: MOCK_AUTH0_LOCK.delete('redirectUrl').toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).not.toThrow();
        });

        test('should not throw if auth0Lock.redirectUrl is null', () => {
          expect(() => {
            Config.configureLatticeAuth({
              auth0Lock: MOCK_AUTH0_LOCK.set('redirectUrl', null).toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).not.toThrow();
        });

        test('should not throw if auth0Lock.redirectUrl is undefined', () => {
          expect(() => {
            Config.configureLatticeAuth({
              auth0Lock: MOCK_AUTH0_LOCK.set('redirectUrl', undefined).toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).not.toThrow();
        });

        test('should throw if auth0Lock.redirectUrl is invalid', () => {
          INVALID_PARAMS_NOT_DEFINED_ALLOWED.forEach((invalid :any) => {
            expect(() => {
              Config.configureLatticeAuth({
                auth0Lock: MOCK_AUTH0_LOCK.set('redirectUrl', invalid).toJS(),
                authToken: MOCK_AUTH_TOKEN,
                baseUrl: 'localhost'
              });
            }).toThrow();
          });
        });

        test('should correctly set auth0Lock.redirectUrl to the empty string', () => {
          Config.configureLatticeAuth({
            auth0Lock: MOCK_AUTH0_LOCK.delete('redirectUrl').toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
          expect(Config.getConfig().getIn(['auth0Lock', 'redirectUrl'])).toEqual('');
        });

        test('should correctly set auth0Lock.redirectUrl', () => {
          const mockValue :string = randomId();
          Config.configureLatticeAuth({
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
            Config.configureLatticeAuth({
              auth0Lock: MOCK_AUTH0_LOCK.delete('title').toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: 'localhost'
            });
          }).toThrow();
        });

        test('should throw if auth0Lock.title is invalid', () => {
          INVALID_PARAMS.forEach((invalid :any) => {
            expect(() => {
              Config.configureLatticeAuth({
                auth0Lock: MOCK_AUTH0_LOCK.set('title', invalid).toJS(),
                authToken: MOCK_AUTH_TOKEN,
                baseUrl: 'localhost'
              });
            }).toThrow();
          });
        });

        test('should correctly set auth0Lock.title', () => {
          const mockValue :string = randomId();
          Config.configureLatticeAuth({
            auth0Lock: MOCK_AUTH0_LOCK.set('title', mockValue).toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'localhost'
          });
          expect(Config.getConfig().getIn(['auth0Lock', 'title'])).toEqual(mockValue);
        });

      });

    });

    describe('authToken', () => {

      test('should throw if authToken is missing', () => {
        expect(() => {
          Config.configureLatticeAuth({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            baseUrl: 'localhost'
          });
        }).toThrow();
      });

      test('should throw if authToken is invalid', () => {
        INVALID_PARAMS.forEach((invalid :any) => {
          expect(() => {
            Config.configureLatticeAuth({
              auth0Lock: MOCK_AUTH0_LOCK.toJS(),
              authToken: invalid,
              baseUrl: 'localhost'
            });
          }).toThrow();
        });
      });

      test('should correctly set authToken', () => {
        Config.configureLatticeAuth({
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
          Config.configureLatticeAuth({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            authToken: MOCK_AUTH_TOKEN
          });
        }).toThrow();
      });

      test('should throw if baseUrl is invalid', () => {
        INVALID_PARAMS.forEach((invalid :any) => {
          expect(() => {
            Config.configureLatticeAuth({
              auth0Lock: MOCK_AUTH0_LOCK.toJS(),
              authToken: MOCK_AUTH_TOKEN,
              baseUrl: invalid
            });
          }).toThrow();
        });
      });

      test('should throw if baseUrl is not https', () => {
        expect(() => {
          Config.configureLatticeAuth({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'http://api.openlattice.com'
          });
        }).toThrow();
      });

      test('should throw if baseUrl does not match known URLs', () => {

        expect(() => {
          Config.configureLatticeAuth({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'justbeamit.com'
          });
        }).toThrow();

        expect(() => {
          Config.configureLatticeAuth({
            auth0Lock: MOCK_AUTH0_LOCK.toJS(),
            authToken: MOCK_AUTH_TOKEN,
            baseUrl: 'https://justbeamit.com'
          });
        }).toThrow();
      });

      test('should correctly set baseUrl when a valid URL is passed in', () => {

        Config.configureLatticeAuth({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'https://api.staging.openlattice.com'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('https://api.staging.openlattice.com');

        Config.configureLatticeAuth({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'https://api.openlattice.com'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('https://api.openlattice.com');
      });

      test('should correctly set baseUrl to "http://localhost:8080"', () => {
        Config.configureLatticeAuth({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'localhost'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('http://localhost:8080');
      });

      test('should correctly set baseUrl to "https://api.staging.openlattice.com"', () => {
        Config.configureLatticeAuth({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'staging'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('https://api.staging.openlattice.com');
      });

      test('should correctly set baseUrl to "https://api.openlattice.com"', () => {
        Config.configureLatticeAuth({
          auth0Lock: MOCK_AUTH0_LOCK.toJS(),
          authToken: MOCK_AUTH_TOKEN,
          baseUrl: 'production'
        });
        expect(Config.getConfig().get('baseUrl')).toEqual('https://api.openlattice.com');
      });

    });

  });

  // describe('configureLatticeJs()', () => {
  //
  // });

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
