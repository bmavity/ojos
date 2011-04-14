var bus = require('masstransit').create(),
    sessions = {},
    socketServer,
    content = {},
    dimensions = {},
    styles = {};

var getChannel = function channelGetChannel(channelId) {
  return socketServer.clients[channelId];
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
      session;
  sessions[sessionId] = sessions[sessionId] || {
    viewerIds: []
  };
  session = sessions[sessionId];
  session.hostId = message.channelId;
  session.viewerIds.push(message.clientChannelId);
  sendAll(sessionId, {
    evt: 'sessionJoined'
  });
  if(content[sessionId]) {
    sendViewers(sessionId, {
      evt: 'sessionContentSet',
      data: {
        content: content[sessionId],
        styles: styles[sessionId]
      }
    });
  }
  if(dimensions[sessionId]) {
    sendViewers(sessionId, {
      evt: 'sessionScreenSizeSet',
      data: dimensions[sessionId]
    });
  }
});

bus.subscribe('sessionContentSet', function(message) {
  var sessionId = message.sessionId;
  content[sessionId] = message.content;
  styles[sessionId] = message.styles;
});

bus.subscribe('sessionScreenSizeSet', function(message) {
  dimensions[message.id] = {
    height: message.height,
    width: message.width
  };
});


exports.init = function(channel) {
  socketServer = channel;
};
