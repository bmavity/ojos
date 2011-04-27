var fs = require('fs')
    path = require('path'),
    resourceDir = path.join(__dirname, '/resources/'),
    resources = {},
    dummy = function(){};

var createResource = function(resource, action, handlerFn) {
  var baseRoute = '/' + resource,
      params = parseDependencies(handlerFn);
  baseRoute += action !== 'index' ? '/' + action : '';
  if(!resources[resource][action]) {
    resources[resource][action] = {
      route: baseRoute + (params.indexOf('id') !== -1 ? '/:id' : '')
    };
  }
  return resources[resource][action];
};

var functionRegEx = /\(([\s\S]*?)\)/;
var parseDependencies = function(fn) {
  return functionRegEx.
    exec(fn)[1].
    replace(/\s/g, '').
    split(',').
    filter(function(name) {
      return name.length !== 0;
    });
};

var findSomethings = function autoFindSomethings() {
  Object.keys(resources).forEach(function(resourceName) {
    var resource = resources[resourceName];
    forEachDirectory(resource.path, function(dirname) {
      var basePath = path.join(resource.path, dirname),
          viewPath = path.join(basePath, 'view.html'),
          modelPath = path.join(basePath, 'model.js'),
          commandPath = path.join(basePath, 'handler.js'),
          model,
          command;
      if(path.existsSync(viewPath)) {
        if(path.existsSync(modelPath)) {
          model = require(modelPath) || dummy;
          createResource(resourceName, dirname, model);
          resource[dirname].model = model;
          resource[dirname].modelParams = parseDependencies(model);
        }
        if(!resource[dirname]) {
          createResource(resourceName, dirname, function(){});
        }
        resource[dirname].view = viewPath;
      }
      if(path.existsSync(commandPath)) {
        command = require(commandPath);
        createResource(resourceName, dirname, command.handle);
        resource[dirname].command = command;
        resource[dirname].commandParams = parseDependencies(command.handle);
      }
    });
  });
};

var forEachDirectory = function autoforEachDirectory(dirname, operation) {
  fs.readdirSync(dirname).filter(isDirectory(dirname)).forEach(operation);
};

var findResources = function autoFindResources() {
  forEachDirectory(resourceDir, function(dirname) {
    resources[dirname] = {
      path: getPath(dirname),
    };
  });
};

var getPath = function autoGetPath(name) {
  return path.join(resourceDir, name);
};

var isDirectory = function(dirname) {
  return function(name) {
    return fs.statSync(path.join(dirname, name)).isDirectory();
  };
};

findResources();
findSomethings();

function normalizePath(path, keys) {
  path = path
    .concat('/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
      keys.push(key);
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || '([^/]+?)') + ')'
        + (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.+)');
  return new RegExp('^' + path + '$', 'i');
};


var createRoutes = function(resourceName) {
  var resource = resources[resourceName],
      actions = Object.keys(resource).filter(function(action) {
        return !!resource[action].route;
      });
  actions.forEach(function(actionName) {
    var action = resource[actionName],
        routeParams = [];
    action.routeRegEx = normalizePath(action.route, routeParams);
    action.routeParams = routeParams;
  });
};
createRoutes('sessions');
console.log(resources.sessions);


exports.getAction = function(action, params) {
  var route = resources['sessions'][action].route,
      keys = [];
  normalizePath(route, keys);
  keys.forEach(function(key) {
    var keyReplacer = new RegExp('\/:' + key, 'i');
    route = route.replace(keyReplacer, '/' + params[key]);
  });
  return {
    href: route
  };
};

exports.getResource = function(path) {
  if(resources['sessions'][path]) return resources['sessions'][path];
  var resource = resources['sessions'],
      routeMatches = Object.keys(resource).filter(function(actionName) {
        var action = resource[actionName];
        return action.routeRegEx && action.routeRegEx.exec(path) !== null;
      }),
      matchingResource,
      parsedRoute,
      index = 1,
      routeParams = {};
  if(routeMatches.length) {
    routeMatches.sort(function(a1, b1) {
      var a = resource[a1],
          b = resource[b1];
      if(a.routeParams.length < b.routeParams.length) return -1;
      if(a.routeParams.length > b.routeParams.length) return 1;
      return 0;
    });
    matchingResource = resource[routeMatches[0]];
    parsedRoute = matchingResource.routeRegEx.exec(path);
    matchingResource.routeParams.forEach(function(paramName) {
      routeParams[paramName] = parsedRoute[index];
      index += 1;
    });
    return {
      resource: matchingResource,
      params: routeParams
    };
  }
  return null;
};
