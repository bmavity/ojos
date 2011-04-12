var bus = require('masstransit').create(),
    sessions = {},
    socketServer,
    content = {},
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

bus.ready({ transport: 'amqp', host: 'localhost', queueName: 'sessionStarted' }, function() {
  console.log('bus is ready channel.js');
  
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
  });

  bus.subscribe('sessionContentSet', function(message) {
    var sessionId = message.sessionId;
    content[sessionId] = message.content;
    styles[sessionId] = message.styles;
    /*
    sendViewers(sessionId, {
      evt: 'sessionContentSet',
      data: {
        content: message.content
      }
    });
    */
  });
});


exports.init = function(channel) {
  socketServer = channel;
};
