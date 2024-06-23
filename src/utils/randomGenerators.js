import md5 from 'md5';

export const pad = (number, length, padder = '0') => {
  let newNumber = `${number}`;
  newNumber = newNumber.length >= length ? newNumber
    : new Array(length - newNumber.length + 1).join(padder) + newNumber;
  return newNumber;
};

export const randomNumber = (length = 6) => {
  const min = 0;
  const max = parseInt((new Array(length + 1).join('9') || '0'), 10);
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  return pad(random, length);
};

export const randomString = (length = 11) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

export const randomPasswordGenerator = (length = 11) => {
  const string = randomString(length);
  const md5String = md5(string);
  return { string, md5String };
};

export const randomUserSalt = () => (randomString(32));
