var fs = require('fs')
    resourceDir = __dirname + '/resources/',
    resources = {};

var findSomethings = function autoFindSomethings(rType) {
  Object.keys(resources).forEach(function(resourceName) {
    var resource = resources[resourceName];
    forEachDirectory(resource.path, function(dirname) {
      resource.views[dirname] = {
        path: resource.path + '/' + dirname
      };
    });
  });
};

var forEachDirectory = function autoforEachDirectory(dirname, operation) {
  fs.readdirSync(dirname).filter(isDirectory(dirname)).forEach(operation);
};

var findResources = function autoFindResources() {
  forEachDirectory(resourceDir, function(dirname) {
    resources[dirname] = {
      actions: {},
      path: getPath(dirname),
      views: {}
    };
  });
};

var getPath = function autoGetPath(name) {
  return resourceDir + name + '/';
};

var isDirectory = function(dirname) {
  return function(name) {
    return fs.statSync(dirname + name).isDirectory();
  };
};

findResources();
findSomethings('views');
