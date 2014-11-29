'use strict';

var io;

function listen(title, cb) {
  io.on(title, function(data) {
    cb(data);
  });
}

function transmit(title, data) {
  io.emit(title, data);
}

angular.module('oneNightApp')
  .controller('MainCtrl', function ($scope, $location, Auth, $http, socket) {
    Auth.isLoggedInAsync(function(loggedIn) {
      if (!loggedIn) {
        $location.path('/login');
      }
      else {
        io = socket.socket;

        $scope.mode = 'main';
        $scope.user = Auth.getCurrentUser();

        $scope.startGame = function() {
          transmit('start');
        };

        $scope.refreshRoom = function() {
          transmit('refreshRoom');
        };

        $scope.say = function() {
          transmit('say', $scope.newLine);
          $scope.newLine = '';
        };

        listen('go', function(whereToGo) {
          $location.path(whereToGo);
        });

        listen('whoareyou', function() {
          transmit('enroll', $scope.user);
        });

        listen('mode', function(data) {
          $scope.mode = data;
        });

        listen('appendChat', function(data) {
          if(!$scope.chattingTexts) $scope.chattingTexts = '';
          $scope.chattingTexts += data + '\n';
        });

        listen('refreshUserlist', function(data) {
          $scope.userlist = data;
        });

        listen('hi', function(data) {
          $location.path('/settings');
        });

        // $scope.awesomeThings = [];
        // $http.get('/api/things').success(function(awesomeThings) {
        //   $scope.awesomeThings = awesomeThings;
        //   socket.syncUpdates('thing', $scope.awesomeThings);
        // });
        // $scope.addThing = function() {
        //   if($scope.newThing === '') {
        //     return;
        //   }
        //   $http.post('/api/things', { name: $scope.newThing });
        //   $scope.newThing = '';
        // };

        // $scope.deleteThing = function(thing) {
        //   $http.delete('/api/things/' + thing._id);
        // };

        $scope.$on('$destroy', function () {
          socket.unsyncUpdates('thing');
        });
        
      }
    });
  });
