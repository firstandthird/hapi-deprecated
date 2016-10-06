'use strict';
const defaultMethod = require('lodash.defaults');
const defaults = {
  deprecatedTag: 'deprecated'
};
exports.register = (server, options, next) => {
  options = defaultMethod(options, defaults);

  // register the tail event
  server.on('tail', (request) => {
    // if the route was tagged as deprecated, log it:
    if (request.route.settings.tags.indexOf(options.deprecatedTag) > -1) {
      server.log(['warning', 'hapi-deprecated'], `route '${request.route.path}' is deprecated`);
    }
  });
  next();
};
exports.register.attributes = {
  pkg: require('./package.json')
};
