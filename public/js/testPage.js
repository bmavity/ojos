(function($) {
  var loc = document.location,
      port = (loc.port && { port: loc.port }) || {},
      socket = new io.Socket(loc.hostname, port),
      $window = $(window),
      $document = $(document);
      //id;

  socket.on('message', function(m) {
    console.log(m);
  });

  var readySession = function() {
    submitCommand({
      command: '/sessions/ready/' + id
    });
  };

  var setContent = function setContent() {
    var $fakeBody = $('body').clone();
    $fakeBody.find('script').remove();
    $fakeBody.find('#wispyHelpControlPanel').remove();
    var stylesheets = $.makeArray(document.styleSheets).map(function(ss) {
      return $.makeArray(ss.cssRules).map(function(rule) {
        return rule.cssText;
      })
    });

    submitCommand({
      command: '/sessions/setContent/' + id,
      data: {
        content: $fakeBody.html(),
        styles: stylesheets
      }
    });
  };

  var setCursorPosition = function setCursorPosition(x, y) {
    if(id) {
      submitCommand({
        command: '/sessions/setCursorPosition/' + id,
        data: {
          x: x,
          y: y
        }
      });
    }
  };

  var setScreenSize = function setScreenSize() {
    if(id) {
      submitCommand({
        command: '/sessions/setScreenSize/' + id,
        data: {
          height: $window.height(),
          width: $window.width()
        }
      });
    }
  };

  var setScrollPosition = function setScrollPosition() {
    if(id) {
      submitCommand({
        command: '/sessions/setScrollPosition/' + id,
        data: {
          left: $window.scrollLeft(),
          top: $window.scrollTop()
        }
      });
    }
  };

  var submitCommand = function submitCommand(command) {
    socket.send(command);
  };

  var limit = function(callback) {
    var canReport = true,
        lastArgs;
    return function() {
      lastArgs = arguments;
      if(canReport) {
        canReport = false;
        callback.apply({}, arguments);
        setTimeout(function() {
          canReport = true;
          if(lastArgs) {
            callback.apply({}, lastArgs);
            lastArgs = null;
          }
        }, 50);
      }
    };
  };

  $window.scroll(limit(setScrollPosition));
  $window.resize(limit(setScreenSize));
  $document.mousemove(limit(function(evt) {
    setCursorPosition(evt.pageX, evt.pageY);
  }));
  socket.connect();
  readySession();
  setContent();
  setScreenSize();
  setScrollPosition();
})(jQuery);

