(function(d) {
  var loadScript = function(url, callback) {
    var script = d.createElement("script");
    if (script.readyState){  //IE
      script.onreadystatechange = function() {
        if (script.readyState == "loaded" || script.readyState == "complete"){
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {  //Others
      script.onload = function() {
        callback && callback();
      };
    }

    script.src = url;
    d.body.appendChild(script);
  };

  var loadControlPanel = function() {
    $.ajax('/sessions/controlPanel', {
      success: function(content) {
        var head = d.head;
        /*
        content.styles.forEach(function(style) {
          var ss = d.createElement('link');
          ss.setAttribute('rel', 'stylesheet');
          ss.setAttribute('href', style);
          head.appendChild(ss);
        });
        */
        $('body').append($(content));
        loadScript('/js/client.js');
      }
    });
  };

  if(typeof jQuery === 'undefined') {
    loadScript('https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js', loadControlPanel);
  } else {
    loadControlPanel();
  }
}(document));
