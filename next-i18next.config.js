const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['it', 'de', 'en','fr','es','pt']
  },
  localePath: path.resolve('./public/locales')
};
