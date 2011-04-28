var bus = require('masstransit').create();
  



var setCursorPosition = function sessionsCursorPositionSet(id, position) {
  bus.publish('sessionCursorPositionSet', {
    id: id,
    x: position.x,
    y: position.y
  });
};

var setScreenSize = function sessionsSetScreenSize(id, dimensions) {
  bus.publish('sessionScreenSizeSet', {
    id: id,
    height: dimensions.height,
    width: dimensions.width
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
exports.setScreenSize = setScreenSize;
exports.setScrollPosition = setScrollPosition;
