/* eslint-disable import/no-named-as-default-member */

import LatticeAuth from './index';

import PACKAGE from '../package.json';

const OBJECT_TAG = '[object Object]';

describe('lattice-auth default export', () => {

  test('should export AccountUtils', () => {
    expect(Object.prototype.toString.call(LatticeAuth.AccountUtils)).toEqual(OBJECT_TAG);
    expect(Object.keys(LatticeAuth.AccountUtils)).toHaveLength(3);
  });

  test('should export Auth0', () => {
    expect(Object.prototype.toString.call(LatticeAuth.Auth0)).toEqual(OBJECT_TAG);
    expect(Object.keys(LatticeAuth.Auth0)).toHaveLength(5);
  });

  test('should export AuthActions', () => {
    expect(Object.prototype.toString.call(LatticeAuth.AuthActions)).toEqual(OBJECT_TAG);
    expect(Object.keys(LatticeAuth.AuthActions)).toHaveLength(12);
  });

  test('should export AuthConstants', () => {
    expect(Object.prototype.toString.call(LatticeAuth.AuthConstants)).toEqual(OBJECT_TAG);
    expect(Object.keys(LatticeAuth.AuthConstants)).toHaveLength(12);
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
    expect(Object.keys(LatticeAuth.AuthUtils)).toHaveLength(13);
  });

  test('should export configure()', () => {
    expect(LatticeAuth.configure).toBeInstanceOf(Function);
  });

  test('should export the correct version', () => {
    expect(LatticeAuth.version).toEqual(PACKAGE.version);
  });

});
