var fs = require('fs')
    path = require('path'),
    resourceDir = path.join(__dirname, '/resources/'),
    resources = {};

var findSomethings = function autoFindSomethings() {
  Object.keys(resources).forEach(function(resourceName) {
    var resource = resources[resourceName];
    forEachDirectory(resource.path, function(dirname) {
      var basePath = path.join(resource.path, dirname),
          viewPath = path.join(basePath, 'view.html'),
          commandPath = path.join(basePath, 'handler.js');
      console.log(viewPath);
      if(path.existsSync(viewPath)) {
        resource.views[dirname] = {
          path: viewPath
        };
      }
      if(path.existsSync(commandPath)) {
        resource.commands[dirname] = {
          path: commandPath
        };
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
      commands: {},
      path: getPath(dirname),
      views: {}
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

exports.getCommand = function(commandName) {
  return resources.sessions.commands[commandName];
};
exports.getView = function(viewName) {
  return resources.sessions.views[viewName];
};
console.log(resources);
