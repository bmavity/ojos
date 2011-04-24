var fs = require('fs')
    path = require('path'),
    resourceDir = path.join(__dirname, '/resources/'),
    resources = {},
    dummy = {
      getById: function() { return {}; }
    };

var createResource = function(resource, action) {
  var baseRoute = '/' + resource;
  baseRoute += action !== 'index' ? '/' + action : '';
  if(!resources[resource][action]) {
    resources[resource][action] = {
      route: baseRoute,
      idRoute: baseRoute + '/:id'
    };
  }
  return resources[resource][action];
};

var findSomethings = function autoFindSomethings() {
  Object.keys(resources).forEach(function(resourceName) {
    var resource = resources[resourceName];
    forEachDirectory(resource.path, function(dirname) {
      var basePath = path.join(resource.path, dirname),
          viewPath = path.join(basePath, 'view.html'),
          modelPath = path.join(basePath, 'model.js'),
          commandPath = path.join(basePath, 'handler.js');
      if(path.existsSync(viewPath)) {
        createResource(resourceName, dirname);
        resource[dirname].view = viewPath;
        if(path.existsSync(modelPath)) {
          resource[dirname].model = require(modelPath) || dummy;
        }
      }
      if(path.existsSync(commandPath)) {
        createResource(resourceName, dirname);
        resource[dirname].command = require(commandPath);
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
    var action = resource[actionName];
    action.routeRegEx = normalizePath(action.route, []);
    action.idRouteRegEx = normalizePath(action.idRoute, []);
  });
};
createRoutes('sessions');
console.log(resources);


exports.getResource = function(path) {
  var resource = resources['sessions'],
      routeMatches = Object.keys(resource).filter(function(actionName) {
        var action = resource[actionName];
        return action.routeRegEx && action.routeRegEx.exec(path) !== null;
      }),
      idRouteMatches = Object.keys(resource).filter(function(actionName) {
        var action = resource[actionName];
        return action.routeRegEx && action.idRouteRegEx.exec(path) !== null;
      }),
      id;
  if(routeMatches.length) {
    return {
      resource: routeMatches[0]
    };
  }
  if(idRouteMatches.length) {
console.log(idRouteMatches.exec(path));
    id = idRouteMatches.exec(path)[1];
    return {
      resource: idRouteMatches[0],
      id: id
    };
  }
  return null;
};
