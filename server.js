var connect = require('connect'),
    io = require('socket.io'),
    path = require('path'),
    bus = require('masstransit').create(),
    wotan = require('wotan'),
    vc = require('./viewCrap'),
    server,
    socketServer;
  
bus.init({
  transport: 'memory',
  host: 'localhost',
  queueName: 'sessionStarted'
});

wotan.configure({
  resourceDir: path.join(__dirname, '/resources')
});

var sessionTracker = require('./sessionTracker'),
    notifier = require('./notifier');

var routes = function routes(app) {
  var injector = require('caruso').injector;
  var inject = function(fileName, data, callback) {
    injector.env(fileName, function(err, env) {
      env.inject(data);
      callback(env.render());
    });
  };

  var render = function(res, fileName, data) {
    inject(fileName, data, function(html) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });
  };

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

server = connect.createServer();
server.use(connect.logger());
server.use(require('wagner').connect({ basePath: __dirname + '/public/js/' }));
server.use(connect.bodyParser());
wotan.initializeTransport('http', {
  server: server,
  viewEngine: vc
});
server.use(connect.static(__dirname + '/public'));
server.use(connect.router(routes));

socketServer = io.listen(server);
wotan.initializeTransport('webSocket', socketServer);
notifier.init(socketServer);

server.listen(parseInt(process.env.app_port, 10) || 8000);
