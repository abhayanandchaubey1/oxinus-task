const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const RESOURCES_DIR = path.resolve('src/resources');

export const parseHbsTemplate = (source, data) => {
  const template = Handlebars.compile(source);
  return template(data);
};

export const getResourcesFileSource = (relativePath) => new Promise((resolve, reject) => {
  fs.readFile(path.join(RESOURCES_DIR, relativePath), 'utf8', (err, data) => {
    if (err) {
      reject(err);
    }
    resolve(data);
  });
});

