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

  // socket.emit('whoareyou', {});

  function enroll(user) {
    _.remove(lockerRoom, function(socket) {
      return socket.user._id === user._id;
    });
    socket.user = user;
    lockerRoom.push(socket);
    broadcast('refreshUserlist', _.pluck(lockerRoom, 'user'));
    // broadcast('appendChat', socket.user.name + ' entered');
  }
  socket.removeListener('enroll', enroll);
  socket.on('enroll', enroll);

  function start(data) {
    if(lockerRoom.length >= 2) {
      require('../api/games/iknowwhatudid.socket').create(socket, lockerRoom);
      lockerRoom = [];
    }
  }
  socket.removeListener('start', start);
  socket.on('start', start);

  function refreshRoom() {
    broadcast('whoareyou', {});
    broadcast('chat', '');
    lockerRoom = [];
  }
  socket.removeListener('refreshRoom', refreshRoom);
  socket.on('refreshRoom', refreshRoom);

  function say(line) {
    broadcast('appendChat', socket.user.name + ' : ' + line);
  }
  socket.removeListener('say', say);
  socket.on('say', say)

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