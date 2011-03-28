(function($) {
  var socket = new io.Socket('localhost', {
        port: 8000
      }),
      $window = $(window),
      $document = $(document);

  socket.on('message', function(m) {
    console.log(m);
  });

  var init = function() {
    socket.connect();
    startSession();
    setScreenSize();
    setContent();
    setScrollPosition();
    setCursorPosition(0, 0);
  };

  var setContent = function setContent() {
    var $fakeBody = $('body').clone();
    $fakeBody.find('script').remove();
    var stylesheets = $.makeArray(document.styleSheets).map(function(ss) {
      return $.makeArray(ss.cssRules).map(function(rule) {
        return rule.cssText;
      })
    });

    submitCommand({
      command: 'setContent',
      data: {
        content: $fakeBody.html(),
        styles: stylesheets
      }
    });
  };

  var setCursorPosition = function setCursorPosition(x, y) {
    submitCommand({
      command: 'setCursorPosition',
      data: {
        x: x,
        y: y
      }
    });
  };

  var setScreenSize = function setScreenSize() {
    submitCommand({
      command: 'setScreenSize',
      data: {
        height: $window.height(),
        width: $window.width()
      }
    });
  };

  var setScrollPosition = function setScrollPosition() {
    submitCommand({
      command: 'setScrollPosition',
      data: {
        scrollLeft: $window.scrollLeft(),
        scrollTop: $window.scrollTop()
      }
    });
  };

  var startSession = function startSession() {
    submitCommand({
      command: 'startSession'
    });
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

  var $startSession = $('#startSession');
  $startSession.submit(function(evt) {
    $.ajax({
      type: $startSession.attr('method'),
      url: $startSession.attr('action'),
      success: function(data) {
        var actions = data.actions;
        Object.keys(actions).forEach(function(key) {
          $actions.find('#' + key).val(actions[key]);
          $startSession.append($('<a></a>').attr('href', actions[key]).html('Join'));
        });
        init();
      }
    });
    evt.preventDefault();
  });

  var $actions = $('#actions');
})(jQuery);

