var bus = require('masstransit').create(),
    viewModels = {};

bus.subscribe('sessionStarted', function(session) {
  var id = session.id;
  viewModels[id] = {
    sessionName: 'Session name ' + id,
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
  require('./screenshotFactory').createScreenshot({
    url: 'http://localhost:8000/',
    height: screenSizeSet.height,
    width: screenSizeSet.width,
    outputFile: 'public' + imgSrc
  });
  model.sessionImage = {
    src: imgSrc
  };
});

var getById = function(id) {
  return viewModels[id];
};


exports.getById = getById;


/*
      sessionName: 'Session ' + req.params.id,
      info: {
        author: 'by Anonymous',
        browser: 'FireFox 4.0',
        dimensions: '1600 x 1200',
        time: 'at 5:00 PM'
      }
*/
