var bus = require('masstransit').create(),
    viewModels = {};

bus.subscribe('sessionStarted', function(session) {
  var id = session.id;
  viewModels[id] = {
    action: '/sessions/join/' + id
  };
});


exports.getAction = function getAction(id) {
  return {
    href: viewModels[id].action
  };
};

exports.getById = function getById(id) {
  return viewModels[id];
};
