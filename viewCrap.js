var injector = require('caruso').injector,
    mav = require('./mav');

var renderView = function(viewTree, callback) {
  var renderedActions = {};
  mav.finishAll(
    mav.objMap(viewTree.childViews, function(actionName, childView) {
      return function(onComplete) {
        injector.env(childView.view.path, function(err, env) {
          env.injectPartial(childView.data);
          renderedActions[actionName] = {
            html: env.renderPartial()
          }
          onComplete();
        });
      }
    }),
    function() {
      var data = {
        model: viewTree.data,
        actions: renderedActions
      };
      injector.env(viewTree.view.path, function(err, env) {
        env.inject(data);
        callback(env.render());
      });      
    }
  );
};


exports.renderView = renderView;
