var getActions = function(id) {
  if(id) {
    return {
      index: {
        href: '/sessions/' + id
      }
    };
  }
  return {
    start: {
      href: '/sessions/start'
    }
  };
};


exports.getActions = getActions;
