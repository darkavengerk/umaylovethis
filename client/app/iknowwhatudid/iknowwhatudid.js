'use strict';

angular.module('oneNightApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('iknowwhatudid', {
        url: '/iknowwhatudid',
        templateUrl: 'app/iknowwhatudid/iknowwhatudid.html',
        controller: 'IknowwhatudidCtrl'
      });
  });