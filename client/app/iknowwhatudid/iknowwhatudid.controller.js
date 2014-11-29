'use strict';

angular.module('oneNightApp')
  .controller('IknowwhatudidCtrl', function ($scope, Auth, $location) {
  	Auth.isLoggedInAsync(function(loggedIn) {
      if (!loggedIn || !io) {
        $location.path('/login');
      } 
      else {
	    transmit('bond:enter', Auth.getCurrentUser());

	    listen('bond:allocate', function(targetUser) {
	    	  console.log('allocate1', targetUser);
	    	  $scope.target = targetUser;
	    });

	    listen('bond:option', function(options) {
	    		$scope.options = options;
	    		if($scope.currentSelection) {
	    			$scope.currentSelection = _.find($scope.options, function(option) {
	    				return option.id === $scope.currentSelection.id;
	    			});
	    		}
	    });

	    $scope.impose = function() {
	    		var selected = $scope.currentSelection;
	    		console.log(selected);
	    		transmit('bond:impose', {user:$scope.target, action:selected});
	    }
      }
     });
  });
