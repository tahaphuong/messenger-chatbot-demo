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
  res.send("Server chạy ngon lành.");
});
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'aaathp') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});
// Đoạn code xử lý khi có người nhắn tin cho bot
app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      if (message.message) {
        // Nếu người dùng gửi tin nhắn đến
        if (message.message.text) {
          var text = message.message.text;
          if(text == 'hi' || text == "hello")
          {
            sendMessage(senderId, "Trung Quân's Bot: " + 'Xin Chào');
          }
          else{sendMessage(senderId, "Trung Quân's Bot: " + "Xin lỗi, câu hỏi của bạn chưa có trong hệ thống, chúng tôi sẽ cập nhật sớm nhất.");}
        }
      }
    }
  }
  res.status(200).send("OK");
});
// Gửi thông tin tới REST API để Bot tự trả lời
function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: "EAAIg1tJZAgKQBAHY5EXvzsIm0I89bcaKZCRLxHvTn0qVc3EoBDRiZBRpHbHq4Ce3I0rULc5FxCE5oZCGmWflmrBpijyl779ZCEFZCnW3qvG3q2FhfCgtbGme3fDBAQSxyvbZCdop6IVO7xa6cNYehhBJQxgNloHNs95XEeoqS55gSjdfWQt3iBM",
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}