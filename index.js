// 'use strict';

// // Imports dependencies and set up http server
// const
//   express = require('express'),
//   bodyParser = require('body-parser'),
//   app = express().use(bodyParser.json()); // creates express http server

// // Sets server port and logs message on success
// app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// // Creates the endpoint for our webhook 
// app.post('/webhook', (req, res) => {  
 
//   let body = req.body;

//   // Checks this is an event from a page subscription
//   if (body.object === 'page') {

//     // Iterates over each entry - there may be multiple if batched
//     body.entry.forEach(function(entry) {

//       // Gets the message. entry.messaging is an array, but 
//       // will only ever contain one message, so we get index 0
//       let webhook_event = entry.messaging[0];
//       console.log(webhook_event);
//     });

//     // Returns a '200 OK' response to all requests
//     res.status(200).send('EVENT_RECEIVED');
//   } else {
//     // Returns a '404 Not Found' if event is not from a page subscription
//     res.sendStatus(404);
//   }

// });

// // Adds support for GET requests to our webhook
// app.get('/webhook', (req, res) => {

//   // Your verify token. Should be a random string.
//   let VERIFY_TOKEN = "aaathp"
    
//   // Parse the query params
//   let mode = req.query['hub.mode'];
//   let token = req.query['hub.verify_token'];
//   let challenge = req.query['hub.challenge'];
    
//   // Checks if a token and mode is in the query string of the request
//   if (mode && token) {
  
//     // Checks the mode and token sent is correct
//     if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
//       // Responds with the challenge token from the request
//       console.log('WEBHOOK_VERIFIED');
//       res.status(200).send(challenge);
    
//     } else {
//       // Responds with '403 Forbidden' if verify tokens do not match
//       res.sendStatus(403);      
//     }
//   }
// });


const PAGE_TOKEN = "EAAIg1tJZAgKQBAHY5EXvzsIm0I89bcaKZCRLxHvTn0qVc3EoBDRiZBRpHbHq4Ce3I0rULc5FxCE5oZCGmWflmrBpijyl779ZCEFZCnW3qvG3q2FhfCgtbGme3fDBAQSxyvbZCdop6IVO7xa6cNYehhBJQxgNloHNs95XEeoqS55gSjdfWQt3iBM"
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var router = express();
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);
app.listen(process.env.PORT || 1337);
app.get('/', (req, res) => {
  res.send("Ok it runs.");
});
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'aaathp') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong valid token');
});

var senders = new Map() 

// execute when somebody send a message to bot
app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    var webhook_event = entry.messaging[0];

    // for (var webhook_event of messages) 
    var senderId = webhook_event.sender.id;
    if (webhook_event.message) {
      // if user send message
      if (!senders.has(senderId)) {
        senders.set(senderId, 0) 
      }
      handleMessage(senderId, webhook_event.message, senders.get(senderId));        
    } else if (webhook_event.postback) {
      handlePostback(senderId, webhook_event.postback);
    } 
  }
  res.status(200).send("OK");
});

function handleMessage (senderId, user_message, stage) {
  let response;

  // Check if the message contains text
  let message = user_message.text
  if (message) {
    if (message == 'exit') {
      response = {"text": "Okay dude. Goodbye then!"}
      senders.set(senderId, 0)
    }
    switch (stage) {
      case 0: 
        response = {"text": "Enter your name to continue. You can send 'exit' at anytime you want to stop. "}
        senders.set(senderId, 1)
        break;
      case 1: 
        var greeting = "Hello " + message + ". "
        senders.set(senderId, 2)
        readyToStart(senderId, greeting)
        break;
    }
  } else if (user_message.attachments) {
    // Gets the URL of the message attachment
    let attachment_url = user_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes_photo",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no_photo",
              }
            ],
          }]
        }
      }
    }
  }
  
  // Sends the response message
  respond(senderId, response);
}


function handlePostback(senderId, user_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = user_postback.payload;

  // Set the response based on the postback payload
  switch (payload) {
    case 'yes_photo': 
      response = { "text": "Thanks!" }
      break;
    case 'no_photo': 
      response = { "text": "Oops, try sending another image." }
      break;
    case "vi_language": 
      break;
    case "en_language":
      break;
  }
  // Send the message to acknowledge the postback
  respond(senderId, response);
}

function readyToStart(senderId, greeting) {
  let response = {
    "text": greeting + "I know you are ready. Let's start anyway. Choose your language",
    "buttons": [
      {
        "type": "postback",
        "title": "tiếng việt nè",
        "payload": "vi_language",
      },
      {
        "type": "postback",
        "title": "english",
        "payload": "en_language",
      }
    ],
  }

  respond(senderId, response)
}

// Send info to REST API => Bot respond automatically
function respond(senderId, response) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: PAGE_TOKEN,
    },
    method: "POST",

    json: {
      recipient: { id: senderId },
      message: response
    }

  }, function(error, response, body) {
    if (error) {
      console.log("sending error")
    } else if (response.body.error) {
      console.log("response body error")
    }
  });
}