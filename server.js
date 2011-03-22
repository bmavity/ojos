var connect = require('connect'),
    io = require('socket.io'),
    server = connect.createServer(
      connect.logger(),
      connect.static(__dirname + '/public')
    ),
    socketServer = io.listen(server),
    sessionTracker = require('./sessionTracker');

server.listen(8000);

socketServer.on('connection', function(client) {
  var id = client.sessionId;

  client.send(id);

  sessionTracker.createSession(id);

  client.on('message', function(command) {
    var startTime,
        commands;
    if(command.csa) {
      commands = sessionTracker.displaySession(command.data);
      startTime = commands[0].time;
      commands.forEach(function(command) {
        setTimeout(function() {
          client.send(command.command);
        }, command.time - startTime);
      });
    } else {
      sessionTracker.handle(id, command);
      if(command.command === 'startSession') {
        command.data = id;
        client.broadcast(command);
      }
      //client.broadcast(command);
    }
  });
});
