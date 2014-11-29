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

	    listen('bond:show-result', function(result) {
	    		$scope.result = result;
	    })

	    listen('bond:select-again', function(result) {
	    		$scope.waiting = false;
	    });

	    $scope.finish = function() {
	    		transmit('bond:finish', '');
	    		$scope.finishVoted = true;
	    }

	    $scope.impose = function() {
	    		var selected = $scope.currentSelection;
	    		if(selected) {
	    			$scope.waiting = true;
	    			transmit('bond:impose', {user:$scope.target, action:selected});
	    		}
	    }
      }
     });
  });
