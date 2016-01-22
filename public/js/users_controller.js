angular.module('Alimenting').controller('UsersController', UsersController);


function UsersController($http){
	var users = this;

	users.isFoodListActive = false

	users.new = function(){
		var user ={first_name : users.f_name,
							last_name: users.l_name,
							e_mail: users.email,
							password: users.password}
		$http
			.post('/users/new', user)
			.then(function(response){
				users.f_name="";
				users.l_name="";
				users.email="";
				users.password="";
				users.pass_confirm="";
			})
	}

	users.signIn = function(){
		console.log('clicked')
		var user = {e_mail: users.email, password: users.password}
		$http
			.post('/login', user)
			.then(function(response){
				location.href="http://127.0.0.1:3000/index"
			})
	}

	users.showAilments = function(){
		$http
			.get('/ailments/list')
			.then(function(response){
				users.ailmentsList = response.data.ailments
			});
	}

	users.changed = function(){
		$http
			.get('/aliments/'+ users.selected)
			.then(function(response){
				users.isFoodsListActive = true
				users.foodsConsumeList = response.data.foods_consume;
				users.foodsLimitList = response.data.foods_limit;
				users.foodsAvoidList = response.data.foods_avoid;
				users.sources = response.data.resources

			})
	}

	users.activate = function(section){
		users.selection = section 
		if (section === 'ailments'){
			users.showAilments();
		}
	}

};