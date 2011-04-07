var uuid = require('node-uuid'),
    EventEmitter = require('events').EventEmitter,
    bus = require('masstransit').create(),
    sessions = {};

bus.ready({ transport: 'amqp', host: 'localhost', queueName: 'sessionStarted' }, function() {
  console.log('bus is ready');
});

var join = function sessionsJoin(id, channelId) {
  sessions[id].clients.push(channelId);
  bus.publish('sessionJoined', {
    id: id,
    clientChannelId: channelId
  });
};

var readySession = function sessionsReadySession(id, channelId) {
  sessions[id].channelId = channelId;
  sessions[id].clients = [];
  bus.publish('sessionReady', {
    id: id,
    channelId: channelId
  });
};

var setScreenSize = function sessionsSetScreenSize(id, dimensions) {
  bus.publish('sessionScreenSizeSet', {
    id: id,
    height: dimensions.height,
    width: dimensions.width
  });
};

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


exports.join = join;
exports.readySession = readySession;
exports.setScreenSize = setScreenSize;
exports.start = start;
