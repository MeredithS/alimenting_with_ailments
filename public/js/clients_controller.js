 angular.module('Alimenting').controller('ClientsController', ClientsController);

 function ClientsController($http){
 		var clients = this;

 		clients.showFoods = false;

 		$http
			.get('/ailments/list')
			.then(function(response){
				clients.ailmentsList = response.data.ailments
			});
		
		clients.getMyAilments = function(){
			$http
				.get('/myailments')
				.then(function(response){
					console.log(response.data.ailments);
					clients.me = response.data
					clients.myailmentslist = response.data.ailments
			})
		}

		clients.getMyAilments();

		// clients.addAilment = function(){
		// 	console.log('clicked');
		// 	var ailment = clients.selected
		// 	console.log(ailment);
		// 	$http
		// 		.post('/users/addAilment',ailment)
		// 		.then(function(response){
		// 			// console.log('added');
		// 			// clients.getMyAilments();
		// 	})
		// }

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