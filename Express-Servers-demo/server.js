//..............Include Express..................................//
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const uuid = require('uuid');


//..............Create an Express server object..................//
const app = express();

//..............Apply Express middleware to the server object....//
app.use(express.json()); //Used to parse JSON bodies (needed for POST requests)
app.use(express.urlencoded());
app.use(express.static('public')); //specify location of static assests
app.set('views', __dirname + '/views'); //specify location of templates
app.set('view engine', 'ejs'); //specify templating library

//.............Define server routes..............................//
//Express checks routes in the order in which they are defined

app.get('/', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("index");
});

// app.get('/feed', function(request, response) {
//     let posts = JSON.parse(fs.readFileSync('data/posts.json'));
//     response.status(200);
//     response.setHeader('Content-Type', 'text/html')
//     response.render("feed", {
//       data: posts
//     });
// });


app.get('/viewContent', function(request, response) {
  let posts = JSON.parse(fs.readFileSync('data/posts.json'));
  let topics = JSON.parse(fs.readFileSync('data/topics.json'));

  let sortTopics = [];

  console.log(posts);

  for (post in posts){

    let postTopic = posts[post].topic;
    sortTopics.push(postTopic);
    if (topics.hasOwnProperty(postTopic)){ //if the topic already exists
      topics[postTopic]["topicNumber"]++
      // = parseInt(topics[postTopic]["topicNumber"])+1; //increase the count of posts under that topic
    } else { //if the topic doesn't exist yet in topicsList
      let newTopic = {
        "topicName": postTopic,
        "topicNumber": 1
      }
      topics[postTopic] = newTopic;
    }
   }

  sortTopics.sort(function(a, b) {
    return parseFloat(a.topicNumber)-parseFloat(b.topicNumber);
  });
  fs.writeFileSync('data/topics.json', JSON.stringify(topics));

  //posts['topics']["sortedTopics"] = sortTopics;

  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("viewContent",{
    topics: sortTopics
  });
});

app.get('/post/:postID', function(request, response) {
  let posts = JSON.parse(fs.readFileSync('data/posts.json'));

  // using dynamic routes to specify resource request information
  let postID = request.params.postID;

  if(posts[postID]){
    // opponents[opponentName].win_percent = (opponents[opponentName].win/parseFloat(opponents[opponentName].win+opponents[opponentName].lose+opponents[opponentName].tie) * 100).toFixed(2);
    // if(opponents[opponentName].win_percent=="NaN") opponents[opponentName].win_percent=0;

    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("postDetails",{
      post: posts[postID]
    });
  }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"404"
    });
  }
});

app.get('/postCreate', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("postCreate");
});

//this should be good
app.post('/postCreate', function(request, response) {
    let postID = uuid.v4();
    let postContent = request.body.postContent;
    let postTopic = request.body.postTopic;
    let postTitle = request.body.postTitle;

    if(postID&&postTopic&&postContent&&postTitle){
      let posts = JSON.parse(fs.readFileSync('data/posts.json'));
      let newPost = {
        "postID": postID,
        "title": postTitle,
        "topic": postTopic,
        "content": postContent,
      }

      posts[postID] = newPost;

      fs.writeFileSync('data/posts.json', JSON.stringify(posts));

      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.redirect("/post/"+postID);

    }else{
      response.status(400);
      response.setHeader('Content-Type', 'text/html')
      response.render("error", {
        "errorCode":"400"
      });
    }
});


app.get('/topic/:topicName', function(request, response) {
  let posts = JSON.parse(fs.readFileSync('data/posts.json'));
  let topics = JSON.parse(fs.readFileSync('data/topics.json'));

  // using dynamic routes to specify resource request information
  let topicName = request.params.topicName;

  if(topics[topicName]){
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("topicDetails", {
      data: posts,
      topic: topics[topicName]
    });

  }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"404"
    });
  }
});

// Because routes/middleware are applied in order,
// this will act as a default error route in case of
// a request fot an invalid route
app.use("", function(request, response){
  response.status(404);
  response.setHeader('Content-Type', 'text/html')
  response.render("error", {
    "errorCode":"404"
  });
});

//..............Start the server...............................//
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server started at http://localhost:'+port+'.')
});
