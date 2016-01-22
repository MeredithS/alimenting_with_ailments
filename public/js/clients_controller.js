 angular.module('Alimenting').controller('ClientsController', ClientsController);

 function ClientsController($http){
 		var clients = this;

 		clients.showFoods = false;

 		$http
			.get('/ailments/list')
			.then(function(response){
				clients.ailmentsList = response.data.ailments
			});
		
		$http
			.get('/myailments')
			.then(function(response){
				console.log(response.data)
			})

		clients.addAilment = function(){

			console.log('clicked');
			// $http
			// 	.get('/users/:sessionId/:ailmentId')
			// 	.then(function(response){
			// 		console.log(response.data)
			// 	})

		}

 		clients.foodList = function(){
 			$http
			.get('/aliments/'+ clients.selected)
			.then(function(response){
				clients.showFoods = true;
				clients.foodsConsumeList = response.data.foods_consume;
				clients.foodsLimitList = response.data.foods_limit;
				clients.foodsAvoidList = response.data.foods_avoid;
				clients.sources = response.data.resources

			})
 		}
 }