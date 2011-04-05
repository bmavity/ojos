var bus = require('masstransit').create(),
    viewModels = {};

bus.ready({ transport: 'amqp', host: 'localhost', queueName: 'sessionStarted' }, function() {
  bus.subscribe('sessionStarted', function(session) {
  console.log(session.time);
    viewModels['index'][session.id] = {
      sessionName: 'Session name ' + session.id,
      info: {
        time: session.time.toString(),
        browser: session.browser,
        os: session.os
      }
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
