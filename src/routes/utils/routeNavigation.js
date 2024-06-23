const API_ROOT = '/api';
const USER_ROOT = `${API_ROOT}/user`;

export default Object.freeze({
  ping: `${API_ROOT}/ping`,
  healthCheck: `${API_ROOT}/health-check`,
  security: {
    SIGN_UP: `${API_ROOT}/signup`,
    LOGIN: `${API_ROOT}/login`,
    SOCIAL_LOGIN: `${API_ROOT}/social-login`,
  },
  user: {
    PROFILE: `${USER_ROOT}/profile`,
  },
  test: {
    TEST_ACTION: `${API_ROOT}/test/`,
  },
});
