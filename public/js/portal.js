(function($) {
  (function ($sessionJoin, $peekaboo) {
    var socket = new io.Socket('localhost', {
          port: 8000
        }),
        handlers = {},
        sessionId,
        $portal = $('<iframe id="peekaboo"></iframe>');
    
    handlers['sessionContentSet'] = function(viewData) {
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
      $portal.contents().find('body').html(viewData.content).append('<div class="mouse"></div>');
    };

    handlers['sessionJoined'] = function() {
      //var $contents = $portal.contents();
      //console.log($contents);
      $portal[0].innerHtml = '<html lang="en"><head></head><body></body></html>';
      console.log($portal.html());
      $peekaboo.replaceWith($portal);

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
