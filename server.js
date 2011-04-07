var connect = require('connect'),
    io = require('socket.io'),
    injector = require('caruso').injector,
    sessionTracker = require('./sessionTracker'),
    resources = {
      sessions: require('./resources/sessions')
    },
    views = require('./viewModels'),
    userAgent = require('useragent'),
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
    var resource = resources.sessions.start(userAgent.parser(req.headers['user-agent']));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      resource: resource,
      actions: {
        view: req.headers.origin + '/sessions/' + resource.id
      }
    }));
  });

  app.post('/sessions/join/:id', function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(req.params.id);
  });

  app.get('/sessions/:id', function(req, res) {
    views.index(req.params.id, function(data) {
      render(res, __dirname + '/views/sessions/index/index.html', data);
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

  client.on('message', function(command) {
    if(command.command === 'setScreenSize') {
      resources.sessions[command.command](command.data.id, command.data);
    }
  });
});

server.listen(8000);
