var wotan = require('wotan');

var canHandleRequest = function(req) {
  var result = wotan.getResource(req.url),
      resource = result && result.resource,
      method = req.method.toLowerCase();
  if(!result) return false;
  if(method === 'get' && resource.model) return true;
  return (method === 'post' && resource.command);
};

var createResourceRequest = function(req) {
  var method = req.method.toLowerCase();
  if(method === 'get') {
    return {
      query: req.url
    };
  } else if(method === 'post') {
    return {
      command: req.url
    };
  }
};


exports.canHandleRequest = canHandleRequest; 
exports.createResourceRequest = createResourceRequest;
