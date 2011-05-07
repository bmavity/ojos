var uuid = require('node-uuid'),
    bus = require('masstransit').create();

var start = function start(agent, name) {
  var session = {
    id: uuid(),
    browser: agent.pretty(),
    name: name,
    os: agent.prettyOs(),
    time: new Date()
  };
  bus.publish('sessionStarted', session);
  return {
    model: session,
    actions: ['index']
  };
};


exports.handle = start;
