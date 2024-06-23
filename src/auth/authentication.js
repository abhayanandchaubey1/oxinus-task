class Authentication {
  static hasRight(user, right) {
    let hasRight = false;
    user.roles.forEach((role) => {
      if (!hasRight) {
        hasRight = role.hasRight(right);
      }
    });
    return hasRight;
  }

  static userEffectiveRights(user) {
    return Array.from(new Set(user.roles
      .flatMap((role) => (role.getRights()))));
  }

  static hasPermission(rights, right) {
    return rights.indexOf(right) !== -1;
  }
}

export default Authentication;
