var bus = require('masstransit').create(),
    sessions = {},
    socketServer;

var getChannel = function channelGetChannel(channelId) {
  return socketServer.clients[channelId];
};

var getSession = function channelGetSession(sessionId) {
  sessions[sessionId] = sessions[sessionId] || { viewerIds: [] };
  return sessions[sessionId];
};

var sendAll = function channelSendAll(sessionId, message) {
  var session = sessions[sessionId];
  getChannel(session.hostId).send(message);
  sendViewers(sessionId, message);
};

var sendViewers = function channelSendViewers(sessionId, message) {
  var session = sessions[sessionId];
  session.viewerIds.forEach(function(viewerId) {
    getChannel(viewerId).send(message);
  });
};

bus.subscribe('sessionJoined', function(message) {
  var sessionId = message.id,
      session = getSession(sessionId);
  
  session.hostId = message.channelId;
  session.viewerIds.push(message.clientChannelId);
  sendAll(sessionId, {
    evt: 'sessionJoined'
  });

  sendViewers(sessionId, {
    evt: 'sessionContentSet',
    data: {
      content: session.content,
      styles: session.styles
    }
  });
  
  sendViewers(sessionId, {
    evt: 'sessionScreenSizeSet',
    data: session.dimensions
  });

  sendViewers(sessionId, {
    evt: 'sessionScrollPositionSet',
    data: session.scrollPosition
  });

  sendViewers(sessionId, {
    evt: 'sessionCursorPositionSet',
    data: session.cursorPosition
  });
});

bus.subscribe('sessionContentSet', function(message) {
  var session = getSession(message.sessionId);
  session.content = message.content;
  session.styles = message.styles;
});

bus.subscribe('sessionCursorPositionSet', function(message) {
console.log(message);
  getSession(message.id).cursorPosition = {
    x: message.x,
    y: message.y
  };
});

bus.subscribe('sessionScreenSizeSet', function(message) {
  getSession(message.id).dimensions = {
    height: message.height,
    width: message.width
  };
});

bus.subscribe('sessionScrollPositionSet', function(message) {
  getSession(message.id).scrollPosition = {
    left: message.left,
    top: message.top
  };
});


exports.init = function(channel) {
  socketServer = channel;
};
