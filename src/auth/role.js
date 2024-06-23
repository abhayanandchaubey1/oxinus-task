import Right from './right';
import { HttpException, formatErrorResponse }  from '../utils';

/**
 * Roles of the authorization system.
 * Each user will have one or more {@link Role}s linked to them either directly
 * or via their usergroups. Each {@link Role} contain one
 * or more {@link Right}s which are ultimately determine
 * if user has access to certain features etc.
 *
 * Please note that in addition to right based authorization
 * there is also contextual authorization going on, this means
 * that certain {@link Right}s are contextual in nature: you may
 * be allowed to see some data (eg. students) but your
 * view might be restricted to only specific items
 * (like the students of your own company).
 */
class Role {
    roles = Object.freeze([
      'USER',
      'NO_RIGHTS',
    ]);

    static roleValues = Object.freeze({
      USER: 'USER',
    });

    roleIds = Object.freeze({
      USER: 1,
      NO_RIGHTS: 0,
    });

    USER = Right.userRights();

    NO_RIGHTS = [];

    rights;

    role;

    constructor(role) {
      if (this.roles.indexOf(role) === -1) {
        throw new HttpException.BadRequest(formatErrorResponse('role', 'notFound'));
      }
      this.role = role;
      this.rights = this[role];
    }

    hasRight(right) {
      return (this.rights && this.rights.indexOf(right) !== -1);
    }

    getRights() {
      return this.rights;
    }

    getId() {
      return this.roleIds[this.role] || 0;
    }
}

export default Role;
