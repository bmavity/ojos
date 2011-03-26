var connect = require('connect'),
    io = require('socket.io'),
    server = connect.createServer(
      connect.logger(),
      connect.static(__dirname + '/public'),
      connect.router(function(app) {
        app.get('/', function(req, res) {
          jsdom.env(__dirname + '/views/index.html', [
            'http://code.jquery.com/jquery-1.5.min.js',
            caruso.pathTo('text'),
            caruso.pathTo('injector'),
            'function() { };'
          ], function(errors, window) {
            var $ = window.$,
                $document = $(window.document);
                /*
            $document.inject({
              title: 'this is a test of the emergency broadcast system',
              navLinks: [
                { href: '/', html: 'home' },
                { href: '/blog', html: 'blog' },
                { href: '/experience', html: 'experience' },
                { href: '/contact', html: 'contact' }
              ]
            });
            */
            console.log(window.document.innerHTML);
            $('script:not(body script)').remove();
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(window.document.innerHTML);
          });
        });
      })
    ),
    socketServer = io.listen(server),
    jsdom = require('jsdom'),
    caruso = require('caruso'),
    sessionTracker = require('./sessionTracker');

socketServer.on('connection', function(client) {
  var id = client.sessionId;

  client.send(id);

  sessionTracker.createSession(id);

  client.on('message', function(command) {
    var startTime,
        commands;
    if(command.csa) {
      commands = sessionTracker.displaySession(command.data);
      startTime = commands[0].time;
      commands.forEach(function(command) {
        setTimeout(function() {
          client.send(command.command);
        }, command.time - startTime);
      });
    } else {
      sessionTracker.handle(id, command);
      if(command.command === 'startSession') {
        command.data = id;
        client.broadcast(command);
      }
      //client.broadcast(command);
    }
  });
});


server.listen(8000);
