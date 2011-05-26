var connect = require('connect'),
    io = require('socket.io'),
    path = require('path'),
    bus = require('masstransit').create(),
    wotan = require('wotan'),
    vc = require('./viewCrap');
  
bus.init({
  transport: 'memory',
  host: 'localhost',
  queueName: 'sessionStarted'
});

wotan.configure({
  resourceDir: path.join(__dirname, '/resources')
});

var sessionTracker = require('./sessionTracker'),
    server,
    notifier = require('./notifier'),
    socketServer;

var routes = function routes(app) {
  app.get('/', function(req, res) {
    vc.render(res, __dirname + '/views/index.html', {
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
server.use(require('connect-conneg').acceptedTypes);
server.use(require('wagner').connect({ basePath: __dirname + '/public/js/' }));
server.use(connect.bodyParser());
wotan.initializeTransport('http', server)(vc.stupidHandler);
server.use(connect.static(__dirname + '/public'));
server.use(connect.router(routes));

socketServer = io.listen(server);
wotan.initializeTransport('webSocket', socketServer);
notifier.init(socketServer);

server.listen(parseInt(process.env.app_port, 10) || 8000);
