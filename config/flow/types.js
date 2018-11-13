/*
 * @flow
 */

declare type UUID = string;

declare type LatticeAuthConfig = {
  auth0ClientId ? :string;
  auth0Domain ? :string;
  auth0Lock ? :{
    logo ? :string;
    primaryColor ? :string;
    redirectUrl ? :string;
    title ? :string;
  };
  authToken ? :string;
  baseUrl :string;
};

declare type UserInfo = {
  firstName ? :string;
  givenName ? :string;
  email ? :string;
  id ? :string;
  picture ? :string;
  roles ? :string[];
};
