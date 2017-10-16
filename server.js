var port = 8085;
var express = require('express');
var app = express();
var cors_proxy = require('cors-anywhere');
var path = require('path');
app.set('port', 3002);

app.use(express.static(path.join(__dirname, 'public')));

cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, function() {
    console.log('Running CORS Anywhere on ' + ':' + port);
});

// Define the port to run on

// Listen for requests
var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Magic happens on port ' + port);
});
