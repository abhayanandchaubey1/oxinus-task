
/**
 * Rights are the lowest abstraction level items in the authorization system.
 * The decision if user has access to some
 * feature or not is ultimately decided on the fact if that specific user
 * has the required {@link Right}. Rights are
 * never added to database in any form: they are aggregated via {@link Role}s.
 * This allows flexible tuning and
 * changing of {@link Right} items during development:
 * if you find a specific use case where current {@link Right}
 * options are not fitting then add a new one. Just remember to
 * add that {@link Right} to appropriate {@link Role}s.
 */
class Right {
    static general= Object.freeze({
      /* General Rights */
      PING: 'PING',
      LOGIN: 'LOGIN',

      /* Test Url only available in development env */
      TEST_API: 'TEST_API',
    });

    static user = Object.freeze({
      /* User Profile */
      FETCH_USER_PROFILE: 'FETCH_USER_PROFILE',
      MODIFY_USER_PROFILE: 'MODIFY_USER_PROFILE',
    });

    // helper methods and stuff
    static allRights() {
      return [].concat(
        Right.getRightArray(this.general),
        Right.getRightArray(this.user),
      );
    }

    static userRights() {
      return [].concat(
        Right.getRightArray(this.general),
        Right.getRightArray(this.user),
      );
    }

    static getRightArray(rights) {
      return Object.freeze(Object.keys(rights).map((key) => rights[key]));
    }

    static hasPermission(rights, val) {
      return rights.indexOf(val) !== -1;
    }

    static exists(val) {
      const index = this.allRights().indexOf(val);
      return index !== -1;
    }
}

export default Right;
