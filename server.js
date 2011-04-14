var connect = require('connect'),
    io = require('socket.io'),
    injector = require('caruso').injector,
    bus = require('masstransit').create();
  
bus.init({
  transport: 'amqp',
  host: 'localhost',
  queueName: 'sessionStarted'
});

var sessionTracker = require('./sessionTracker'),
    resources = {
      sessions: require('./resources/sessions')
    },
    views = require('./viewModels'),
    userAgent = require('useragent'),
    server,
    channel = require('./channel'),
    socketServer;

 

var render = function(res, fileName, data) {
  injector.env(fileName, function(err, env) {
    env.inject(data);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(env.render());
  });
};

var renderJson = function(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
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
    var parsedUserAgent = userAgent.parser(req.headers['user-agent']),
        resource = resources.sessions.start(parsedUserAgent);
    renderJson(res, {
      resource: resource,
      actions: {
        view: req.headers.origin + '/sessions/' + resource.id
      }
    });
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

channel.init(socketServer);

socketServer.on('connection', function(client) {
  var channelId = client.sessionId;

  client.on('message', function(command) {
    var issuedCommand = command.command;
    console.log(command);
    if(issuedCommand === 'setScreenSize') {
      resources.sessions[command.command](command.data.id, command.data);
    } else if(issuedCommand === 'setContent') {
      resources.sessions[command.command](command.data.sessionId, command.data);
    } else if(issuedCommand === 'readySession') {
      resources.sessions[command.command](command.data.sessionId, channelId);
    } else if(issuedCommand.indexOf('/sessions/join/') !== -1) {
      var id = issuedCommand.replace(/^\/sessions\/join\//g, '');
      resources.sessions['join'](id, channelId);
    }
  });
});

server.listen(8000);
