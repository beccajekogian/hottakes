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

  for (topic in topics){
    topics[topic]["topicNumber"] = 0;
  }

  for (post in posts){
    let postTopic = posts[post].topic;

    if (topics.hasOwnProperty(postTopic)){ //if the topic already exists
      topics[postTopic]["topicNumber"]++;
      // = parseInt(topics[postTopic]["topicNumber"])+1; //increase the count of posts under that topic
    } else { //if the topic doesn't exist yet in topicsList
      let newTopic = {
        "topicName": postTopic,
        "topicNumber": 1
      }
      topics[postTopic] = newTopic;
    }
    if (!sortTopics.includes(postTopic)) sortTopics.push(postTopic);
   }

  sortTopics.sort(function(a, b) {
    console.log(topics[a].topicNumber + " b: " + topics[b].topicNumber);
    return parseFloat(topics[b].topicNumber)-parseFloat(topics[a].topicNumber);
  });

  // for (topic in topics){
  //   if (topics[topic]['topicNumber'] === 0 && !sortTopics.includes(topics[topic]['topicName'])) sortTopics.push(topics[topic]['topicName']);
  // }

  console.log(sortTopics);
  fs.writeFileSync('data/topics.json', JSON.stringify(topics));

  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("viewContent",{
    sortedTopics: sortTopics,
    topics: topics
  });
});

app.get('/post/:postID', function(request, response) {
  let posts = JSON.parse(fs.readFileSync('data/posts.json'));
  let comments = JSON.parse(fs.readFileSync('data/comments.json'));

  // using dynamic routes to specify resource request information
  let postID = request.params.postID;

  if(posts[postID]){

    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("postDetails",{
      post: posts[postID],
      comments: comments
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
    let topics = JSON.parse(fs.readFileSync('data/topics.json'));
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("postCreate", {
      topics: topics
    });
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

//
// app.get('/topicCreate', function(request, response) {
//     response.status(200);
//     response.setHeader('Content-Type', 'text/html')
//     response.render("topicCreate");
// });
//
// //this should be good
// app.post('/topicCreate', function(request, response) {
//     let topicName = request.body.topic;
//     let topics = JSON.parse(fs.readFileSync('data/topics.json'));
//
//     if (topics.hasOwnProperty(topicName)){ //if the topic already exists, unable to make a new topic
//       response.status(400);
//       response.setHeader('Content-Type', 'text/html')
//       response.render("error", {
//         "errorCode":"400"
//       });
//     } else { //if the topic doesn't exist yet, make a new object for the topic
//         let newTopic = {
//           "topicName": topicName,
//           "topicNumber": 0
//         }
//       topics[topicName] = newTopic;
//       fs.writeFileSync('data/topics.json', JSON.stringify(topics));
//       response.status(200);
//       response.setHeader('Content-Type', 'text/html')
//       response.redirect("/topic/"+topicName);
//     }
// });

app.get('/commentCreate', function(request, response) {

    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("postDetails");

});

app.post('/commentCreate', function(request, response) {
    let commentSubject = request.body.commentSubject;
    let commentContent = request.body.commentContent;
    let commentPostID = request.body.commentPostID; //  find how to get the postID from before
    console.log("ID"+commentPostID);
    let commentID = uuid.v4();

    let comments = JSON.parse(fs.readFileSync('data/comments.json'));
    let posts = JSON.parse(fs.readFileSync('data/posts.json'));

    if (commentID&&commentPostID&&commentContent&&commentSubject){ //if the topic already exists, unable to make a new topic
        let newComment = {
          "commentID": commentID,
          "commentPostID": commentPostID,
          "commentSubject": commentSubject,
          "commentContent": commentContent
        }
      comments[commentID] = newComment;

      fs.writeFileSync('data/comments.json', JSON.stringify(comments));

      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.render("postDetails",{
        post: posts[commentPostID],
        comments: comments
      });
    } else{
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
      posts: posts,
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
