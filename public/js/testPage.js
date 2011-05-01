(function($) {
  var socket = new io.Socket('localhost', {
        port: 8000
      }),
      $window = $(window),
      $document = $(document),
      id;

  socket.on('message', function(m) {
    console.log(m);
  });

  var init = function(id) {
    socket.connect();
    readySession(id);
    setContent(id);
    setScreenSize(id);
    setScrollPosition(id);
  };

  var readySession = function(sessionId) {
    submitCommand({
      command: '/sessions/ready/' + sessionId
    });
  };

  var setContent = function setContent(sessionId) {
    var $fakeBody = $('body').clone();
    $fakeBody.find('script').remove();
    var stylesheets = $.makeArray(document.styleSheets).map(function(ss) {
      return $.makeArray(ss.cssRules).map(function(rule) {
        return rule.cssText;
      })
    });

    submitCommand({
      command: '/sessions/setContent/' + sessionId,
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

  var setScreenSize = function setScreenSize(id) {
    submitCommand({
      command: '/sessions/setScreenSize/' + id,
      data: {
        height: $window.height(),
        width: $window.width()
      }
    });
  };

  var setScrollPosition = function setScrollPosition(id) {
    submitCommand({
      command: '/sessions/setScrollPosition/' + id,
      data: {
        left: $window.scrollLeft(),
        top: $window.scrollTop()
      }
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

/*
  $window.scroll(limit(setScrollPosition));
  $window.resize(limit(setScreenSize));
*/
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
          $actions.find('#' + key).val(actions[key].href);
          $startSession.append($('<a></a>').attr('href', actions[key].href).html('Join'));
        });
        id = data.model.id;
        init(data.model.id);
      }
    });
    evt.preventDefault();
  });

  var $actions = $('#actions');
})(jQuery);

