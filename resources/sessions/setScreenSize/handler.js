var bus = require('masstransit').create();

var setScreenSize = function sessionsSetScreenSize(id, height, width) {
  bus.publish('sessionScreenSizeSet', {
    id: id,
    height: height,
    width: width
  });
};


exports.handle = setScreenSize;
