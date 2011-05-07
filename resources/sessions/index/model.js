var bus = require('masstransit').create(),
    viewModels = {};

bus.subscribe('sessionStarted', function(session) {
  var id = session.id;
  viewModels[id] = {
    sessionName: session.name,
    actions: ['join'],
    info: {
      time: session.time.toString(),
      browser: session.browser,
      os: session.os
    }
  };
});

bus.subscribe('sessionScreenSizeSet', function(screenSizeSet) {
  var id = screenSizeSet.id,
      model = viewModels[id],
      imgSrc = '/img/sessions/' + id + '.png';
  model.dimensions = screenSizeSet.width + ' x ' + screenSizeSet.height;
  if(!model.sessionImage) {
    require('./screenshotFactory').createScreenshot({
      url: 'http://localhost:8000/',
      height: screenSizeSet.height,
      width: screenSizeSet.width,
      outputFile: 'public' + imgSrc
    });
    model.sessionImage = {
      src: imgSrc
    };
  }
});

var getModel = function(id) {
  return viewModels[id];
};


module.exports = exports = getModel;
