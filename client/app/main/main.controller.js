'use strict';

var io;

function listen(title, cb) {
  io.on(title, function(data) {
    cb(data);
  });
}

angular.module('oneNightApp')
  .controller('MainCtrl', function ($scope, $location, Auth, $http, socket) {
    Auth.isLoggedInAsync(function(loggedIn) {
      if (!loggedIn) {
        $location.path('/login');
      }
    });

    io = socket.socket;

    $scope.mode = 'main';
    $scope.user = Auth.getCurrentUser();

    socket.socket.emit('enroll', $scope.user);

    $scope.startGame = function() {
      socket.socket.emit('start');
    }

    $scope.say = function() {
      socket.socket.emit('say', $scope.newLine);
      $scope.newLine = '';
    }

    listen('mode', function(data) {
      $scope.mode = data;
    });

    listen('hi', function(data) {
      $location.path('/settings');
    });

    listen('appendChat', function(data) {
      if(!$scope.chattingTexts) $scope.chattingTexts = '';
      $scope.chattingTexts += '\n' + data;
    });

    listen('refreshUserlist', function(data) {
      $scope.userlist = data;
    });

    $scope.awesomeThings = [];
    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });
    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
