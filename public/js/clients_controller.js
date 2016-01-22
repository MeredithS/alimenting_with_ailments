 angular.module('Alimenting').controller('ClientsController', ClientsController);

 function ClientsController($http){
 		var clients = this;

 		$http
			.get('/ailments/list')
			.then(function(response){
				console.log(response.data);
				clients.ailmentsList = response.data.ailments
			});


 		clients.ailmentList = function(){
 			console.log('clicked');
 		}
 }