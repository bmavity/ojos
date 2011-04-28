var bus = require('masstransit').create();

var setContent = function sessionsSetContent(id, content, styles) {
  bus.publish('sessionContentSet', content);
};


exports.handle = setContent;
