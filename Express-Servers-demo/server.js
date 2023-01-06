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
  let topicsList = posts['topics'];

  let sortTopics = posts["topics"]["sortedTopics"];

  sortTopics.sort(function(a, b) {
    return parseFloat(a.topicNumber)-parseFloat(b.topicNumber);
  });

  posts['topics']["sortedTopics"] = sortTopics;

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
    response.render("opponentDetails",{
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
    let postPhoto = request.body.postPhoto;
    let postTopic = request.body.postID.topic;
    let postContent = request.body.postID.content;
    let postTitle = request.body.postID.title;
    if(postID&&postTopic&&postContent&&postTitle){
      let posts = JSON.parse(fs.readFileSync('data/posts.json'));
      let newPost = {
        "postID": postID,
        "topic": postTopic,
        "title": postTitle,
        "content": postContent,
      }
      posts[postID] = newPost;

      let topicsList = posts["topics"];
      for (let post in posts){
        //let postTopic = post['topic'].toLowerCase().trim();
        if (topicsList.hasOwnProperty(postTopic)){
          //if the topic already exists
          topicsList[postTopic]["topicNumber"] = parseInt(topicsList[postTopic]) + 1; //increase the count of posts under that topic
        } else{
          //if the topic doesn't exist yet in topicsList
          topicsList[postTopic]["topicName"] = postTopic;
          topicsList[postTopic]["topicNumber"] = 1;
          let sortTopics = posts["topics"]["sortedTopics"];
          sortTopics.push(topicsList[postTopic]);
          posts["topics"]["sortedTopics"] = sortTopics;
        }


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

  // using dynamic routes to specify resource request information
  let topic = request.params.topicName;

  if(topics[topicName]){

    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("opponentDetails",{
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
