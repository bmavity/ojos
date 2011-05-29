var wotan = require('wotan');

var getActions = function(id) {
  if(id) {
    return {
      index: wotan.getAction('index', { id: id })
    };
  }
  return {
    start: {
      href: '/sessions/start'
    }
  };
};


exports.getActions = getActions;
