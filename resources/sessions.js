var uuid = require('node-uuid'),
    EventEmitter = require('events').EventEmitter,
    sessions = {};

var start = function sessionsStart() {
  var id = uuid();
  sessions[id] = new EventEmitter();
  return {
    id: id
  };
};


exports.start = start;
