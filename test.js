const findRemoveSync = require('./find-remove');

const result = findRemoveSync(`${__dirname}/dir`, {dir: 'okok*'});

console.log(result);
