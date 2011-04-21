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
var indexModel = require('./resources/session/index/model');
var session = {
  index: function(req, res) {
    indexModel.index(req.params.id, function(data) {
      render(res, __dirname + '/views/sessions/index/index.html', data);
    });
  },
  start: function(req, res) {
    var parsedUserAgent = userAgent.parser(req.headers['user-agent']),
        resource = sessionCrap.start(parsedUserAgent);
    renderJson(res, {
      resource: resource,
      actions: {
        view: req.headers.origin + '/sessions/' + resource.id
      }
    });
  }
};

function normalizePath(path, keys) {
  path = path
    .concat('/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
      keys.push(key);
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || '([^/]+?)') + ')'
        + (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.+)');
  return new RegExp('^' + path + '$', 'i');
};

var indexKeys = [],
    index = normalizePath('/sessions/:id', indexKeys),
    commandKeys = [],
    command = normalizePath('/sessions/:command/:id', commandKeys);
var testHandler = function(req, res, next) {
  var indexResult,
      commandResult;
  req.params = req.params || {};
  if(indexResult = index.exec(req.url)) {
    var commandOrId = indexResult[1];
    if(session[commandOrId]) {
      session[commandOrId](req, res);
    } else {
      req.params.id = commandOrId;
      session.index(req, res);
    }
  } else if(commandResult = command.exec(req.url)) {
    var aCommand = commandResult[1],
        anId = commandResult[2];
    if(session[aCommand]) {
      req.params.id = anId;
      session[aCommand](req, res);
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
