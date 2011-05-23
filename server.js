var connect = require('connect'),
    io = require('socket.io'),
    injector = require('caruso').injector,
    path = require('path'),
    bus = require('masstransit').create(),
    wotan = require('wotan'),
    mav = require('./mav');
  
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

var renderJson = function(req, res, result) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
};

var renderView = function(req, res, resource, result) {
  var params = result.params,
      actionModels = {};
  mav.finishAll(
    Object.keys(result.actions).map(function(action) {
      return function(onComplete) {
        var res2 = wotan.getResource(action),
            data = res2.model.apply(null, params.arr);
        injector.env(res2.view.path, function(err, env) {
          env.injectPartial(data);
          actionModels[action] = {
            html: env.renderPartial()
          }
          onComplete();
        });
      }
    }),
    function() {
      render(res, resource.view.path, {
        model: result.model,
        actions: actionModels
      });
    }
  );
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

var executeHandlerFn = function(resourceRequest, daShit) {
  var params = resourceRequest.params,
      daActions = {};
  daShit.actions.forEach(function(action) {
    var thisIsCrap = resourceRequest.command ? daShit.model : params.obj;
    daActions[action] = wotan.getAction(action, thisIsCrap);
  });
  return {
    model: daShit,
    actions: daActions,
    params: params
  };
};

var stupidHandler = function(httpRequest) {
  var req = httpRequest.req,
      res = httpRequest.res;
  wotan.handleResourceRequest('http', httpRequest, function(resourceRequest, executedHandler) {
    if(resourceRequest.query) {
      renderView(req, res, wotan.getResource(resourceRequest.query).resource, executeHandlerFn(resourceRequest, executedHandler));
    }
    if(resourceRequest.command) {
      renderJson(req, res, executeHandlerFn(resourceRequest, executedHandler));
    }
  });
};

server = connect(
  connect.logger(),
  require('wagner').connect({ basePath: __dirname + '/public/js/' }),
  connect.bodyParser()
);
wotan.initializeTransport('http', server)(stupidHandler);
server.use(connect.static(__dirname + '/public'));
server.use(connect.router(routes));

socketServer = io.listen(server);
wotan.initializeTransport('webSocket', socketServer);
notifier.init(socketServer);

server.listen(parseInt(process.env.app_port, 10) || 8000);
