 angular.module('Alimenting').controller('ClientsController', ClientsController);

 function ClientsController($http){
 		var clients = this;

 		$http
			.get('/ailments/list')
			.then(function(response){
				clients.ailmentsList = response.data.ailments
			});
		
		clients.getMyAilments = function(){
			$http
				.get('/myailments')
				.then(function(response){
					clients.viewSelected = 'ailments';
					clients.me = response.data;
					clients.myailmentslist = response.data.ailments;
			})
		};

		clients.getMyAilments();

		clients.addAilment = function(){
			var ailment = {ailment :clients.selected}
			$http
				.post('/users/addAilment',ailment)
				.then(function(response){
					clients.getMyAilments();
			})
		};

 		clients.foodList = function(selection){
 			$http
			.get('/myaliments/'+ selection)
			.then(function(response){
				clients.foodsConsumeList = response.data.foods_consume;
				clients.foodsLimitList = response.data.foods_limit;
				clients.foodsAvoidList = response.data.foods_avoid;
				clients.sources = response.data.resources
			})
 		};

 		clients.getrecipe = function(selection){
 			$http
 			.get('/recipes/'+selection)
 			.then(function(response){
 				clients.suggestedRecipes = response.data;
 			})
 		};

 		clients.activateAilment = function(selection){
 			clients.ailmentSelected = selection
 			clients.foodList(selection);
 			clients.getrecipe(selection);
 		};

 		clients.removeAilment = function(selection){
 			var ailment = {name: selection}
 			$http
 			.post('/removeAilment', ailment)
 			.then(function(response){
 				clients.getMyAilments();
 			})
 		};

 		clients.addToFaves = function(id){
 			var recipeId = {id:id};
 			$http
 			.post('/myfaves', recipeId)
 			.then(function(response){

 			})
 		};

 		clients.removeFave = function(id){
 			var recipeId = {id:id};
 			$http
 			.post('/my-fave/delete', recipeId)
 			.then(function(response){
 				clients.getFaveList();

 			})
 		};

 		clients.getFaveList = function(){
 			$http
 			.get('/myfaverecipes')
 			.then(function(response){
 				clients.myFavRecipes = response.data;
 			})
 		};

 		clients.activateView = function(view){
 			clients.viewSelected = view;
 			if (view === 'faves'){
 				clients.getFaveList();
 			}

 		};

 };
