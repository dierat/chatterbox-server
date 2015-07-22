fs = require('fs');

// var messagesObject = {};

exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.

  console.log("Serving request type " + request.method + " for url " + request.url);
  console.log(typeof request.url === 'string');

  // The outgoing status.
  var statusCode = 404;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them JSON.
  headers['Content-Type'] = "application/json";

  // take the URL and .split('/') it to get an array 
  var urlArray = request.url.split('/');
  // array [0] would be domain name, skip
  // array[1] should be classes and array [2] would be messages or room name
  // hold both words in variables
  var classes = urlArray[1];
  var filter = urlArray[2];

  // in first if statement, check if classes is classes
  if(classes === 'classes'){
    // then check request type and update statusCode accordingly
    if(request.method === 'OPTIONS'){
      statusCode = 200;
    } else if(request.method === 'GET') {
      statusCode = 200;
    } else if(request.method ==='POST') {
      statusCode = 201;
    }
  }

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  if(request.method === 'POST') {
    var body = '';
    // data is string passed from client
    request.on('data', function (data) {
      body += data;
      // check if data is larger than 1 * 10^6
      if(body.length > 1e6) {
        request.connection.destroy();
      }
    });
    request.on('end', function() {
      if(body) {
        body = JSON.parse(body);
        body.createdAt = new Date();
        body.objectId = Math.floor(Math.random() * 1000);
        // read file to get existing messagesObject and parse to return to object form
        var messagesObject = fs.readFileSync('messagesObject.txt', 'utf8');
        if (messagesObject){
          messagesObject = JSON.parse(messagesObject);
        }
        if (messagesObject[filter]){
          messagesObject[filter].push(body);
        } else {
          messagesObject[filter] = [body];
        }
        // stringify object and write to the file, overriding old object
        fs.writeFileSync('messagesObject.txt', JSON.stringify(messagesObject));
      }
      response.end();
    });
  } else if(request.method === 'GET') {
    // make our data object with a results array
    var data = {};
    data.results = [];
    // read file to get existing messagesObject and parse to return to object form
    var messagesObject = fs.readFileSync('messagesObject.txt', 'utf8');
    // CHANGE 'OBJECT' TO 'SRING' AFTER WRITING FILE IS WORKING
    if (typeof messagesObject === 'string'){
      messagesObject = JSON.parse(messagesObject);
      // if the room is already in our object, send that back as the results array
      if ( (filter in messagesObject) ){
        data.results = messagesObject[filter];
      }
    }
    // either way, send back the data object with the results array attached
    response.end(JSON.stringify(data));
  }
  response.end();
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
