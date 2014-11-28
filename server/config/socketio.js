/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var _ = require('lodash');
var lockerRoom = [];
var socketIo;

// When the user disconnects.. perform this
function onDisconnect(socket) {
}

function broadcast(message, data) {
  _.forEach(lockerRoom, function(socket) {
    socket.emit(message, data);
  });
}

function getUsers() {
  return _.pluck(lockerRoom, 'user');
}

// When the user connects.. perform this
function onConnect(socket) {

  socket.on('enroll', function(user) {
    _.remove(lockerRoom, function(socket) {
      return socket.user._id === user._id;
    });
    socket.user = user;
    lockerRoom.push(socket);
    broadcast('refreshUserlist', _.pluck(lockerRoom, 'user'));
  });

  socket.on('start', function (data) {
    if(lockerRoom.length >= 3) {
      broadcast('mode', 'bond');
      var connections = _.shuffle(lockerRoom);

      var last;
      _.reduce(connections, function(prev, next) {
        prev.emit('bond:allocate', next.user);
        last = next;
        return next;
      });
      last.emit('bond:allocate', connections[0].user);

      // for(var i=1;i<connections.length;i++) {
      //   connections[i-1].emit('bond:allocate', connections[i].user)
      // }
      // connections[connections.length-1].emit('bond:allocate', connections[0].user)
    }
  });

  socket.on('say', function(line) {
    broadcast('appendChat', socket.user.name + ' : ' + line);
  })

  // Insert sockets below
  require('../api/thing/thing.socket').register(socket);
}

module.exports = function (io) {

  socketIo = io;
  
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  io.use(require('socketio-jwt').authorize({
    secret: config.secrets.session,
    handshake: true
  }));

  io.on('connection', function (socket) {
    socket.address = socket.handshake.address || process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.info('[%s] DISCONNECTED', socket.address);
    });

    // Call onConnect.
    onConnect(socket);
    console.info('[%s] CONNECTED', socket.address);
  });
};