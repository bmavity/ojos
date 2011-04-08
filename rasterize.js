if (phantom.state.length === 0) {
  if (phantom.args.length !== 4) {
    console.log('Usage: rasterize.js URL width height filename');
    phantom.exit();
  } else {
    var address = phantom.args[0];
    phantom.state = 'rasterize';
    phantom.viewportSize = { width: phantom.args[1], height: phantom.args[2] };
    phantom.open(address);
  }
} else {
  var output = phantom.args[3];
  phantom.render(output);
  phantom.exit();
}
