var connect = require('connect'),
    io = require('socket.io'),
    injector = require('caruso').injector,
    bus = require('masstransit').create(),
    auto = require('./auto');
  
bus.init({
  transport: 'amqp',
  host: 'localhost',
  queueName: 'sessionStarted'
});

var sessionTracker = require('./sessionTracker'),
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

};
var sessionCrap = require('./resources/sessions');
var renderView = function(res, result) {
  render(res, result.resource.viewPath, result.resource.model.getById(result.id));
};
var session = {
  start: function(req, res) {
    var parsedUserAgent = userAgent.parser(req.headers['user-agent']),
        startCommand = auto.getCommand('start'),
        session = require(startCommand.path).handle(parsedUserAgent);
    renderJson(res, {
      resource: session,
      actions: {
        view: req.headers.origin + '/sessions/' + session.id
      }
    });
  }
};

var testHandler = function(req, res, next) {
  var result = auto.getResource(req.url);
  if(result) {
    if(req.method.toLowerCase === 'get' && result.resource.model) {
      renderView(res, result);
    } else if(req.method.toLowerCase() === 'post' && result.resource.handler) {
      next();
    } else {
      next();
    }
  } else {
    next();
  }
};

server = connect(
  connect.logger(),
  testHandler,
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
      sessionCrap[command.command](command.data.id, command.data);
    } else if(issuedCommand === 'setContent') {
      sessionCrap[command.command](command.data.sessionId, command.data);
    } else if(issuedCommand === 'setCursorPosition') {
      sessionCrap[command.command](command.data.sessionId, command.data);
    } else if(issuedCommand === 'setScrollPosition') {
      sessionCrap[command.command](command.data.sessionId, command.data);
    } else if(issuedCommand === 'readySession') {
      sessionCrap[command.command](command.data.sessionId, channelId);
    } else if(issuedCommand.indexOf('/sessions/join/') !== -1) {
      var id = issuedCommand.replace(/^\/sessions\/join\//g, '');
      sessionCrap['join'](id, channelId);
    }
  });
});

server.listen(8000);
