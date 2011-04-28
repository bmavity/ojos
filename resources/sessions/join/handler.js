var bus = require('masstransit').create();

var join = function sessionsJoin(id, clientId) {
  bus.publish('sessionJoined', {
    id: id,
    clientId: clientId
  });
};


exports.handle = join;
