(function($) {
  (function ($sessionJoin, $peekaboo) {
    var socket = new io.Socket('localhost', {
          port: 8000
        }),
        handlers = {},
        sessionId,
        $portal = $('<iframe id="peekaboo"></iframe>'),
        $contentWindow;
$portal.hide();
$peekaboo.after($portal);
    handlers['sessionContentSet'] = function(viewData) {
      var $contents = $portal.contents();
      console.log($contents[0].getElementsByTagName('head')[0]);
      viewData.styles.push('/css/cursor.css');
      viewData.styles.forEach(function(ss) {
        if(ss.forEach !== undefined) {
          var css = $portal.contents()[0].createElement('style');
          ss.forEach(function(s) {
            css.innerHTML += s;
          });
        } else {
          var css = $portal.contents()[0].createElement('link');
          css.setAttribute('rel', 'stylesheet');
          css.setAttribute('href', ss);
        }
        $portal.contents()[0].getElementsByTagName('head')[0].appendChild(css);
      });
      console.log($contents.find('body'));
      $portal.contents().find('body').html(viewData.content).append('<div class="mouse"></div>');
    };

    handlers['sessionCursorPositionSet'] = function(mouseData) {
      $portal.contents().find('.mouse').css({
        left: mouseData.x + 'px',
        top: mouseData.y + 'px'
      });
    };

    handlers['sessionJoined'] = function() {
      $peekaboo.hide();
      $portal.show();
    };

    handlers['sessionScreenSizeSet'] = function(dimensions) {
      $portal.height(dimensions.height + 16);
      $portal.width(dimensions.width + 16);
    };

    handlers['sessionScrollPositionSet'] = function(scrollPosition) {
      $contentWindow = $($portal[0].contentWindow);
      $contentWindow.scrollTop(scrollPosition.top);
      $contentWindow.scrollLeft(scrollPosition.left);
    };

    socket.on('message', function(message) {
    console.log(message);
      var handler = handlers[message.evt];
      if(handler) {
        handler(message.data);
      }
    });

    $sessionJoin.submit(function(evt) {
      socket.connect();
      socket.send({
        command: $sessionJoin.attr('action')
      });
      evt.preventDefault();
    });
  })($('#sessionJoin'), $('#peekaboo'));
})(jQuery);

/*
(function($) {
  var view = $('iframe'),
      socket = new io.Socket('localhost'),
      sessionId,
      handlers = {};

  handlers['setScreenSize'] = function(dimensions) {
    view.height(dimensions.height + 16);
    view.width(dimensions.width + 16);
  };

  handlers['setContent'] = function(viewData) {
    viewData.styles.push('css/cursor.css');
    viewData.styles.forEach(function(ss) {
      if(ss.forEach !== undefined) {
        var css = view.contents()[0].createElement('style');
        ss.forEach(function(s) {
          css.innerHTML += s;
        });
      } else {
        var css = view.contents()[0].createElement('link');
        css.setAttribute('rel', 'stylesheet');
        css.setAttribute('href', ss);
      }
      view.contents()[0].getElementsByTagName('head')[0].appendChild(css);
    });
    view.contents().find('body').html(viewData.content).append('<div class="mouse"></div>');
  };

  handlers['startSession'] = function(session) {
  console.log(session);
    sessionId = session;
  };

  handlers['setCursorPosition'] = function(mouseData) {
    view.contents().find('.mouse').css({
      left: mouseData.x + 'px',
      top: mouseData.y + 'px'
    });
  };

  handlers['setScrollPosition'] = function(scrollData) {
    $(view[0].contentWindow).scrollTop(scrollData.scrollTop);
    $(view[0].contentWindow).scrollLeft(scrollData.scrollLeft);
  };

  socket.on('message', function(message) {
    if(message.command) {
      handlers[message.command](message.data);
    }
  });

  socket.connect();

  $('button').click(function() {
    socket.send({
      csa: true,
      command: 'viewSession',
      data: sessionId
    });
  });
})(jQuery);
*/
