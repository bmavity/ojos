var bus = require('masstransit').create();

var setCursorPosition = function(id, x, y) {
  bus.publish('sessionCursorPositionSet', {
    id: id,
    x: x,
    y: y
  });
};


exports.handle = setCursorPosition;
