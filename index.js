'use strict';
const defaultMethod = require('lodash.defaults');
const defaults = {
  deprecatedFilter: 'deprecated',
  deprecatedTags: ['warning', 'hapi-deprecated']
};
exports.register = (server, options, next) => {
  options = defaultMethod(options, defaults);
  // register the tail event
  server.on('tail', (request) => {
    // if the route was tagged as deprecated, log it:
    if (request.route.settings.tags.indexOf(options.deprecatedFilter) > -1) {
      server.log(options.deprecatedTags, `route '${request.route.path}' is deprecated`);
    }
  });
  next();
};
exports.register.attributes = {
  pkg: require('./package.json')
};
