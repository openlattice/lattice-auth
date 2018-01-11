/*
 * @flow
 */

import Immutable from 'immutable';
import Lattice from 'lattice';

import Logger from '../utils/Logger';
import * as Auth0 from '../auth/Auth0';
import { isNonEmptyObject, isNonEmptyString } from '../utils/LangUtils';

// injected by Webpack.DefinePlugin
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;

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
    title: 'OpenLattice'
  },
  authToken: '',
  baseUrl: ''
});

function setAuth0ClientId(config :LatticeAuthConfig) :void {

  // auth0ClientId is optional, so null and undefined are allowed
  if (config.auth0ClientId === null || config.auth0ClientId === undefined) {
    LOG.warn(`auth0ClientId has not been configured, defaulting to ${configuration.get('auth0ClientId')}`);
  }
  else if (isNonEmptyString(config.auth0ClientId)) {
    configuration = configuration.set('auth0ClientId', config.auth0ClientId);
  }
  else {
    const errorMsg = 'invalid parameter - auth0ClientId must be a non-empty string';
    LOG.error(errorMsg, config.auth0ClientId);
    throw new Error(errorMsg);
  }
}

function setAuth0Domain(config :LatticeAuthConfig) :void {

  // auth0Domain is optional, so null and undefined are allowed
  if (config.auth0Domain === null || config.auth0Domain === undefined) {
    LOG.warn(`auth0Domain has not been configured, defaulting to ${configuration.get('auth0Domain')}`);
  }
  else if (isNonEmptyString(config.auth0Domain)) {
    configuration = configuration.set('auth0Domain', config.auth0Domain);
  }
  else {
    const errorMsg = 'invalid parameter - auth0Domain must be a non-empty string';
    LOG.error(errorMsg, config.auth0Domain);
    throw new Error(errorMsg);
  }
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
}

function setAuthToken(config :LatticeAuthConfig) :void {

  // authToken is optional, so null and undefined are allowed
  if (config.authToken === null || config.authToken === undefined) {
    LOG.warn('authToken has not been configured, expect errors');
    configuration = configuration.delete('authToken');
  }
  else if (isNonEmptyString(config.authToken)) {
    // TODO: add at least some minimal validation checks against the authToken string
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

// TODO: should __AUTH0_CLIENT_ID__ && __AUTH0_DOMAIN__ be configurable?
function configure(config :LatticeAuthConfig) :void {

  if (!isNonEmptyObject(config)) {
    const errorMsg = 'invalid parameter - config must be a non-empty configuration object';
    LOG.error(errorMsg, config);
    throw new Error(errorMsg);
  }

  setAuth0ClientId(config);
  setAuth0Domain(config);
  setAuth0Lock(config);
  setAuthToken(config);
  setBaseUrl(config);

  Auth0.initialize();
  Lattice.configure({
    authToken: config.authToken,
    baseUrl: config.baseUrl
  });
}

function getConfig() :Map<*, *> {

  return configuration;
}

export {
  configure,
  getConfig
};
