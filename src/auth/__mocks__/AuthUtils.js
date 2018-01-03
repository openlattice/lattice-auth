const clearAuthInfo = jest.fn();
const getAuthToken = jest.fn();
const getAuthTokenExpiration = jest.fn();
const getUserInfo = jest.fn();
const hasAuthTokenExpired = jest.fn();
const isAdmin = jest.fn();
const isAuthenticated = jest.fn();
const storeAuthInfo = jest.fn();

export {
  clearAuthInfo,
  getAuthToken,
  getAuthTokenExpiration,
  getUserInfo,
  hasAuthTokenExpired,
  isAdmin,
  isAuthenticated,
  storeAuthInfo
};

// TODO: figure out how to get jest.genMockFromModule() working
// export const AuthUtils = jest.genMockFromModule('../AuthUtils');
// export default AuthUtils;
