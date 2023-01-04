//..............Include Express..................................//
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');

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

app.get('/feed', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("index");
});

app.get('/feed', function(request, response) {
    let posts = JSON.parse(fs.readFileSync('data/posts.json'));
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("feed", {
      data: posts
    });
});


app.get('/viewContent', function(request, response) {
  let posts = JSON.parse(fs.readFileSync('data/posts.json'));
  let topicsList = posts['topics'];

  for (let post in posts){
    let postTopic = post['topic'].toLowerCase().trim();
    if (topicsList.hasOwnProperty(postTopic)){
      //if the topic already exists
      // topicsList[postTopic][post.postID] = post;
      topicsList[postTopic] = parseInt(topicsList[postTopic]) + 1; //increase the count of posts under that topic

    } else{
      //if the topic doesn't exist yet in topicsList
      topicsList[postTopic] = 1;
    }
  }

  //sort the array by amount of posts in each topic
  let sortedByNumber = [];
  for (let topic in topicsList){
    sortedByNumber.push([topic, maxSpeed[vehicle]]);

    for (var vehicle in maxSpeed) {
    }

sortable.sort(function(a, b) {
    return a[1] - b[1];
});

  }







    //   posts['topics'][post.topic] = parseInt(posts['topics'][post.topic]) + 1;

      //means that there is already another post with this topic
    // } else{
    //   topicsArray.push(topic);
    // }

    // posts['topics'] =
    // posts['topics'][post.topic] = parseInt(posts['topics'][post.topic]) + 1;
  }



  //create an array to use sort, and dynamically generate win percent
  for(name in opponents){
    opponents[name].win_percent = (opponents[name].win/parseFloat(opponents[name].win+opponents[name].lose+opponents[name].tie) * 100).toFixed(2);
    if(opponents[name].win_percent=="NaN") opponents[name].win_percent=0;
    opponentArray.push(opponents[name])
  }

  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("scores",{
    opponents: opponentArray
  });
});

app.get('/opponent/:opponentName', function(request, response) {
  let posts = JSON.parse(fs.readFileSync('data/posts.json'));

  // using dynamic routes to specify resource request information
  let opponentName = request.params.opponentName;

  if(opponents[opponentName]){
    opponents[opponentName].win_percent = (opponents[opponentName].win/parseFloat(opponents[opponentName].win+opponents[opponentName].lose+opponents[opponentName].tie) * 100).toFixed(2);
    if(opponents[opponentName].win_percent=="NaN") opponents[opponentName].win_percent=0;

    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("opponentDetails",{
      opponent: opponents[opponentName]
    });

  }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"404"
    });
  }
});

app.get('/opponentCreate', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("opponentCreate");
});

app.post('/postCreate', function(request, response) {
    let postID = request.body.postID; //connects to name="postID" in the ejs form
    let postPhoto = request.body.postPhoto;
    if(opponentName&&opponentPhoto){
      let posts = JSON.parse(fs.readFileSync('data/posts.json'));
      let newPost={
        "postID": postID,
        "topic": topic,
        "title": ,
        "content": 0,
        "photo": postPhoto,
      }
      opponents[opponentName] = newOpponent;
      fs.writeFileSync('data/opponents.json', JSON.stringify(opponents));

      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.redirect("/opponent/"+opponentName);
    }else{
      response.status(400);
      response.setHeader('Content-Type', 'text/html')
      response.render("error", {
        "errorCode":"400"
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

//
// app.get('/viewContent', function(request, response) {
//     let posts = JSON.parse(fs.readFileSync('data/posts.json'));
//
//     //accessing URL query string information from the request object
//     let opponent = request.query.opponent;
//     let playerThrow = request.query.throw;
//
//     if(opponents[opponent]){
//       let opponentThrowChoices=["Paper", "Rock", "Scissors"];
//       let results={};
//
//       results["playerThrow"]=playerThrow;
//       results["opponentName"]=opponent;
//       results["opponentPhoto"]=opponents[opponent].photo;
//       results["opponentThrow"] = opponentThrowChoices[Math.floor(Math.random() * 3)];
//
//       if(results["playerThrow"]===results["opponentThrow"]){
//         results["outcome"] = "tie";
//       }else if(results["playerThrow"]==="Paper"){
//         if(results["opponentThrow"]=="Scissors") results["outcome"] = "lose";
//         else results["outcome"] = "win";
//       }else if(results["playerThrow"]==="Scissors"){
//         if(results["opponentThrow"]=="Rock") results["outcome"] = "lose";
//         else results["outcome"] = "win";
//       }else{
//         if(results["opponentThrow"]=="Paper") results["outcome"] = "lose";
//         else results["outcome"] = "win";
//       }
//
//       if(results["outcome"]=="lose") opponents[opponent]["win"]++;
//       else if(results["outcome"]=="win") opponents[opponent]["lose"]++;
//       else opponents[opponent]["tie"]++;
//
//       //update opponents.json to permanently remember results
//       fs.writeFileSync('data/posts.json', JSON.stringify(posts));
//
//       response.status(200);
//       response.setHeader('Content-Type', 'text/html')
//       response.render("results", {
//         data: results
//       });
//     }else{
//       response.status(404);
//       response.setHeader('Content-Type', 'text/html')
//       response.render("error", {
//         "errorCode":"404"
//       });
//     }
// });


//..............Start the server...............................//
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server started at http://localhost:'+port+'.')
});
