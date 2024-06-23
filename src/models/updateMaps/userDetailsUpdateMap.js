import { filterUndefinedFromObject } from '../../utils';

export default (user) => {
  const map = {
    first_name: user.firstName,
    last_name: user.lastName,
    updated_by: user.updatedBy,
  };

  return filterUndefinedFromObject(map);
};
