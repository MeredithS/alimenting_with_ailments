var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var unirest = require('unirest');
var session = require('express-session');
var bcrypt = require('bcrypt');

var authenticateUser = function(e_mail, password, callback) {
  db.collection('users').findOne({e_mail: e_mail}, function(err, data) {
    if (err) {throw err;}
    bcrypt.compare(password, data.password_digest, function(err, passwordsMatch) {
      if (passwordsMatch) {
      	console.log('password correct')
        callback(data);
      } else {
        callback(false);
      }
    })
  });
};


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname +'/bower_components'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'Monty'
}))

var db;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId
var mongoUrl = process.env.MONGOLAB_URI|| 'mongodb://localhost:27017/aliment_app';
MongoClient.connect(mongoUrl, function(err, database){
		if(err){ throw err; }
		db = database;
		process.on('exit', db.close);
});


//Routes go here
app.get('/', function(req,res){
// unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?excludeIngredients=coconut&limitLicense=false&number=100&offset=0&query=broccoli&type=main+course")
// .header("X-Mashape-Key", process.env.X_MASHAPE_KEY)
// .end(function (result) {
//   console.log(result.body);
// });
// unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/494407/information")
// .header("X-Mashape-Key", process.env.X_MASHAPE_KEY)
// .end(function (result) {
//   console.log(result.headers, result.body);
// });
	res.render("welcome");
});

app.get('/ailments',function(req,res){
	res.render("ailmentsPartial");
})

app.get('/ailments/list', function(req,res){
	db.collection('ailments').find({}).toArray(function(err,results){
		res.json({ailments: results})
	});
})
app.post('/users/new', function(req,res){
	// console.log(req.body);
	var new_user = req.body;
	new_user.ailments=[];
	new_user.fav_recipies=[];
	db.collection('users').insert(new_user,function(err,result){
		res.json(result);
	})
});

app.get('/aliments/:id', function(req,res){
	var id =req.params.id
	db.collection('ailments').findOne({_id: ObjectId(id)},function(err,result){
		res.json(result);
	})
})


app.get('/index', function(req,res){
	var user = req.session.name
	console.log(user);
	if (user){
		console.log('bob');
		res.render('index');
	}else{
		console.log('went home');
		res.redirect('/');
	}
})

app.post('/login',function(req,res){
	authenticateUser(req.body.e_mail, req.body.password, function(user){
		if(user){
      req.session.name = user.first_name;
      req.session.userID = user._id;
      console.log('in session'); 
      res.redirect('/index');
    }
	});
})

app.get('/logout', function(req,res){
	req.session.name = null;
	req.session.userID = null;
	res.redirect('/');
})

// app.get('/myailments', function(req,res){
// 	var id = req.session.userID
// 	db.collection.('users').findOne({_id: ObjectId(id)}, function(err,result){})
// })



app.listen(process.env.PORT || 3000);