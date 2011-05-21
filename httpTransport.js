var wotan = require('wotan'),
    paramHandlerFactories = [];

var canHandleRequest = function(req) {
  var result = wotan.getResource(req.url),
      resource = result && result.resource,
      method = req.method.toLowerCase();
  if(!result) return false;
  if(method === 'get' && resource.model) return true;
  return (method === 'post' && resource.command);
};

var createResourceRequest = function(req) {
  var method = req.method.toLowerCase(),
      resource = wotan.getResource(req.url).resource;
  if(method === 'get') {
    return {
      query: req.url,
      params: resolveParams(req, resource.model.params)
    };
  } else if(method === 'post') {
    return {
      command: req.url,
      params: resolveParams(req, resource.command.params)
    };
  }
};

var resolveParams = function(req, paramNames) {
  var params = {
    arr: [],
    obj: {}
  };
  paramNames.forEach(function(paramName) {
    paramHandlerFactories.forEach(function(paramHandlerFactory) {
      paramHandlerFactory.create(req).addValue(paramName, params);
    });
  });
  return params;
};


exports.canHandleRequest = canHandleRequest; 
exports.createResourceRequest = createResourceRequest;



paramHandlerFactories.push((function() {
  var that = {};

  var create = function(req) {
    return {
      addValue: createAddValueFn(req)
    };
  };

  var createAddValueFn = function(req) {
    return function(paramName, params) {
      var val = req.body && req.body[paramName];
      if(val) {
        params.arr.push(val);
        params.obj[paramName] = val;
      }
    };
  };
    
  that.create = create;
  return that;
})());

paramHandlerFactories.push((function() {
  var wotan = require('wotan'),
      that = {};

  var createAddValueFn = function(req) {
    return function(paramName, params) {
      var result = wotan.getResource(req.url),
          routeParams = result.params,
          val = routeParams[paramName];
      if(val) {
        params.arr.push(val);
        params.obj[paramName] = val;
      }
    };
  };
    
  var create = function(req) {
    return {
      addValue: createAddValueFn(req)
    };
  };

  that.create = create;
  return that;
})());

paramHandlerFactories.push((function() {
  var userAgent = require('useragent'),
      that = {};

  var create = function(req) {
    return {
      addValue: createAddValueFn(req)
    };
  };

  var createAddValueFn = function(req) {
    return function(paramName, params) {
      var val;
      if(paramName === 'agent') {
        val = userAgent.parser(req.headers['user-agent']);
        params.arr.push(val);
        params.obj[paramName] = val;
      }
    };
  };
    
  that.create = create;
  return that;
})());
