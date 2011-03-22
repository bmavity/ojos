var handlers = {};

var handle = function(id, clientEvt) {
  handlers[clientEvt.evt];
};


module.exports.handle = handle;
