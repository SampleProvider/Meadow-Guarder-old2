
if(process.env.PORT){
	SERVER = 'heroku';
}
else{
	SERVER = 'localhost';
}

var express = require('express');
const {setInterval} = require('timers');
var app = express();
var serv = require('http').Server(app);
require('./server/entity');
require('./server/database');

app.get('/',function(req,res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
if(SERVER === 'localhost'){
	var port = serv.listen(3000);
}
else{
	var port = serv.listen(process.env.PORT);
}

console.log('Server Started on port ' + port.address().port);

SOCKET_LIST = {};
io = require('socket.io')(serv,{upgradeTimeout:36000000});
io.sockets.on('connection',function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	socket.on('signIn',function(data){
		Database.isValidPassword(data,function(res){
			if(res === 3){
				Player.onConnect(socket,data.username);
				// updateLeaderboard();
			}
			if(res === 2){
				for(var i in Player.list){
					if(Player.list[i].username === data.username){
						if(SOCKET_LIST[i]){
							SOCKET_LIST[i].emit('disconnected');
							Player.onDisconnect(SOCKET_LIST[i]);
							delete SOCKET_LIST[i];
						}
					}
				}
			}
			socket.emit('signInResponse',{success:res,username:data.username});
		});
	});
	socket.on('createAccount',function(data){
		var allSpaces = true;
		for(var i = 0;i < data.username.length;i++){
			if(data.username[i] !== ' '){
				allSpaces = false;
			}
		}
		if(allSpaces){
			socket.emit('createAccountResponse',{success:3});
			return;
		}
		if(data.username.includes('--') || data.password.includes('--')){
			socket.emit('createAccountResponse',{success:3});
			return;
		}
		if(data.username.includes(';') || data.password.includes(';')){
			socket.emit('createAccountResponse',{success:3});
			return;
		}
		if(data.username.includes('\'') || data.password.includes('\'')){
			socket.emit('createAccountResponse',{success:3});
			return;
		}
		if(data.username.length > 3 && data.username.length < 41 && data.password.length < 41){
			Database.isUsernameTaken(data,function(res){
				if(res === 0){
					socket.emit('createAccountResponse',{success:0});
				}
				else{
					Database.addUser(data,function(){
						socket.emit('createAccountResponse',{success:1});
					});
				}
			});
		}
		else if(data.username.length > 40 || data.password.length > 40){
			socket.emit('createAccountResponse',{success:4});
			return;
		}
		else{
			socket.emit('createAccountResponse',{success:2});
			return;
		}
	});
	socket.on('deleteAccount',function(data){
		if(data.username === 'sp' || data.username === 'Suvanth' || data.username === 'the-real-tianmu'){
			socket.emit('deleteAccountResponse',{success:0});
			return;
		}
		Database.isValidPassword(data,function(res){
			if(res === 3){
				Database.removeUser(data,function(){

				});
			}
			socket.emit('deleteAccountResponse',{success:res});
		});
	});
	socket.on('changePassword',function(data){
		if(data.username.includes(' ') || data.password.includes(' ') || data.newPassword.includes(' ')){
			socket.emit('changePasswordResponse',{success:4});
			return;
		}
		if(data.username.includes('--') || data.password.includes('--') || data.newPassword.includes('--')){
			socket.emit('changePasswordResponse',{success:4});
			return;
		}
		if(data.username.includes(';') || data.password.includes(';') || data.newPassword.includes(';')){
			socket.emit('changePasswordResponse',{success:4});
			return;
		}
		if(data.username.includes('\'') || data.password.includes('\'') || data.newPassword.includes('\'')){
			socket.emit('changePasswordResponse',{success:4});
			return;
		}
		if(data.username.length > 40 || data.password.length > 40 || data.newPassword.length > 40){
			socket.emit('changePasswordResponse',{success:4});
			return;
		}
		else{
			Database.isValidPassword(data,function(res){
				if(res === 3){
					Database.changePassword(data,function(){

					});
				}
				socket.emit('changePasswordResponse',{success:res});
			});
		}
	});
	socket.on('disconnect',function(){
		socket.emit('disconnected');
		Player.onDisconnect(socket);
		delete SOCKET_LIST[socket.id];
	});
	socket.on('timeout',function(){
		socket.emit('disconnected');
		Player.onDisconnect(socket);
		delete SOCKET_LIST[socket.id];
	});
	socket.on('chatMessage',function(data){
		if(Player.list[socket.id]){
			if(Player.list[socket.id].lastChat > 0){
				Player.list[socket.id].chatWarnings += 1.5;
				if(Player.list[socket.id].chatWarnings > 5){
					socket.emit('addToChat',{
						color:'#ff0000',
						message:'[!] Spamming the chat has been detected on this account. Please lower your chat message rate.',
					});
				}
				if(Player.list[socket.id].chatWarnings > 10){
					socket.emit('disconnected');
					Player.onDisconnect(socket);
					delete SOCKET_LIST[socket.id];
				}
			}
			var notSpace = false;
			for(var i = 0;i < data.length;i++){
				if(data[i] !== ' '){
					notSpace = true;
				}
			}
			if(notSpace){
				addToChat(Player.list[socket.id].textColor,Player.list[socket.id].name + ': ' + data);
				Player.list[socket.id].lastChat = 20;
				Player.list[socket.id].chatWarnings -= 0.5;
			}
		}
		else{
			socket.emit('disconnected');
			Player.onDisconnect(socket);
			delete SOCKET_LIST[socket.id];
		}
	});
});

setInterval(function(){
    var pack = {};
    for(var i in Player.list){
        if(Player.list[i]){
            Player.list[i].update();
			if(Player.list[i].toRemove){
				SOCKET_LIST[i].emit('disconnected');
				Player.onDisconnect(SOCKET_LIST[i]);
				delete SOCKET_LIST[i];
				continue;
			}
            if(!pack[Player.list[i].map]){
                pack[Player.list[i].map] = {player:[],projectile:[],monster:[]};
            }
            var updatePack = Player.list[i].getUpdatePack();
            pack[Player.list[i].map].player.push(updatePack);
        }
    }
    for(var i in Projectile.list){
        if(Projectile.list[i]){
            Projectile.list[i].update();
			if(Projectile.list[i].toRemove){
				delete Projectile.list[i];
				continue;
			}
            if(!pack[Projectile.list[i].map]){
                pack[Projectile.list[i].map] = {player:[],projectile:[],monster:[]};
            }
            var updatePack = Projectile.list[i].getUpdatePack();
            pack[Projectile.list[i].map].projectile.push(updatePack);
        }
    }
    for(var i in Monster.list){
        if(Monster.list[i]){
            Monster.list[i].update();
			if(Monster.list[i].toRemove){
				delete Monster.list[i];
				continue;
			}
            if(!pack[Monster.list[i].map]){
                pack[Monster.list[i].map] = {player:[],projectile:[],monster:[]};
            }
            var updatePack = Monster.list[i].getUpdatePack();
            pack[Monster.list[i].map].monster.push(updatePack);
        }
    }
	for(var i in Player.list){
		for(var j in Projectile.list){
			if(Player.list[i].isColliding(Projectile.list[j]) && i + '' !== Projectile.list[j].parent + ''){
				Player.list[i].onDamage(Projectile.list[j]);
			}
		}
		for(var j in Monster.list){
			if(Player.list[i].isColliding(Monster.list[j])){
				Player.list[i].onDamage(Monster.list[j]);
			}
		}
	}
	for(var i in Monster.list){
		for(var j in Projectile.list){
			if(Monster.list[i].isColliding(Projectile.list[j]) && i + '' !== Projectile.list[j].parent + ''){
				Monster.list[i].onDamage(Projectile.list[j]);
				if(Monster.list[i].toRemove){
					delete Monster.list[i];
					break;
				}
			}
		}
	}
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		if(Player.list[socket.id]){
			var map = Player.list[socket.id].map;
			socket.emit('update',pack[map]);
		}
	}
	for(var i in Spawner.list){
		if(Math.random() < 0.003 && Spawner.list[i].spawned === false){
			spawnMonster(Spawner.list[i],i);
		}
	}
},1000 / 20);

