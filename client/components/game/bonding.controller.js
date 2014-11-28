'use strict';

angular.module('oneNightApp')
  .controller('BondCtrl', function ($scope, $location, Auth, socket) {
    listen('bond:allocate', function(data) {
      $scope.target = data;
    });
  });