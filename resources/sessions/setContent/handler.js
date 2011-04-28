var bus = require('masstransit').create();

var setContent = function sessionsSetContent(id, content, styles) {
  bus.publish('sessionContentSet', {
    id: id,
    content: content,
    styles: styles
  });
};


exports.handle = setContent;
