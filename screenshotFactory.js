var spawn = require('child_process').spawn;

var createScreenshot = function screenshotFactoryCreateScreenshot(options, callback) {
  var phantom = spawn('phantomjs', ['rasterize.js', options.url, options.width, options.height, options.outputFile]);
};


exports.createScreenshot = createScreenshot;
