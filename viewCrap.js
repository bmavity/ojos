var wotan = require('wotan'),
    injector = require('caruso').injector,
    mav = require('./mav');

var renderView = function(resource, result, callback) {
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
      var data = {
        model: result.model,
        actions: actionModels
      };
      injector.env(resource.view.path, function(err, env) {
        env.inject(data);
        callback(env.render());
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


exports.executeHandlerFn = executeHandlerFn;
exports.renderView = renderView;
