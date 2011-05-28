var finishAll = function(fns, finisher) {
  var totalCount = fns.length,
      completeCount = 0;
  var fnDone = function() {
    completeCount += 1;
    if(completeCount === totalCount) {
      finisher();
    }
  };
  fns.forEach(function(fn) {
    fn(fnDone);
  });
};

var objMap = function(obj, callback) {
  return Object.keys(obj).map(function(key) {
    return callback(key, obj[key]);
  });
};


exports.finishAll = finishAll;
exports.objMap = objMap;
