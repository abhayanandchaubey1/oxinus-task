import moment from 'moment';
import fs from 'fs';
import path from 'path';

export const isUndefined = (value) => value === undefined;
export const isNull = (value) => value === null;

export const convertIsoDatoToIsoDateTime = (date) => {
  if (isUndefined(date)) return undefined;
  if (!date) {
    return null;
  }
  return `${date}T${moment().format('HH:mm:ssZ')}`;
};

export const convertToIsoDateTime = (date) => {
  if (isUndefined(date)) return undefined;
  if (!date) {
    return null;
  }
  return moment(date).format('YYYY-MM-DDTHH:mm:ssZ');
};

export const convertToIsoDate = (date) => {
  if (isUndefined(date)) return undefined;
  if (!date) {
    return null;
  }
  return moment(date).format('YYYY-MM-DD');
};

export const checkIfValidDate = (date) => {
  if (!date) return false;
  return moment(date).isValid();
};

export const convertToStartOfDay = (date) => {
  if (!date) return null;
  return moment(date).set({
    h: 0, m: 0, s: 0, ms: 0,
  });
};

export const convertToEndOfDay = (date) => {
  if (!date) return null;
  return moment(date).set({
    h: 23, m: 59, s: 59, ms: 999,
  });
};

export const getUpdatableDate = (value) => {
  if (isNull(value)) return null;
  if (isUndefined(value)) return undefined;

  return moment(convertIsoDatoToIsoDateTime(value));
};

export const filterUndefinedFromObject = (obj) => (
  Object.keys(obj).reduce((acc, key) => {
    if (!isUndefined(obj[key])) {
      acc[key] = obj[key];
    }
    return acc;
  }, {}));

export const deleteFile = (filePath) => (
  new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('Invalid Path'));
    }
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      // if no error, file has been deleted successfully
      resolve(true);
    });
  })
);


export const getFileContent = (resourceDir, relativePath) => new Promise((resolve, reject) => {
  fs.readFile(path.join(resourceDir, relativePath), 'utf8', (err, data) => {
    if (err) {
      reject(err);
    }
    resolve(data);
  });
});

export const formatStr = (str) => (str || '');
export const formatDate = (date) => (date ? moment(date).format('DD/MM/YYYY') : '');


export const sanitizeUrl = (url) => {
  if (!url) return url;
  let newUrl = url;
  if (url.endsWith('/')) {
    newUrl = url.substring(0, url.length - 1);
  }
  return newUrl;
};

export const getEnumArrayFromObj = (enumObj) => {
  if (!enumObj) return null;
  return Object.keys(enumObj).map((key) => enumObj[key]);
};
