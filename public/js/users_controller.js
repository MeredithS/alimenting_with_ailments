angular.module('Alimenting').controller('UsersController', UsersController);

function UsersController($http){
	var users = this;

	users.isFormActive = false;
	users.isSignInActive = false;

	users.new = function(){
		users.isFormActive = false;
	}

	users.signIn = function(){
		console.log('clicked')
	}

};