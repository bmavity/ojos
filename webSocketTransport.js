var wotan = require('wotan'),
    paramHandlerFactories = [];

var canHandleRequest = function(webSocketRequest) {
  var message = webSocketRequest.message;
  if(!message) return false;
  if(message.query) return true;
  return !!message.command;
};

var createResourceRequest = function(webSocketRequest) {
  var message = webSocketRequest.message,
      resource;
  if(message.query) {
    resource = wotan.getResource(message.query).resource;
    return {
      query: message.query,
      params: resolveParams(webSocketRequest, resource.model.params)
    };
  }
  if(message.command) {
    resource = wotan.getResource(message.command).resource;
    return {
      command: message.command,
      params: resolveParams(webSocketRequest, resource.command.params)
    };
  }
};

var resolveParams = function(webSocketRequest, paramNames) {
  var params = {
    arr: [],
    obj: {}
  };
  paramNames.forEach(function(paramName) {
    paramHandlerFactories.forEach(function(paramHandlerFactory) {
      paramHandlerFactory.create(webSocketRequest).addValue(paramName, params);
    });
  });
  return params;
};

exports.canHandleRequest = canHandleRequest;
exports.createResourceRequest = createResourceRequest;




paramHandlerFactories.push((function() {
  var that = {};

  var create = function(webSocketRequest) {
    return {
      addValue: createAddValueFn(webSocketRequest)
    };
  };

  var createAddValueFn = function(webSocketRequest) {
    return function(paramName, params) {
      var requestData = webSocketRequest.message.data,
          val;
      if(requestData) {
        val = requestData[paramName];
        if(val) {
          params.arr.push(val);
          params.obj[paramName] = val;
        }
      }
    };
  };
    
  that.create = create;
  return that;
})());

paramHandlerFactories.push((function() {
  var wotan = require('wotan'),
      that = {};

  var createAddValueFn = function(webSocketRequest) {
    var message = webSocketRequest.message,
        url = message.query || message.command;
    return function(paramName, params) {
      var result = wotan.getResource(url),
          routeParams = result.params,
          val = routeParams[paramName];
      if(val) {
        params.arr.push(val);
        params.obj[paramName] = val;
      }
    };
  };
    
  var create = function(webSocketRequest) {
    return {
      addValue: createAddValueFn(webSocketRequest)
    };
  };

  that.create = create;
  return that;
})());

paramHandlerFactories.push((function() {
  var that = {};

  var create = function(webSocketRequest) {
    return {
      addValue: createAddValueFn(webSocketRequest)
    };
  };

  var createAddValueFn = function(webSocketRequest) {
    return function(paramName, params) {
      var val;
      if(paramName === 'clientId') {
        val = webSocketRequest['clientId'];
        params.arr.push(val);
        params.obj[paramName] = val;
      }
    };
  };
    
  that.create = create;
  return that;
})());
