/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.orge/api/modules.html.

**************************************************************/

var messages = [];
var key = 0;

exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log("Serving request type " + request.method + " for url " + request.url);
  console.log(typeof request.url === 'string');

  // The outgoing status.
  var statusCode;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = "text/plain";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  var room ;
  if(request.url === '/send'){
    statusCode = 201;
  } else if (request.url === '/classes/messages'){
    statusCode = 200;
  } else {
    statusCode = 404;
  }
  response.writeHead(statusCode, headers);
  // slice last word off of request url
  // check if word is key in object
  // use object to store keys with room names
  // value of each key will have array of messages associated with room

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
        body.objectId = key++;
        console.log(body);
        messages.push(body);
      }
    });
  } else if(request.method === 'GET') {
    var data = {};
    data.results = messages;
    console.log("data = ",data);
    response.end(JSON.stringify(data));
  }
  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  response.end("Hello, World!");
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

