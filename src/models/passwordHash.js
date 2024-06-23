import bcrypt from 'bcrypt';
import { HttpException } from '../utils';

class PasswordHash {
    passwordHash;

    constructor(passwordHash) {
      PasswordHash.assertValidHash(passwordHash);
      this.passwordHash = passwordHash;
    }

    parameter() {
      return this.passwordHash;
    }

    async check(password) {
      const match = await bcrypt.compare(password, this.passwordHash);
      return match;
    }

    static assertValidHash(passwordHash) {
      if (passwordHash == null || !passwordHash.startsWith('$2b$')) {
        throw new HttpException.BadRequest('Invalid hash given, not a valid BCrypt hash');
      }
    }
}

export default PasswordHash;
