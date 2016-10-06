'use strict';
const code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const deprecatedPlugin = require('../');

lab.experiment('hapi-deprecated', () => {
  let server;
  lab.beforeEach((done) => {
    server = new Hapi.Server({
      debug: {
        log: ['warning', 'hapi-deprecated']
      }
    });
    server.connection({ port: 3000 });
    done();
  });
  lab.test(' loads as a plugin, notifies when a route tagged as "deprecated" is requested', (done) => {
    server.route({
      path: '/example',
      method: 'GET',
      config: {
        tags: ['deprecated'],
      },
      handler: (request, reply) => {
        reply();
      }
    });
    server.register({
      register: deprecatedPlugin,
      options: {}
    }, () => {
      let called = false;
      console.error = (pre, tags, msg) => {
        called = msg;
      };
      server.start(() => {
        // call the route
        server.inject('/example', () => {
          code.expect(called).to.include("route '/example' is deprecated");
          done();
        });
      });
    });
  });
});
