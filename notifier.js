var bus = require('masstransit').create(),
    sessions = {},
    socketServer;

var init = function(server) {
  socketServer = server;
};

bus.subscribe('sessionStarted', function(sessionStarted) {
  sessions[sessionStarted.id] = {};
});

bus.subscribe('sessionReady', function(sessionReady) {
  sessions[sessionReady.id].broadcasterId = sessionReady.clientId;
});

bus.subscribe('sessionJoined', function(sessionJoined) {
  var session = sessions[sessionJoined.id];
  session.viewerIds = session.viewerIds || [];
  session.viewerIds.push(sessionJoined.clientId);
});

bus.subscribe('sessionContentSet', function(sessionContentSet) {
  var session = sessions[sessionContentSet.id];
  
});


exports.init = init;
