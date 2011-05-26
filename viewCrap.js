var wotan = require('wotan'),
    injector = require('caruso').injector,
    mav = require('./mav');
    
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


exports.render = render;
exports.stupidHandler = stupidHandler;
