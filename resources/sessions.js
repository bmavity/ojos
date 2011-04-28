var bus = require('masstransit').create();
  
var setScrollPosition = function sessionsSetScrollPosition(id, position) {
  bus.publish('sessionScrollPositionSet', {
    id: id,
    left: position.left,
    top: position.top
  });
};


exports.handle = setScrollPosition;
