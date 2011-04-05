var uuid = require('node-uuid'),
    EventEmitter = require('events').EventEmitter,
    bus = require('masstransit').create(),
    sessions = {};

bus.ready({ transport: 'amqp', host: 'localhost', queueName: 'sessionStarted' }, function() {
  console.log('bus is ready');
});

var start = function sessionsStart(agent) {
  var session = {
    id: uuid(),
    browser: agent.pretty(),
    os: agent.prettyOs(),
    time: new Date()
  };
  bus.publish('sessionStarted', session);
  sessions[session.id] = session;
  return session;
};


exports.start = start;
