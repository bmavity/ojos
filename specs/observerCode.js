var zombie = require('zombie'),
    browser = new zombie.Browser({
      runScripts: false
    }),
    assert = require('assert');

browser.on('error', function(obj) {
  console.log(obj.error);
});

browser.visit('http://localhost:8000/testPage.html', function(err, browser, status) {
  assert.equal(browser.text('title'), 'Software Development, Interaction Design');
});


