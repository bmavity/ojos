var bus = require('masstransit').create();
  



var setCursorPosition = function sessionsCursorPositionSet(id, position) {
  bus.publish('sessionCursorPositionSet', {
    id: id,
    x: position.x,
    y: position.y
  });
};

var setScrollPosition = function sessionsSetScrollPosition(id, position) {
  bus.publish('sessionScrollPositionSet', {
    id: id,
    left: position.left,
    top: position.top
  });
};




exports.setCursorPosition = setCursorPosition;
exports.setScrollPosition = setScrollPosition;
