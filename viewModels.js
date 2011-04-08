var bus = require('masstransit').create(),
    viewModels = {};

bus.ready({ transport: 'amqp', host: 'localhost', queueName: 'sessionStarted' }, function() {
  bus.subscribe('sessionStarted', function(session) {
    var id = session.id;
    viewModels['index'][id] = {
      sessionName: 'Session name ' + id,
      sessionJoin: {
        action: '/sessions/join/' + id
      },
      info: {
        time: session.time.toString(),
        browser: session.browser,
        os: session.os
      }
    };
  });
  
  bus.subscribe('sessionScreenSizeSet', function(screenSizeSet) {
    var id = screenSizeSet.id,
        index = viewModels['index'][id],
        imgSrc = '/img/sessions/' + id + '.png';
    index.dimensions = screenSizeSet.width + ' x ' + screenSizeSet.height;
    require('./screenshotFactory').createScreenshot({
      url: 'http://localhost:8000/',
      height: screenSizeSet.height,
      width: screenSizeSet.width,
      outputFile: __dirname + '/public' + imgSrc
    });
    index.sessionImage = {
      src: imgSrc
    };
  });
});

var index = function(id, callback) {
  callback(viewModels['index'][id]);
};

viewModels['index'] = {};


exports.index = index;


/*
      sessionName: 'Session ' + req.params.id,
      info: {
        author: 'by Anonymous',
        browser: 'FireFox 4.0',
        dimensions: '1600 x 1200',
        time: 'at 5:00 PM'
      }
*/
