var bus = require('masstransit').create();
  

var join = function sessionsJoin(id, channelId) {
  bus.publish('sessionJoined', {
    id: id,
    //channelId: sessions[id].channelId,
    clientChannelId: channelId
  });
};

var readySession = function sessionsReadySession(id, channelId) {
  bus.publish('sessionReady', {
    id: id,
    channelId: channelId
  });
};

var setContent = function sessionsSetContent(id, content) {
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




exports.join = join;
exports.readySession = readySession;
exports.setContent = setContent;
exports.setCursorPosition = setCursorPosition;
exports.setScreenSize = setScreenSize;
exports.setScrollPosition = setScrollPosition;
