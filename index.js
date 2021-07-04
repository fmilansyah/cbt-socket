var expressFramework = require('express');
var app = expressFramework();
var bodyParser = require('body-parser');
var fs = require('fs');

//read configuration
var configuration = JSON.parse(fs.readFileSync('config.json', "utf8"));

//setup express
app.set('json spaces', 2);
app.disable('x-powered-by'); //disable express framework credits

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* Variable */
let allClients = []

app.get('/', function(req, res){
  return res.status(200).send({
    status: 200,
    message: 'Welcome to Smart School Socket'
  })
});

app.get('/client', function(req, res){
  if(req.query.pass === 'smart-school-socket'){
    return res.json(allClients)
  }
  return res.json('')
});

var webServer = app.listen(configuration.web_server_port, function(){ 
  console.log('listening on *:'+configuration.web_server_port);
});

// Socket IO
var io = require('socket.io')(webServer, {
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
io.on('connection', function(socket){
  const token = socket.handshake.query.token
  if (token !== 'undefined') {
    var finded = allClients.find(result => result == token)
    if (finded) {
      socket.emit('blocked', {id:socket.handshake})
    }
    allClients.push(token)
  }
  socket.on('disconnect', function() {
    var i = allClients.indexOf(token)
    if (i > -1) {
      allClients.splice(i, 1)
    }
  });
});

//setup process
var killHook = function killHook() {
  console.log("Detected kill signal");

  webServer.close(function() {
      console.log("Graceful shutdown");
      process.exit(0);
  });

  setTimeout(function () {
      console.log("Waited for " + configuration.max_seconds_to_wait_on_kill + " seconds. Force kill.");
      process.exit(0);
  }, configuration.max_seconds_to_wait_on_kill * 1000);
};

process.title = configuration.process_title;
process.on('SIGTERM', killHook);
process.on('SIGINT', killHook);
