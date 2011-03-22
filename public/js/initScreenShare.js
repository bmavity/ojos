(function($) {
  var socket = new io.Socket('localhost'),
      $window = $(window);

  socket.connect();

  socket.send({
    messageType: 'window.resize',
    data: {
      height: $window.height(),
      width: $window.width()
    }
  });

  var $fakeBody = $('body').clone();
  $fakeBody.find('script').remove();
  var stylesheets = [];
  for(var i = 0; i < document.styleSheets.length; i += 1) {
    stylesheets.push(document.styleSheets[i].href);
  }
  socket.send({
    messageType: 'dom',
    data: {
      content: $fakeBody.html(),
      styles: stylesheets
    }
  });

  var limit = function(callback) {
    var canReport = true;
    return function(arg1) {
      if(canReport) {
        canReport = false;
        callback(arg1);
        setTimeout(function() {
          canReport = true;
        }, 50);
      }
    };
  };

  $(document).mousemove(limit(function(evt) {
    socket.send({
      messageType: 'mouse.move',
      data: {
        x: evt.pageX,
        y: evt.pageY
      }
    });
  }));

  $(window).scroll(limit(function(evt) {
    socket.send({
      messageType: 'window.scroll',
      data: {
        scrollLeft: $(window).scrollLeft(),
        scrollTop: $(window).scrollTop()
      }
    });
  }));

  $(window).resize(limit(function(evt) {
    socket.send({
      messageType: 'window.resize',
      data: {
        height: $window.height(),
        width: $window.width()
      }
    });
  }));
})(jQuery);
