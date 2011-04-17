var uuid = require('node-uuid'),
    EventEmitter = require('events').EventEmitter,
    bus = require('masstransit').create(),
    sessions = {};

var join = function sessionsJoin(id, channelId) {
  sessions[id].clients.push(channelId);
  bus.publish('sessionJoined', {
    id: id,
    channelId: sessions[id].channelId,
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

var setContent = function sessionsSetContent(id, content) {
  sessions[id].content = content.content;
  sessions[id].stylesheets = content.stylesheets;
  bus.publish('sessionContentSet', content);
};

var setCursorPosition = function sessionsCursorPositionSet(id, position) {
  bus.publish('sessionCursorPositionSet', {
    id: id,
    x: position.x,
    y: position.y
  });
};

var setScreenSize = function sessionsSetScreenSize(id, dimensions) {
  bus.publish('sessionScreenSizeSet', {
    id: id,
    height: dimensions.height,
    width: dimensions.width
  });
};

var setScrollPosition = function sessionsSetScrollPosition(id, position) {
  bus.publish('sessionScrollPositionSet', {
    id: id,
    left: position.left,
    top: position.top
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
exports.setContent = setContent;
exports.setCursorPosition = setCursorPosition;
exports.setScreenSize = setScreenSize;
exports.setScrollPosition = setScrollPosition;
exports.start = start;
