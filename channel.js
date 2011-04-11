var bus = require('masstransit').create(),
    socketServer;

bus.ready({ transport: 'amqp', host: 'localhost', queueName: 'sessionStarted' }, function() {
  console.log('bus is ready server.js');
  
  bus.subscribe('sessionJoined', function(message) {
  console.log('wtf?');
    socketServer.clients[message.channelId].send({
      evt: 'sessionJoined'
    });
    socketServer.clients[message.clientChannelId].send({
      evt: 'sessionJoined'
    })
  });

  bus.subscribe('sessionContentSet', function(message) {
    console.log(message);
  });
});


exports.init = function(channel) {
  socketServer = channel;
};
