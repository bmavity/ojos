var connect = require('connect'),
    io = require('socket.io'),
    injector = require('caruso').injector,
    sessionTracker = require('./sessionTracker'),
    resources = {
      sessions: require('./resources/sessions')
    },
    server,
    socketServer;

var render = function(res, fileName, data) {
  injector.env(fileName, function(err, env) {
    env.inject(data);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(env.render());
  });
};

var routes = function routes(app) {
  app.get('/', function(req, res) {
    render(res, __dirname + '/views/index.html', {
      title: 'this is a test of the emergency broadcast system',
      navLinks: [
        { href: '/', html: 'home' },
        { href: '/blog', html: 'blog' },
        { href: '/experience', html: 'experience' },
        { href: '/contact', html: 'contact' }
      ]
    });
  });

  app.post('/sessions/start', function(req, res) {
    var resource = resources.sessions.start();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      resource: resource,
      actions: {
        view: req.headers.origin + '/sessions/' + resource.id
      }
    }));
  });

  app.get('/sessions/:id', function(req, res) {
    render(res, __dirname + '/views/sessions/index/index.html', {
    });
  });
};

server = connect(
  connect.logger(),
  connect.static(__dirname + '/public'),
  connect.router(routes)
);
socketServer = io.listen(server);

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

server.listen(8000);
