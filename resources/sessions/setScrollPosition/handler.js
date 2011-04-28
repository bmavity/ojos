var bus = require('masstransit').create();
  
var setScrollPosition = function(id, top, left) {
  bus.publish('sessionScrollPositionSet', {
    id: id,
    left: left,
    top: top
  });
};


exports.handle = setScrollPosition;
