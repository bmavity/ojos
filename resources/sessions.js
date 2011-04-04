var uuid = require('node-uuid'),
    EventEmitter = require('events').EventEmitter,
    bus = require('masstransit').create(),
    sessions = {};

bus.ready({ transport: 'amqp', host: 'localhost', queueName: 'sessionStarted' }, function() {
  console.log('bus is ready');
});

var start = function sessionsStart() {
  var session = {
    id: uuid()
  };
  bus.publish('sessionStarted', session);
  sessions[session.id] = session;
  return session;
};


exports.start = start;
