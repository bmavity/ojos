var bus = require('masstransit').create(),
    viewModels = {};

bus.subscribe('sessionStarted', function(session) {
  var id = session.id;
  viewModels[id] = {
    action: '/sessions/join/' + id
  };
});

var getById = function(id) {
  return viewModels[id];
};

module.exports = exports = getById;
