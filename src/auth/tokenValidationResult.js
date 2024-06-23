class TokenValidationResult {
    static tokenValidationStatus = Object.freeze({
      VALID: 'VALID',
      EXPIRED: 'EXPIRED',
      INVALID_USER: 'INVALID_USER',
      INACTIVE_USER: 'INACTIVE_USER',
      OLD_VERSION: 'OLD_VERSION',
    });

    constructor(status, user) {
      this.status = status;
      this.user = user;
    }

    isValid() {
      return this.status === TokenValidationResult.tokenValidationStatus.VALID;
    }
}

export default TokenValidationResult;
