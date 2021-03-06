angular.module('Alimenting').controller('UsersController', UsersController);


function UsersController($http){
	var users = this;

	users.isFoodListActive = false

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