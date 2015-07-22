/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.orge/api/modules.html.

**************************************************************/

var messagesObject = {};
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
  var statusCode = 404;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = "text/plain";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.


  // take the URL and .split('/') it to get an array 
  var urlArray = request.url.split('/');
  // array [0] would be domain name, skip
  // array[1] should be classes and array [2] would be messages or room name
  // hold both words in variables
  var classes = urlArray[1];
  var filter = urlArray[2];

  // in first if statement, check if classes is classes
  // in get and post, check room name

  if(classes === 'classes'){
    if(request.method === 'OPTIONS'){
      statusCode = 200;
    } else if(request.method === 'GET') {
      statusCode = 200;
    } else if(request.method ==='POST') {
      statusCode = 201;
    }
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
        if (messagesObject[filter]){
          messagesObject[filter].push(body);
        } else {
          messagesObject[filter] = [body];
        }
      }
      response.end();
    });
  } else if(request.method === 'GET') {
    // make our data object with a results array
    var data = {};
    data.results = [];
    // if the room is already in our object, send that back as the results array
    if ( (filter in messagesObject) ){
      data.results = messagesObject[filter];
    }
    // either way, send back the data object with the results array attached
    response.end(JSON.stringify(data));
  }
  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
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

