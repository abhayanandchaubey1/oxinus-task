import moment from 'moment';

export const parserId = (id) => (
  id ? parseInt(id, 10) : null
);
export const parserDate = (date) => (
  date ? moment(date) : null
);

export const parserBoolean = (value) => (!!value);

export const parserInteger = (value) => (
  (value !== null && value !== undefined) ? parseInt(value, 10) : null
);

export const parserFloat = (value) => (
  (value !== null && value !== undefined) ? parseFloat(value, 10) : null
);

export const parserJson = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.log('Error parsing Json: ', error);
    return null;
  }
};
