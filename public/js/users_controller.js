angular.module('Alimenting').controller('UsersController', UsersController);

function UsersController($http){
	var users = this;

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
	}

	users.showAilments = function(){
		$http
			.get('/ailments/list')
			.then(function(response){
				console.log(response.data.ailments)
				ailmentsList = response.data.ailments
			});
	}

	users.activate = function(section){
		users.selection = section 
		if (section === 'ailments'){
			console.log('clicked ailments');
			users.showAilments();
		}
	}

};