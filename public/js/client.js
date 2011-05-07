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
 
  var $startSession = $('#startSession');
  $startSession.submit(function(evt) {
    var $inputs = $startSession.find(':text'),
        formData = {};
    $inputs.each(function() {
      formData[this.name] = this.value;
    });
    console.log(formData);
    $.ajax({
      type: $startSession.attr('method'),
      url: $startSession.attr('action'),
      data: formData,
      success: function(data) {
        var actions = data.actions;
        id = data.model.id;
        Object.keys(actions).forEach(function(key) {
          var url = actions[key].href,
              $url = $('#url');
          $url.focus(function() {
            $url.select();
          });
          $('#url').val(url);
        });
        loadScript('/js/testPage.js');
      }
    });
    evt.preventDefault();
  });

  var $actions = $('#actions');
}(document));
