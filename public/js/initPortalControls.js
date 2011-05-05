(function() {
  var loadScript = function(url, callback) {
    var script = document.createElement("script");
    if (script.readyState){  //IE
      script.onreadystatechange = function() {
        if (script.readyState == "loaded" || script.readyState == "complete"){
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {  //Others
      script.onload = function() {
        callback();
      };
    }

    script.src = url;
    document.body.appendChild(script);
  };

  var loadControlPanel = function() {
    $.ajax('/sessions/controlPanel', {
      success: function(cont) {
        $('body').append($(cont));
      }
    });
  };

  if(typeof jQuery === 'undefined') {
    loadScript('https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js', loadControlPanel);
  } else {
    loadControlPanel();
  }
}())
