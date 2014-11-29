/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var _ = require('lodash');

exports.create = function(socket, connectionlist) {

	var watchOverList = [
		{id:2, key:'리액션대왕', desc:'옆에 앉은 사람이 뭔가를 말하면 반드시 반응을 해줘야한다'},
		{id:3, key:'건배가좋아', desc:'누군가가 건배제의를 하면 추임새를 넣어야 한다'},
		{id:4, key:'마당발', desc:'이름이 언급되면 성을 붙여서 해당 이름을 되물어야 한다'},
		{id:5, key:'안주빨', desc:'건배제의를 하면 잠깐만이라고 외치고 안주를 집어 먹어야 한다'},
		{id:6, key:'치질이야', desc:'신체와 관련된 단어가 언급되면 자리에서 일어났다가 앉아야 한다'},
		{id:7, key:'왼손잡이', desc:'오른손을 쓰면 안된다'},
		{id:8, key:'간신배', desc:'누군가가 웃으면 따라 웃는다'},
		{id:9, key:'수건돌리기', desc:'누군가가 자리를 비우면 거기에 앉아야 한다'},
		{id:10, key:'리필러', desc:'공짜로 채워질 수 있는것들(물, 기본안주)을 채워야 한다'},
		{id:11, key:'불평분자', desc:'누군가가 짜증을 내면 동조한다'},
		{id:12, key:'애정결핍', desc:"누군가가 '야'라고 말하면 '나?'라고 말해야 한다"},
		{id:13, key:'다이어트중', desc:'건배할때마다 먹고 싶은 음식을 말해야 한다'},
		{id:14, key:'꼰대', desc:"누군가가 핸드폰을 보고 있으면 '야 너 뭐하냐'라고 말해야 한다"}
	];

	var numPlayers = connectionlist.length;
	var entered = 0;
	var results = [];
	var finishVotes = [];
	var listeners = [];

	function listen(socket, title, fn) {
		socket.on(title, fn);
		listeners.push({title:title, fn:fn});
	}

	function finishGame(connectionlist) {
		_.forEach(connectionlist, function(socket) {
			_.forEach(listeners, function(listener) {
				socket.removeListener(listener.title, listener.fn);
			});
			socket.emit('go', '/');
		});
	}

	_.forEach(connectionlist, function(connection) {
	  
		connection.emit('go', '/iknowwhatudid');

		listen(connection, 'bond:enter', function(user) {
			entered += 1;
			if(entered === numPlayers) {
				allocateUsers(connectionlist);
				allocateOptions(connectionlist, watchOverList);	  
			}
		});

		listen(connection, 'bond:impose', function(option) {
			var user = option.user;
			var action = option.action;
			connection.user.watch = {user:user, action:action};
			results.push({user:user, action:action});

			var before = watchOverList.length;
			watchOverList = _.remove(watchOverList, function(item) {
				return item.id !== action.id;
			});
			var after = watchOverList.length;
			console.log('before and after', before, after);
			if(after === before) {
				connection.emit('bond:select-again', {});
			}

			if(results.length === numPlayers) {
				_.forEach(results, function(result) {
					var connection = _.find(connectionlist, function(connection) {
						return connection.user._id === result.user._id;
					});
					result.watch = connection.user.watch;
					connection.emit('bond:show-result', result);
				});
			}
			allocateOptions(connectionlist, watchOverList);
		});

		listen(connection, 'bond:finish', function() {
			finishVotes.push(connection); 
			if(finishVotes.length > numPlayers/2) {
				finishVotes = [];
				finishGame(connectionlist);
			}
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