var bus = require('masstransit').create();

var start = function start(id, agent, name) {
  var session = {
    id: id,
    browser: agent.pretty(),
    name: name,
    os: agent.prettyOs(),
    time: new Date()
  };
  bus.publish('sessionStarted', session);
  return {
    model: session
  };
};


exports.handle = start;
