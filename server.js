var connect = require('connect'),
    io = require('socket.io'),
    injector = require('caruso').injector,
    bus = require('masstransit').create(),
    auto = require('./auto');
  
bus.init({
  transport: 'memory',
  host: 'localhost',
  queueName: 'sessionStarted'
});

var sessionTracker = require('./sessionTracker'),
    userAgent = require('useragent'),
    server,
    notifier = require('./notifier'),
    socketServer;

var finishAll = function(fns, finisher) {
  var totalCount = fns.length,
      completeCount = 0;
  var fnDone = function() {
    completeCount += 1;
    if(completeCount === totalCount) {
      finisher();
    }
  };
  fns.forEach(function(fn) {
    fn(fnDone);
  });
};

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

var renderView = function(req, res, resource, params, result) {
  var actionModels = {};
  finishAll(
    Object.keys(result.actions).map(function(action) {
      return function(onComplete) {
        var res2 = auto.getResource(action),
            data = res2.model.apply(null, params.arr);
        injector.env(res2.view, function(err, env) {
          env.injectPartial(data);
          actionModels[action] = {
            html: env.renderPartial()
          }
          onComplete();
        });
      }
    }),
    function() {
      render(res, resource.view, {
        model: result.model,
        actions: actionModels
      });
    }
  );
};

var getParams = function(req, routeParams, paramNames) {
  var obj = {},
      arr = [];
  var getVal = function(paramName) {
    if(routeParams[paramName]) {
      return routeParams[paramName];
    }
    if(paramName === 'agent') {
      return userAgent.parser(req.headers['user-agent']);
    }
  };
  paramNames.forEach(function(paramName) {
    var val = getVal(paramName);
    obj[paramName] = val;
    arr.push(val);
  });
  return {
    arr: arr,
    obj: obj
  };
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

var testHandler = function(req, res, next) {
  var result = auto.getResource(req.url),
      resource,
      params,
      thisIsIt,
      daActions = {};
  if(result) {
    resource = result.resource;
    if(req.method.toLowerCase() === 'get' && result.resource.model) {
      params = getParams(req, result.params, result.resource.modelParams);
      daShit = resource.model.apply(null, params.arr);
      daShit.actions.forEach(function(action) {
        daActions[action] = auto.getAction(action, params.obj);
      });
      thisIsIt = {
        model: daShit,
        actions: daActions
      };
      renderView(req, res, resource, params, thisIsIt);
    } else if(req.method.toLowerCase() === 'post' && result.resource.command) {
      params = getParams(req, result.params, result.resource.commandParams);
      daShit = resource.command.handle.apply(null, params.arr);
      if(daShit.actions) {
        daShit.actions.forEach(function(action) {
          daActions[action] = auto.getAction(action, daShit.model);
        });
      }
      thisIsIt = {
        model: daShit.model,
        actions: daActions
      };
      console.log(thisIsIt);
      renderJson(req, res, thisIsIt);
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

notifier.init(socketServer);

socketServer.on('connection', function(client) {
  var channelId = client.sessionId;

  var getWebSocketParams = function(webSocketParams, routeParams, resourceOperationParams) {
    var obj = {},
        arr = [];
    var getVal = function(paramName) {
      if(paramName === 'clientId') {
        return channelId;
      }
      if(routeParams[paramName]) {
        return routeParams[paramName];
      }
      return webSocketParams[paramName];
    };

    resourceOperationParams.forEach(function(paramName) {
      var val = getVal(paramName);
      obj[paramName] = val;
      arr.push(val);
    });
    return {
      arr: arr,
      obj: obj
    }; 
  };

  client.on('message', function(message) {
    var routeParseResult = auto.getResource(message.command),
        resourceOperation = routeParseResult.resource,
        routeParams = routeParseResult.params,
        params = getWebSocketParams(message.data, routeParams, resourceOperation.commandParams);
    resourceOperation.command.handle.apply(null, params.arr);
  });
});

server.listen(parseInt(process.env.app_port, 10) || 8000);
