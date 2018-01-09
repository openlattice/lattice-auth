import PACKAGE from '../package.json';

import { OBJECT_TAG } from './utils/testing/TestUtils';

import * as LatticeAuth from './index';

describe('lattice-auth named exports', () => {

  test('should export Auth0', () => {
    expect(Object.prototype.toString.call(LatticeAuth.Auth0)).toEqual(OBJECT_TAG);
    expect(Object.keys(LatticeAuth.Auth0)).toHaveLength(4);
  });

  test('should export AuthActionFactory', () => {
    expect(Object.prototype.toString.call(LatticeAuth.AuthActionFactory)).toEqual(OBJECT_TAG);
    expect(Object.keys(LatticeAuth.AuthActionFactory)).toHaveLength(12);
  });

  test('should export AuthConstants', () => {
    expect(Object.prototype.toString.call(LatticeAuth.AuthConstants)).toEqual(OBJECT_TAG);
    expect(Object.keys(LatticeAuth.AuthConstants)).toHaveLength(7);
  });

  test('should export AuthReducer', () => {
    expect(LatticeAuth.AuthReducer).toBeInstanceOf(Function);
  });

  test('should export AuthRoute', () => {
    expect(LatticeAuth.AuthRoute).toBeInstanceOf(Function);
  });

  test('should export AuthSagas', () => {
    expect(Object.prototype.toString.call(LatticeAuth.AuthSagas)).toEqual(OBJECT_TAG);
    expect(Object.keys(LatticeAuth.AuthSagas)).toHaveLength(6);
  });

  test('should export AuthUtils', () => {
    expect(Object.prototype.toString.call(LatticeAuth.AuthUtils)).toEqual(OBJECT_TAG);
    expect(Object.keys(LatticeAuth.AuthUtils)).toHaveLength(8);
  });

  test('should export LoginContainer', () => {
    expect(LatticeAuth.LoginContainer).toBeInstanceOf(Function);
  });

  test('should export configure()', () => {
    expect(LatticeAuth.configure).toBeInstanceOf(Function);
  });

  test('should export the correct version', () => {
    expect(LatticeAuth.version).toEqual(PACKAGE.version);
  });

});
