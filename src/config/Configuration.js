/*
 * @flow
 */

import Lattice from 'lattice';
import { Map, fromJS } from 'immutable';

import OpenLatticeLogo from '../assets/images/logo-vertical-primary.png';
import Logger from '../utils/Logger';
import * as Auth0 from '../auth/Auth0';
import * as AuthUtils from '../auth/AuthUtils';
import { isNonEmptyObject, isNonEmptyString } from '../utils/LangUtils';

// injected by Webpack.DefinePlugin
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;

type LatticeAuthConfig = {
  auth0ClientId ?:string;
  auth0Domain ?:string;
  auth0Lock ?:{
    logo ?:string;
    primaryColor ?:string;
    redirectUrl ?:string;
    title ?:string;
  };
  authToken ?:?string;
  baseUrl ?:?string;
};

const LOG :Logger = new Logger('Configuration');

// TODO: import enviroment URLs from lattice
const ENV_URLS :Map<string, string> = fromJS({
  LOCAL: 'http://localhost:8080',
  STAGING: 'https://api.staging.openlattice.com',
  PRODUCTION: 'https://api.openlattice.com'
});

function getDefaultBaseUrl() :string {

  let baseUrl :string = '';

  if (window && window.location && window.location.hostname) {
    const hostname :string = window.location.hostname;
    if (hostname === 'localhost') {
      baseUrl = 'localhost';
    }
    else if (hostname.endsWith('openlattice.com')) {
      baseUrl = hostname.startsWith('staging') ? 'staging' : 'production';
    }
  }

  return baseUrl;
}

let configuration :Map<string, *> = fromJS({
  auth0ClientId: __AUTH0_CLIENT_ID__,
  auth0Domain: __AUTH0_DOMAIN__,
  auth0Lock: {
    logo: OpenLatticeLogo,
    primaryColor: '#6124e2'
  },
  authToken: '',
  baseUrl: getDefaultBaseUrl(),
});

function getConfig() :Map<string, *> {

  return configuration;
}

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

  // auth0Lock is optional, so null and undefined are allowed
  if (config.auth0Lock === null || config.auth0Lock === undefined) {
    LOG.warn('auth0Lock has not been configured, using default configuration');
    return;
  }
  if (!isNonEmptyObject(config.auth0Lock)) {
    const errorMsg = 'invalid parameter - auth0Lock must be a non-empty object';
    LOG.error(errorMsg, config.auth0Lock.title);
    throw new Error(errorMsg);
  }

  // auth0Lock.logo is optional, so null and undefined are allowed
  if (config.auth0Lock.logo === null || config.auth0Lock.logo === undefined) {
    LOG.warn(`auth0Lock.logo has not been configured, defaulting to ${configuration.getIn(['auth0Lock', 'logo'])}`);
  }
  else if (isNonEmptyString(config.auth0Lock.logo)) {
    configuration = configuration.setIn(['auth0Lock', 'logo'], config.auth0Lock.logo);
  }
  else {
    const errorMsg = 'invalid parameter - auth0Lock.logo must be a non-empty string';
    LOG.error(errorMsg, config.auth0Lock.logo);
    throw new Error(errorMsg);
  }

  // auth0Lock.title is optional, so null and undefined are allowed
  if (config.auth0Lock.title === null || config.auth0Lock.title === undefined) {
    LOG.warn(`auth0Lock.title has not been configured, defaulting to ${configuration.getIn(['auth0Lock', 'title'])}`);
  }
  else if (isNonEmptyString(config.auth0Lock.title)) {
    configuration = configuration.setIn(['auth0Lock', 'title'], config.auth0Lock.title);
  }
  else {
    const errorMsg = 'invalid parameter - auth0Lock.title must be a non-empty string';
    LOG.error(errorMsg, config.auth0Lock.title);
    throw new Error(errorMsg);
  }

  // auth0Lock.primaryÇolor is optional, so null and undefined are allowed
  if (config.auth0Lock.primaryColor === null || config.auth0Lock.primaryColor === undefined) {
    const color = configuration.getIn(['auth0Lock', 'primaryColor']);
    LOG.warn(`auth0Lock.primaryColor has not been configured, defaulting to ${color}`);
  }
  else if (isNonEmptyString(config.auth0Lock.primaryColor)) {
    configuration = configuration.setIn(['auth0Lock', 'primaryColor'], config.auth0Lock.primaryColor);
  }
  else {
    const errorMsg = 'invalid parameter - auth0Lock.primaryColor must be a non-empty string';
    LOG.error(errorMsg, config.auth0Lock.primaryColor);
    throw new Error(errorMsg);
  }
}

function setAuthToken(config :LatticeAuthConfig) :void {

  const { authToken } = config;

  // authToken is optional, so null and undefined are allowed
  if (authToken === null || authToken === undefined) {
    LOG.warn('authToken has not been configured, expect errors');
    configuration = configuration.delete('authToken');
  }
  else if (isNonEmptyString(authToken)) {
    // TODO: add at least some minimal validation checks against the authToken string
    configuration = configuration.set('authToken', authToken);
  }
  else {
    const errorMsg = 'invalid parameter - authToken must be a non-empty string';
    LOG.error(errorMsg, authToken);
    throw new Error(errorMsg);
  }
}

function setBaseUrl(config :LatticeAuthConfig) :void {

  const { baseUrl } = config;

  // baseUrl is optional, so null and undefined are allowed
  if (baseUrl === null || baseUrl === undefined) {
    LOG.warn('baseUrl has not been configured, using default configuration');
  }
  else if (isNonEmptyString(baseUrl)) {
    if (baseUrl === 'localhost' || baseUrl === ENV_URLS.get('LOCAL')) {
      configuration = configuration.set('baseUrl', ENV_URLS.get('LOCAL'));
    }
    else if (baseUrl === 'staging' || baseUrl === ENV_URLS.get('STAGING')) {
      configuration = configuration.set('baseUrl', ENV_URLS.get('STAGING'));
    }
    else if (baseUrl === 'production' || baseUrl === ENV_URLS.get('PRODUCTION')) {
      configuration = configuration.set('baseUrl', ENV_URLS.get('PRODUCTION'));
    }
    // mild url validation to at least check the protocol and domain
    else if (baseUrl.startsWith('https://') && baseUrl.endsWith('openlattice.com')) {
      configuration = configuration.set('baseUrl', baseUrl);
    }
    else {
      const errorMsg = 'invalid parameter - baseUrl must be a valid URL';
      LOG.error(errorMsg, baseUrl);
      throw new Error(errorMsg);
    }
  }
  else {
    const errorMsg = 'invalid parameter - baseUrl must be a non-empty string';
    LOG.error(errorMsg, baseUrl);
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

  Lattice.configure({
    authToken: configuration.get('authToken'),
    baseUrl: configuration.get('baseUrl'),
    csrfToken: AuthUtils.getCSRFToken(),
  });

  Auth0.initialize(configuration);
}

export {
  configure,
  getConfig
};
