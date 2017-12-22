/*
 * @flow
 */

import Immutable from 'immutable';
import Lattice from 'lattice';

import Logger from '../utils/Logger';
import { isNonEmptyObject, isNonEmptyString } from '../utils/LangUtils';

// injected by Webpack.DefinePlugin
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;
declare var __PROD__ :boolean;

const LOG = new Logger('Configuration');

const ENV_URLS :Map<string, string> = Immutable.fromJS({
  LOCAL: 'http://localhost:8080',
  STAGING: 'https://api.staging.openlattice.com',
  PRODUCTION: 'https://api.openlattice.com'
});

let configuration :Map<*, *> = Immutable.fromJS({
  auth0ClientId: __AUTH0_CLIENT_ID__,
  auth0Domain: __AUTH0_DOMAIN__,
  auth0Lock: {
    logo: '',
    redirectUrl: '',
    title: 'OpenLattice'
  },
  authToken: '',
  baseUrl: ''
});


function configureLatticeJs(authToken :string, baseUrl :string) {

  Lattice.configure({ authToken, baseUrl });
}

function setAuth0Lock(config :LatticeAuthConfig) :void {

  if (isNonEmptyString(config.auth0Lock.logo)) {
    configuration = configuration.setIn(['auth0Lock', 'logo'], config.auth0Lock.logo);
  }
  else {
    const errorMsg = 'invalid parameter - auth0Lock.logo must be a non-empty string';
    LOG.error(errorMsg, config.auth0Lock.logo);
    throw new Error(errorMsg);
  }

  if (isNonEmptyString(config.auth0Lock.title)) {
    configuration = configuration.setIn(['auth0Lock', 'title'], config.auth0Lock.title);
  }
  else {
    const errorMsg = 'invalid parameter - auth0Lock.title must be a non-empty string';
    LOG.error(errorMsg, config.auth0Lock.title);
    throw new Error(errorMsg);
  }

  // redirectUrl is optional, so null and undefined are allowed
  if (config.auth0Lock.redirectUrl === null || config.auth0Lock.redirectUrl === undefined) {
    configuration = configuration.setIn(['auth0Lock', 'redirectUrl'], '');
  }
  else if (isNonEmptyString(config.auth0Lock.redirectUrl)) {
    configuration = configuration.setIn(['auth0Lock', 'redirectUrl'], config.auth0Lock.redirectUrl);
  }
  else {
    const errorMsg = 'invalid parameter - auth0Lock.redirectUrl must be a non-empty string';
    LOG.error(errorMsg, config.authToken);
    throw new Error(errorMsg);
  }
}

function setAuthToken(config :LatticeAuthConfig) :void {

  // TODO: add at least some minimal validation checks against the authToken string
  if (isNonEmptyString(config.authToken)) {
    configuration = configuration.set('authToken', `Bearer ${config.authToken}`);
  }
  else {
    const errorMsg = 'invalid parameter - authToken must be a non-empty string';
    LOG.error(errorMsg, config.authToken);
    throw new Error(errorMsg);
  }
}

function setBaseUrl(config :LatticeAuthConfig) :void {

  if (isNonEmptyString(config.baseUrl)) {
    if (config.baseUrl === 'localhost') {
      configuration = configuration.set('baseUrl', ENV_URLS.get('LOCAL'));
    }
    else if (config.baseUrl === 'staging') {
      configuration = configuration.set('baseUrl', ENV_URLS.get('STAGING'));
    }
    else if (config.baseUrl === 'production') {
      configuration = configuration.set('baseUrl', ENV_URLS.get('PRODUCTION'));
    }
    // mild url validation to at least check the protocol and domain
    else if (config.baseUrl.startsWith('https://') && config.baseUrl.endsWith('openlattice.com')) {
      configuration = configuration.set('baseUrl', config.baseUrl);
    }
    else {
      const errorMsg = 'invalid parameter - baseUrl must be a valid URL';
      LOG.error(errorMsg, config.baseUrl);
      throw new Error(errorMsg);
    }
  }
  else {
    const errorMsg = 'invalid parameter - baseUrl must be a non-empty string';
    LOG.error(errorMsg, config.baseUrl);
    throw new Error(errorMsg);
  }
}

// TODO: should we make __AUTH0_CLIENT_ID__ && __AUTH0_DOMAIN__ configurable?
function configureLatticeAuth(config :LatticeAuthConfig) :void {

  if (!isNonEmptyObject(config)) {
    const errorMsg = 'invalid parameter - config must be a non-empty configuration object';
    LOG.error(errorMsg, config);
    throw new Error(errorMsg);
  }

  setAuth0Lock(config);
  setAuthToken(config);
  setBaseUrl(config);

  configureLatticeJs(config.authToken, config.baseUrl);
}

function getConfig() :Map<*, *> {

  return configuration;
}

export {
  configureLatticeAuth,
  configureLatticeJs,
  getConfig
};
