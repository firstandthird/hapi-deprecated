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
        log: ['warning', 'hapi-deprecated', 'caution']
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
          called = JSON.parse(called);
          const keys = Object.keys(called);
          code.expect(keys.length).to.equal(6);
          code.expect(keys).to.include('referrer');
          code.expect(keys).to.include('routePath');
          code.expect(called.url).to.include('/example');
          code.expect(called.message).to.include('Route is deprecated');
          code.expect(typeof called.userAgent).to.equal('string');
          done();
        });
      });
    });
  });
  lab.test(' loads as a plugin with non-default options', (done) => {
    server.route({
      path: '/example',
      method: 'GET',
      config: {
        tags: ['defunct'],
      },
      handler: (request, reply) => {
        reply();
      }
    });
    server.register({
      register: deprecatedPlugin,
      options: {
        tag: 'defunct',
        logTags: ['caution']
      }
    }, () => {
      let called = false;
      let calledTags;
      console.error = (pre, tags) => {
        calledTags = tags;
        called = true;
      };
      server.start(() => {
        // call the route
        server.inject('/example', () => {
          code.expect(called).to.equal(true);
          code.expect(calledTags).to.equal('caution');
          done();
        });
      });
    });
  });
  lab.test(' does nothing if a route is not tagged', (done) => {
    let called = false;
    server.route({
      path: '/example',
      method: 'GET',
      handler: (request, reply) => {
        called = true;
        reply();
      }
    });
    server.register({
      register: deprecatedPlugin,
      options: {
        tag: 'defunct',
        logTags: ['caution']
      }
    }, () => {
      server.start(() => {
        // call the route
        server.inject('/example', () => {
          code.expect(called).to.equal(true);
          done();
        });
      });
    });
  });
});
