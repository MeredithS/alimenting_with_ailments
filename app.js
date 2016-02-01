var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var unirest = require('unirest');
var session = require('express-session');
var bcrypt = require('bcrypt');
var MongoStore = require('connect-mongo')(session)

var authenticateUser = function(e_mail, password, callback) {
	db.collection('users').findOne({e_mail: e_mail}, function(err, data) {
		if (err) {throw err;}
		if(data){
		bcrypt.compare(password, data.password_digest, function(err, passwordsMatch) {
			if (passwordsMatch) {
				console.log('password correct')
				callback(data);
			} else {
				callback(false);
			}
			});
		}else{
			callback(false);
		}
	});
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname +'/bower_components'));
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
	console.log(req.method, req.url);
	next();
});


var mongoUrl = process.env.MONGOLAB_URI|| 'mongodb://localhost:27017/aliment_app';

app.use(session({
	secret: 'Monty',
	store: new MongoStore({url: mongoUrl })
}))

var db;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId
MongoClient.connect(mongoUrl, function(err, database){
	if(err){ throw err; }
	db = database;
	process.on('exit', db.close);
});


//Routes go here
app.get('/', function(req,res){
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
app.post('/users', function(req,res){
	console.log("new user body");
	console.log(req.body);
	var new_user = req.body;
	var email = req.body.e_mail;
	var password = req.body.password_digest;
	bcrypt.hash(req.body.password_digest,8,function(err,hash){
		new_user.password_digest = hash;
		new_user.ailments=[];
		new_user.fav_recipies=[];
		console.log("user to be inserted");
		console.log(new_user);
		db.collection('users').insert(new_user,function(err,result){
			if(!err){
				console.log("inserted user:");
				console.log(result);
			}
		});
		db.collection('users').findOne({e_mail: email},function(err,user){
			console.log(user);
				req.session.name = user.first_name;
				req.session.userID = user._id;
				console.log('name: '+ user.first_name);
				console.log('id" '+ user._id);
				console.log('in session');  
				res.redirect('/index');
		})
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
	if (user){
		res.render('index');
	}else{
		res.redirect('/');
	}
})

app.post('/login',function(req,res){
	console.log('login');
	console.log(req.body);
	authenticateUser(req.body.email, req.body.password, function(user){
		if(user){
			req.session.name = user.first_name;
			req.session.userID = user._id;
			console.log('in session'); 
      res.redirect('/index');//could not figure out why this wouldn't work
    }else{
    	res.redirect('/');
    }
  });
})

app.get('/logout', function(req,res){
	req.session.name = null;
	req.session.userID = null;
	res.redirect('/');
})

app.get('/myailments', function(req,res){
	var id = req.session.userID
	db.collection('users').findOne({_id: ObjectId(id)}, function(err,result){
		res.json(result);
	})
})

app.post('/users/addAilment', function(req,res){
	db.collection('ailments').findOne({_id: ObjectId(req.body.ailment)}, function(err,result){
		db.collection('users').update({_id: ObjectId(req.session.userID)},{$push: {ailments: result.name}}, function(error,data){
			res.json(data);
		})
	})
})

app.get('/myaliments/:ailment', function(req,res){
	var name =req.params.ailment
	db.collection('ailments').findOne({name: name},function(err,result){
		res.json(result);
	})
});

app.get('/recipes/:ailment', function(req,res){
	console.log('getting recipes');
	var goodRecipes =[];
	var name =req.params.ailment
	db.collection('ailments').findOne({name: name},function(err,result){//this gets the information on the ailment that was clicked
		console.log('getting ailment info');
		var avoid = result.foods_avoid;
		var consume = result.foods_consume;
		var consumeString = consume.join(',');
		var consumeReplace = consumeString.replace(/,/g, '%2C');
		var consumeUrlReady = consumeReplace.replace(/\s/g, "+");
		unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients?ingredients="+consumeUrlReady+"&limitLicense=false&number=20&ranking=1")
		.header("X-Mashape-Key", process.env.X_MASHAPE_KEY)
		.header("Accept", "application/json")
		.end(function (result) { //this returns a list of recipes based on the foods that you should increase consumption of
			console.log("getting 20 recipes");

			var allPromises = result.body.map(function(recipe) {
				return new Promise(function(resolve, reject) {
	  		// result.body.forEach(function(recipe){ //this loops through each of the recipes returned above.
	  			unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/"+recipe.id+"/information")
	  			.header("X-Mashape-Key", process.env.X_MASHAPE_KEY)
	  			.end(function (result) { //this returns information about a specific recipe
	  				console.log('get ingredients for each recipe');
	  				var ingredients = result.body.extendedIngredients;

	  				var allIng = ingredients.map(function(ingredient){
	  					return ingredient.name
	  				});
	  				var flatIngredients = allIng.reduce(function(a,b) {
	  					return a.concat(b);
	  				})
	  						var isOkay;
	  						var badRecipe;
	  						for(i=0; i< flatIngredients.length; i++){ //this is looping throught all the ingredients of a recipe
	  							for(a=0; a < avoid.length; a++){ // this is looping through all the ingredients you should avoid based on your ailment.
	  								if(allIng[i] === avoid[a]){ // this is comparing each ingredient to the array of foods to avoid
	  									isOkay = false; //if the ingredient matches one of the foods to avoid set the variable isOkay to false and exit the inside loop
	  									return;
	  								} else {
	  									isOkay = true; //else set to true and keep iterating through the array
	  								}
		  						}
		  						if(isOkay === false){ //if isOkay is false by the time the loop is ended or exited set the variabe badRecipe to true and exit the outside loop
		  							badRecipe = true
		  							return;
		  						} else {
		  							badRecipe = false //else set badRecipe to false and continue looping throughout side loop
		  						}
		  					}

  						if (!badRecipe) { //if badRecipe is false by the time the loop is done or excited then:
  							goodRecipes.push(result.body); //push recipe into array.
  							resolve(result.body);
  						} else {
  							reject();
  						}
  					});
	  		})// ends return of new promise

			}); // ends map to allPromises function
			Promise.all(allPromises).then(function(arrayOfResults) {
				console.log("WHEEEE")
				res.json(goodRecipes);
			});
		}); // ends first API call function
	});// ends db call callback
}); // ends app.get callback

app.post('/removeAilment', function(req,res){
	var name = req.body.name;
	db.collection('users').update({_id: ObjectId(req.session.userID)},{$pull:{ailments: name}}, function(err,data){
		res.end();
	})
})

app.post('/myfaves', function(req,res){
	var id = req.body.id;
	db.collection('users').update({_id: ObjectId(req.session.userID)},{$push:{fav_recipies: id}}, function(err,data){
		res.end();
	});
});

app.get('/myfaves', function(req,res){
	res.render("indexPartial");
})


app.get('/myfaverecipes', function(req,res){
	var myRecipes = [];
	db.collection('users').findOne({_id: ObjectId(req.session.userID)}, function(err,result){
		var myRecipeIds = (result.fav_recipies);
		var promises = myRecipeIds.map(function(recipeId){
			var url = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/"+recipeId+"/information"
			return new Promise(function(resolve, reject){
				unirest.get(url).header("X-Mashape-Key", process.env.X_MASHAPE_KEY).end(function(result){
					myRecipes.push(result.body);
					resolve();
				})
			})
		})
		Promise.all(promises).then(function(){
			res.json(myRecipes)
		});
	})
})

app.post('/my-fave/delete', function(req,res){
	console.log(req.body.id)
	var id = req.body.id;
	db.collection('users').update({_id: ObjectId(req.session.userID)},{$pull:{fav_recipies: id}}, function(err,result){
			res.end();

	})
})




app.listen(process.env.PORT || 3000);