/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var _ = require('lodash');

exports.create = function(socket, connectionlist) {

	var watchOverList = [
		{id:1, key:'나불대라', desc:'1분이상 말 없이 있을 수 없다'},
		{id:2, key:'리액션대왕', desc:'옆에 앉은 사람이 뭔가를 말하면 반드시 반응을 해줘야한다'},
		{id:3, key:'건배가좋아', desc:'누군가가 건배제의를 하면 신나는 모양새를 취해야한다'}
	];

	var numPlayers = connectionlist.length;
	var entered = 0;
	var results = [];

	_.forEach(connectionlist, function(connection) {
	  
		connection.emit('go', '/iknowwhatudid');

		connection.on('bond:enter', function(user) {
			entered += 1;
			if(entered === numPlayers) {
				allocateUsers(connectionlist);
				allocateOptions(connectionlist, watchOverList);	  
			}
		});

		connection.on('bond:impose', function(option) {
			var user = option.user;
			var action = option.action;
			connection.user.watch = user;
			results.push({user:user, action:action});

			watchOverList = _.remove(watchOverList, function(item) {
				return item.id !== action.id;
			});
			if(results.length === numPlayers) {
				_.forEach(results, function(result) {
					var connection = _.find(connectionlist, function(connection) {
						console.log(result);
						return connection.user._id === result.user._id;
					});
					result.watch = connection.user.watch;
					connection.emit('bond:show-result', result);
				});
			}
			allocateOptions(connectionlist, watchOverList);
		});
	});

}

function toResultPage(connectionlist) {
	_.forEach(connectionlist, function(socket) {
		socket.emit('bond:show-result', watchOverList);
	});
}

function allocateUsers(connectionlist) {
	var connections = _.shuffle(connectionlist);
	var first = connections[0], last = connections[connections.length-1];
	_.reduce(connections, function(prev, next) {
		prev.emit('bond:allocate', next.user);
		return next;
	});
	last.emit('bond:allocate', first.user);
}

function allocateOptions(connectionlist, watchOverList) {
	_.forEach(connectionlist, function(socket) {
		socket.emit('bond:option', watchOverList);
	});
}