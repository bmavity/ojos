var bus = require('masstransit').create(),
    sessions = {},
    socketServer;

var getChannel = function channelGetChannel(clientId) {
  return socketServer.clients[clientId];
};

var init = function(server) {
  socketServer = server;
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

bus.subscribe('sessionStarted', function(sessionStarted) {
  sessions[sessionStarted.id] = {};
});

bus.subscribe('sessionReady', function(sessionReady) {
  sessions[sessionReady.id].hostId = sessionReady.clientId;
});

bus.subscribe('sessionJoined', function(sessionJoined) {
  var session = sessions[sessionJoined.id],
      sessionId = sessionJoined.id;
  session.viewerIds = session.viewerIds || [];
  session.viewerIds.push(sessionJoined.clientId);

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
  var session = sessions[message.id];
  session.content = message.content;
  session.styles = message.styles;
});

bus.subscribe('sessionCursorPositionSet', function(message) {
  sessions[message.id].cursorPosition = {
    x: message.x,
    y: message.y
  };
});

bus.subscribe('sessionScreenSizeSet', function(message) {
  sessions[message.id].dimensions = {
    height: message.height,
    width: message.width
  };
});

bus.subscribe('sessionScrollPositionSet', function(message) {
  sessions[message.id].scrollPosition = {
    left: message.left,
    top: message.top
  };
});


exports.init = init;
