var bus = require('masstransit').create();

var handle = function(id, clientId) {
  bus.publish('sessionReady', {
    id: id,
    clientId: clientId
  });
};


exports.handle = handle;
