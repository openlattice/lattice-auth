/*
 * @flow
 */

declare type LatticeAuthConfig = {
  auth0ClientId ? :string;
  auth0Domain ? :string;
  auth0Lock :{
    logo :string;
    redirectUrl ? :string;
    title :string;
  };
  authToken :string;
  baseUrl :string;
};

declare type UserInfo = {
  email ? :string;
  id ? :string;
  picture ? :string;
  roles ? :string[];
};
