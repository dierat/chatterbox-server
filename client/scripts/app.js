// YOUR CODE HERE:

// object named app
var app = {};
// should have a method called init
app.username = (window.location.search).slice((window.location.search).lastIndexOf('=') + 1);

app.init = function(){

app.currentRoom="lobby";
app.friends = {};

};

// should have a send method
app.send = function(message){
  // should submit a POST request
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: 'http://127.0.0.1:3000/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

// add a fetch method to app object
app.fetch = function() {
  // should implement a GET request via ajax
  $.get( "http://127.0.0.1:3000/classes/messages", function( data ) {
    console.log("data = ", data);
    // var arr = JSON.parse(data).results;
    var arr = data.results;

    arr.reverse().forEach(function(message) {

      var roomname = cleanMe(message.roomname);
      var username = cleanMe(message.username);

      if($('option[value="' + message.roomname + '"]')[0] === undefined) {
        app.addRoom(roomname);
      }

      if((app.currentRoom === message.roomname  || 
          app.currentRoom === 'lobby')          && 
        $('#' + message.objectId)[0] === undefined) {

        $('#chats').prepend('<div class="'+ username + '" id="'+ message.objectId + '">'+ 
          '<div class="text-primary username" onclick="app.addFriend(\''+username+'\')">' + 
          username + ': ' +'</div>' + '<div class="text-warning usertext">' + cleanMe(message.text) +'</div></div>');
      }
      if (app.friends[username]){
        
        $('.' + username).addClass('bg-info');
      }
    });
    
  });

};

app.changeRoom = function(room){
  app.currentRoom = room;
  app.clearMessages();
  app.fetch();
};

function cleanMe(string){
  var result = '';
  if(string === undefined || string === null) {
    return;
  }
  for(var i = 0; i < string.length; i++) {
    var chr = string.charAt(i);
    switch(chr) {
      case '<': result += '&lt;';
        break;
      case '>': result += '&gt;';
        break;
      case '"': result += '&quot;';
        break;
      case "'": result += '&#x27;';
        break;
      case '/': result += '&#x2F;';
        break;
      default: result += chr;
    }
  }
  return result;
}

// Add three methods to app object as follows:
// 1- app.clearMessages - clear all messages from the DOM
app.clearMessages = function() {
  $('#chats').empty();
};

// 2- app.addMessage - add Message to the DOM 
app.addMessage = function(message) {
  // call send method and pass in the message
  app.send(message);
 
};

// 3- app.addRoom
app.addRoom = function(string) {
  if (string ===undefined){
    return;
  }

  $('#selectbasic').prepend('<option value="' + string + '">' + string + '</option>');
};

app.addFriend = function(name){
  // Toggle add / removing friend
  if(app.friends[name] === undefined) {
    app.friends[name] = true;
    $('.' + name).addClass('bg-info');
  } else if(app.friends[name] === true) {
    app.friends[name] = undefined;
    $('.' + name).removeClass('bg-info');
  }
};

app.handleSubmit = function(){
  var messageString = document.getElementById('message').value;

  document.getElementById('message').value = '';
  console.log("Form was submitted");

  var message = {
    username: app.username,
    text: messageString,
    roomname: app.currentRoom
  };

  app.addMessage(message);
  return false;
 // check for default event
};
  
app.setRoom = function(string){

  app.addRoom(string);
  app.changeRoom(string);
  $('#selectbasic').val(string);
  return false;
};

$(document).ready(function(){
  app.init();
  app.fetch();
  // $('#message').emojiPicker({  height: '300px',  width: '450px'});

  setInterval(app.fetch, 1000);
});


  