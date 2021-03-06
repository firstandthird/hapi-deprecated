'use strict';
const defaultMethod = require('lodash.defaults');
const defaults = {
  tag: 'deprecated',
  logTags: ['warning', 'hapi-deprecated']
};
exports.register = (server, options, next) => {
  options = defaultMethod(options, defaults);
  // register the tail event
  server.on('tail', (request) => {
    // if the route was tagged as deprecated, log it:
    if (request.route.settings.tags && request.route.settings.tags.indexOf(options.tag) > -1) {
      server.log(options.logTags, {
        message: 'Route is deprecated',
        routePath: request.route.path,
        url: request.url.path,
        method: request.method,
        referrer: request.info.referrer,
        userAgent: request.headers['user-agent']
      });
    }
  });
  next();
};
exports.register.attributes = {
  pkg: require('./package.json')
};
