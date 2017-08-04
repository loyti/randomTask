var express = require("express");
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require( "path");

var app = express();

var counter = 0;
var users_array = [];
var surveyInfo = [];

app.set("views", path.join(__dirname + "/views"));//path.join()
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname + "/static")));//path.join()
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'codingdojorocks'}));  // string for encryption

// app.HTTP_VERB('URL', function (request, response){});  // HTTP_VERB is either 'get' or 'post' etc...

// root route
app.get('/', function (request, response){
  response.render('index', {title: "Random Task Project"});
});

app.get('/users', function (request, response){
  var data = {users: users_array, utitle: "Users Project"}
  response.render('users', data);
});

// route to process new user form data:
app.post('/users', function (request, response){
    console.log("POST DATA \n\n", request.body);
    //code to add user to db goes here!
    users_array.push(request.body);
    // redirect the user back to the root route.
    response.redirect('users');
});

app.get('/users/:id', function (request, response){
    console.log("The user id requested is:", request.params.id);
    // just to illustrate that req.params is usable here:
    response.send("You requested the user with id: " + request.params.id);
    // code to get user from db goes here, etc...
});

app.get('/count', function (request, response){
    var countContext = {
      counter: counter,
      ctitle: "Counting with JS & jQuery",
    };
    response.render('count', countContext);
});

app.post('/count', function (request, response){
    // counter++;
    // console.log("The counter is counting " + counter);
    response.redirect('count');
});

app.post('/countdown', function (request, response){
  // counter--;
  // console.log("The counter is counting " + counter);
  response.redirect('count');
});

app.get('/countReset', function(request, response) {
    // counter = 0;
    // console.log('counter reset ' + counter);
    response.redirect('count');
});

app.get('/survey', function(request, response){
  console.log('Requesting survey template');
  response.render('survey', {stitle: "Please complete the Survey"});
});

app.get('/surveyResults', function(request, response){
  console.log('Requesting survey results template');
  var data = {
    surveyInfo: surveyInfo,
    stitle: "Survey Results"
  };
  response.render('surveyResults', data);
});

app.post('/survey', function(request, response){
  surveyInfo.push(request.body);
  response.redirect('surveyResults');
});

var port = 8000;

var server = app.listen(port, function(){
  console.log("listening on port", port);
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

  socket.on('postingForm', function (newData){
    var random_number = Math.floor((Math.random() * 1000) + 1);
    console.log('New Survey Added!');
    socket.emit('updated_message', {response:  newData});
    socket.emit('random_number', {response:  random_number});
  });

  socket.on('countUp', function(countChange){
      counter++;
      console.log('counting up ' + counter);
      //socket.broadcast.emit('countingUp', {response: counter});
      io.emit('serverCount', {response: counter});
  });

  socket.on('countDown', function(countChange){
      counter--;
      console.log('counting down ' + counter);
      //socket.broadcast.emit('countingDown', {response: counter});
      io.emit('serverCount', {response: counter});
  });

  socket.on('countReset', function(zero){
      counter = 0;
      console.log('count reset ' + counter);
      //socket.broadcast.emit('countingReset', {response: counter});
      io.emit('serverCountReset', {zero: counter});
  });

  console.log("Client/socket is connected!");
  console.log("Client/socket id is: ", socket.id);
  // all the server socket code goes in here
});
