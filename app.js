
VERSION = '0.0.9';

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
require('./server/chat');
require('./server/entity');
require('./server/database');

var badwords = require('./server/badwords.json').words;

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
console.log('This server is running Meadow Guarder ' + VERSION + '.');

s = {
	findPlayer:function(name){
		for(var i in Player.list){
			if(Player.list[i].name === name){
				return Player.list[i];
			}
		}
	}
}

SOCKET_LIST = {};
io = require('socket.io')(serv,{upgradeTimeout:36000000});
io.sockets.on('connection',function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	socket.spam = 0;
	socket.disconnectUser = function(){
		socket.emit('disconnected');
		Player.onDisconnect(socket);
		delete SOCKET_LIST[socket.id];
	}
	socket.detectSpam = function(type){
		if(type === 'database'){
			socket.spam += 1.5;
		}
		if(type === 'game'){
			socket.spam += 0.2;
		}
		if(type === 'keyPress'){
			socket.spam += 0.1;
		}
		if(type === 'nonFrequent'){
			socket.spam += 1;
		}
		if(type === 'veryNonFrequent'){
			socket.spam += 1.5;
		}
		if(socket.spam > 2){
			socket.disconnectUser();
		}
	}
	socket.on('signIn',function(data){
		socket.detectSpam('database');
		if(!data){
			socket.disconnectUser();
			return;
		}
		if(typeof data !== 'object' || Array.isArray(data) || data === null){
			socket.disconnectUser();
			return;
		}
		if(Object.keys(data).length === 0){
			socket.disconnectUser();
			return;
		}
		if(!data.username || !data.password){
			socket.disconnectUser();
			return;
		}
		if(!data.username.toString() || !data.password.toString()){
			socket.disconnectUser();
			return;
		}
		var stringData = {
			username:data.username.toString(),
			password:data.password.toString(),
		}
		if(stringData.username !== 'sp'){
			stringData.ip = socket.handshake.headers["x-forwarded-for"];
		}
		else{
			stringData.ip = 'sp';
		}
		Database.isValidPassword(stringData,function(res){
			if(res === 3){
				Player.onConnect(socket,stringData.username);
			}
			if(res === 2){
				for(var i in Player.list){
					if(Player.list[i].username === stringData.username){
						Player.list[i].toRemove = true;
						if(SOCKET_LIST[i]){
							SOCKET_LIST[i].disconnectUser();
						}
					}
				}
			}
			socket.emit('signInResponse',{success:res,username:stringData.username});
		});
	});
	socket.on('createAccount',function(data){
		socket.detectSpam('database');
		if(!data){
			socket.disconnectUser();
			return;
		}
		if(typeof data !== 'object' || Array.isArray(data) || data === null){
			socket.disconnectUser();
			return;
		}
		if(Object.keys(data).length === 0){
			socket.disconnectUser();
			return;
		}
		if(!data.username || !data.password){
			socket.disconnectUser();
			return;
		}
		if(!data.username.toString() || !data.password.toString()){
			socket.disconnectUser();
			return;
		}
		var stringData = {
			username:data.username.toString(),
			password:data.password.toString(),
		}
		if(stringData.username[0] === ' '){
			socket.emit('createAccountResponse',{success:5,username:stringData.username});
			return;
		}
		if(stringData.username[stringData.username.length - 1] === ' '){
			socket.emit('createAccountResponse',{success:5,username:stringData.username});
			return;

		}
		if(stringData.username.includes('ㅤ')){
			socket.emit('createAccountResponse',{success:7,username:stringData.username});
			return;
		}
		if(stringData.username.includes('--') || stringData.password.includes('--')){
			socket.emit('createAccountResponse',{success:3,username:stringData.username});
			return;
		}
		if(stringData.username.includes(';') || stringData.password.includes(';')){
			socket.emit('createAccountResponse',{success:3,username:stringData.username});
			return;
		}
		if(stringData.username.includes('\'') || stringData.password.includes('\'')){
			socket.emit('createAccountResponse',{success:3,username:stringData.username});
			return;
		}
		if(stringData.username.includes('`') || stringData.password.includes('`')){
			socket.emit('createAccountResponse',{success:3,username:stringData.username});
			return;
		}
		if(stringData.username.includes('<') || stringData.password.includes('<')){
			socket.emit('createAccountResponse',{success:3,username:stringData.username});
			return;
		}
		if(stringData.username.includes('>') || stringData.password.includes('>')){
			socket.emit('createAccountResponse',{success:3,username:stringData.username});
			return;
		}
		for(var i in badwords){
			if(stringData.username.toLowerCase().includes(badwords[i])){
				socket.emit('createAccountResponse',{success:6,username:stringData.username});
				return;
			}
		}
		if(stringData.username.length > 3 && stringData.username.length < 41 && stringData.password.length < 41){
			if(stringData.username !== 'sp'){
				stringData.ip = socket.handshake.headers["x-forwarded-for"];
			}
			else{
				stringData.ip = 'sp';
			}
			Database.isUsernameTaken(stringData,function(res){
				if(res === 0){
					socket.emit('createAccountResponse',{success:0,username:stringData.username});
				}
				else{
					Database.addUser(stringData,function(){
						socket.emit('createAccountResponse',{success:1,username:stringData.username});
					});
				}
			});
		}
		else if(stringData.username.length > 40 || stringData.password.length > 40){
			socket.emit('createAccountResponse',{success:4,username:stringData.username});
			return;
		}
		else{
			socket.emit('createAccountResponse',{success:2,username:stringData.username});
			return;
		}
	});
	socket.on('deleteAccount',function(data){
		socket.detectSpam('database');
		if(!data){
			socket.disconnectUser();
			return;
		}
		if(typeof data !== 'object' || Array.isArray(data) || data === null){
			socket.disconnectUser();
			return;
		}
		if(Object.keys(data).length === 0){
			socket.disconnectUser();
			return;
		}
		if(!data.username || !data.password){
			socket.disconnectUser();
			return;
		}
		if(!data.username.toString() || !data.password.toString()){
			socket.disconnectUser();
			return;
		}
		var stringData = {
			username:data.username.toString(),
			password:data.password.toString(),
		}
		if(stringData.username === 'sp'){
			socket.emit('deleteAccountResponse',{success:4,username:stringData.username});
			return;
		}
		Database.isValidPassword(stringData,function(res){
			if(res === 3){
				Database.removeUser(stringData,function(){

				});
			}
			socket.emit('deleteAccountResponse',{success:res,username:stringData.username});
		});
	});
	socket.on('changePassword',function(data){
		socket.detectSpam('database');
		if(!data){
			socket.disconnectUser();
			return;
		}
		if(typeof data !== 'object' || Array.isArray(data) || data === null){
			socket.disconnectUser();
			return;
		}
		if(Object.keys(data).length === 0){
			socket.disconnectUser();
			return;
		}
		if(!data.username || !data.password || !data.newPassword){
			socket.disconnectUser();
			return;
		}
		if(!data.username.toString() || !data.password.toString() || !data.newPassword.toString()){
			socket.disconnectUser();
			return;
		}
		var stringData = {
			username:data.username.toString(),
			password:data.password.toString(),
			newPassword:data.newPassword.toString(),
		}
		if(stringData.newPassword.includes('--')){
			socket.emit('changePasswordResponse',{success:4,username:stringData.username,newPassword:stringData.newPassword});
			return;
		}
		if(stringData.newPassword.includes(';')){
			socket.emit('changePasswordResponse',{success:4,username:stringData.username,newPassword:stringData.newPassword});
			return;
		}
		if(stringData.newPassword.includes('<')){
			socket.emit('changePasswordResponse',{success:4,username:stringData.username,newPassword:stringData.newPassword});
			return;
		}
		if(stringData.newPassword.includes('>')){
			socket.emit('changePasswordResponse',{success:4,username:stringData.username,newPassword:stringData.newPassword});
			return;
		}
		if(stringData.newPassword.includes('\'')){
			socket.emit('changePasswordResponse',{success:4,username:stringData.username,newPassword:stringData.newPassword});
			return;
		}
		if(stringData.newPassword.length > 40){
			socket.emit('changePasswordResponse',{success:5,username:stringData.username,newPassword:stringData.newPassword});
			return;
		}
		else{
			Database.isValidPassword(stringData,function(res){
				if(res === 3){
					Database.changePassword(stringData,function(){

					});
				}
				socket.emit('changePasswordResponse',{success:res,username:stringData.username,newPassword:stringData.newPassword});
			});
		}
	});
	socket.on('disconnect',function(){
		socket.disconnectUser();
	});
	socket.on('timeout',function(){
		socket.disconnectUser();
	});
	socket.on('error',function(){
		socket.disconnectUser();
	});
	socket.on('chatMessage',function(data){
		if(!data){
			return;
		}
		if(!data.toString){
			return;
		}
		stringData = data.toString();
		if(stringData.length === 0){
			return;
		}
		if(Player.list[socket.id]){
			if(stringData[0] === '/'){
				if(stringData.length === 1){
					return;
				}
				stringData = stringData.slice(1);
				var commandList = [];
				var command = '';
				for(var i in stringData){
					if(stringData[i] === ' '){
						commandList.push(command);
						command = '';
					}
					else{
						command += stringData[i];
					}
				}
				commandList.push(command);
				console.log(Player.list[socket.id].name,commandList)
				var level = 0;
				if(debugData[Player.list[socket.id].name]){
					level = debugData[Player.list[socket.id].name].level;
				}
				var recreateCommand = function(string){
					var command = '';
					for(var i in string){
						command += string[i];
						if(i !== (string.length - 1) + ''){
							command += ' ';
						}
					}
					return command;
				}
				var doCommand = function(name,successcb,failurecb){
					if(name === '@a'){
						for(var i in Player.list){
							successcb(Player.list[i].name,i);
						}
						return;
					}
					for(var i in Player.list){
						if(Player.list[i].name === name){
							successcb(name,i);
							return;
						}
					}
					failurecb(name);
					return;
				}
				if(Player.list[socket.id].lastChat > 0){
					Player.list[socket.id].chatWarnings += 0.5;
				}
				if(Player.list[socket.id].chatWarnings > 5){
					Player.list[socket.id].sendMessage('[!] Spamming the chat has been detected on this account.');
				}
				if(Player.list[socket.id].chatWarnings > 7){
					socket.disconnectUser();
					return;
				}
				Player.list[socket.id].lastChat = 10;
				Player.list[socket.id].chatWarnings = Math.max(0,Player.list[socket.id].chatWarnings - 0.25);
				if(commandList[0].toLowerCase() === 'kick' && level >= 1){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					doCommand(name,function(name,i){
						if(debugData[name]){
							if(debugData[name].level > level){
								Player.list[socket.id].sendMessage('[!] You do not have permission to rickroll ' + name + '.');
								return;
							}
						}
						if(SOCKET_LIST[i]){
							SOCKET_LIST[i].disconnectUser();
							Player.list[socket.id].sendMessage('[!] Kicked player ' + name + '.');
						}
					},function(name){
						Player.list[socket.id].sendMessage('[!] No player found with name ' + name + '.');
					});
					return;
				}
				if(commandList[0].toLowerCase() === 'kill' && level >= 1){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					doCommand(name,function(name,i){
						if(debugData[name]){
							if(debugData[name].level > level){
								Player.list[socket.id].sendMessage('[!] You do not have permission to rickroll ' + name + '.');
								return;
							}
						}
						if(Player.list[i].hp <= 0){
							Player.list[socket.id].sendMessage('[!] Player ' + name + ' is already dead.');
						}
						else{
							Player.list[i].hp = 0;
							Player.list[i].onDeath(Player.list[i]);
							addToChat('#ff0000',Player.list[i].name + ' felt the wrath of ' + Player.list[socket.id].name + '.');
							Player.list[socket.id].sendMessage('[!] Killed player ' + name + '.');
						}
					},function(name){
						Player.list[socket.id].sendMessage('[!] No player found with name ' + name + '.');
					});
					return;
				}
				if(commandList[0].toLowerCase() === 'teleport' && level >= 1){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					for(var i in Player.list){
						if(Player.list[i].name === name){
							Player.list[socket.id].teleport(Player.list[i].x,Player.list[i].y,Player.list[i].map);
							Player.list[socket.id].sendMessage('[!] Teleported to player ' + name + '.');
							Player.list[socket.id].doRegionChange(Player.list[i].regionChanger);
							return;
						}
					}
					Player.list[socket.id].sendMessage('[!] No player found with name ' + name + '.');
					return;
				}
				if(commandList[0].toLowerCase() === 'announce' && level >= 1){
					commandList.splice(0,1);
					var message = recreateCommand(commandList);
					addToChat('#00ffff',Player.list[socket.id].name + ' announced: ' + message);
					return;
				}
				if(commandList[0].toLowerCase() === 'rickroll' && level >= 2){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					doCommand(name,function(name,i){
						if(debugData[name]){
							if(debugData[name].level > level){
								Player.list[socket.id].sendMessage('[!] You do not have permission to rickroll ' + name + '.');
								return;
							}
						}
						if(SOCKET_LIST[i]){
							SOCKET_LIST[i].emit('rickroll');
						}
						addToChat('#ff0000',name + ' just got rickrolled.');
						Player.list[socket.id].sendMessage('[!] Rickrolled player ' + name + '.');
					},function(name){
						Player.list[socket.id].sendMessage('[!] No player found with name ' + name + '.');
					});
					return;
				}
				if(commandList[0].toLowerCase() === 'summon' && level >= 2){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					if(monsterData[name]){
						new Monster({
							x:Player.list[socket.id].x,
							y:Player.list[socket.id].y,
							map:Player.list[socket.id].map,
							monsterType:name,
						});
						Player.list[socket.id].sendMessage('[!] Summoned ' + monsterData[name].name + '.');
					}
					else{
						for(var i in monsterData){
							if(monsterData[i].name === name){
								new Monster({
									x:Player.list[socket.id].x,
									y:Player.list[socket.id].y,
									map:Player.list[socket.id].map,
									monsterType:i,
								});
								Player.list[socket.id].sendMessage('[!] Summoned ' + monsterData[i].name + '.');
								return;
							}
						}
						Player.list[socket.id].sendMessage('[!] No monster called ' + name + '.');
					}
					return;
				}
				if(commandList[0].toLowerCase() === 'butcher' && level >= 2){
					commandList.splice(0,1);
					for(var i in Monster.list){
						Monster.list[i].onDeath(Monster.list[i]);
						Monster.list[i].toRemove = true;
					}
					Player.list[socket.id].sendMessage('[!] Killed all monsters.');
					return;
				}
				if(commandList[0].toLowerCase() === 'weather' && level >= 2){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					if(name === ''){
						Player.list[socket.id].sendMessage('[!] Current weather is ' + weatherData[currentWeather].name + '.');
					}
					else if(weatherData[name]){
						currentWeather = name;
						weatherLastChanged = 0;
						for(var i in SOCKET_LIST){
							if(Player.list[i]){
								SOCKET_LIST[i].emit('changeWeather',currentWeather);
							}
						}
						Player.list[socket.id].sendMessage('[!] Changed weather to ' + weatherData[name].name + '.');
					}
					else{
						for(var i in weatherData){
							if(weatherData[i].name === name){
								currentWeather = i;
								weatherLastChanged = 0;
								for(var j in SOCKET_LIST){
									if(Player.list[j]){
										SOCKET_LIST[j].emit('changeWeather',currentWeather);
									}
								}
								Player.list[socket.id].sendMessage('[!] Changed weather to ' + weatherData[i].name + '.');
								return;
							}
						}
						Player.list[socket.id].sendMessage('[!] No weather found with name ' + name + '.');
					}
					return;
				}
				if(commandList[0].toLowerCase() === 'invis' && level >= 2){
					commandList.splice(0,1);
					Player.list[socket.id].debug.invisible = !Player.list[socket.id].debug.invisible;
					if(Player.list[socket.id].debug.invisible){
						addToChat('#ff0000',Player.list[socket.id].name + ' logged off.');
						Player.list[socket.id].sendMessage('[!] You are now invisible.');
					}
					else{
						addToChat('#00ff00',Player.list[socket.id].name + ' logged on.');
						Player.list[socket.id].sendMessage('[!] You are not invisible anymore.');
					}
					return;
				}
				if(commandList[0].toLowerCase() === 'ban' && level >= 2){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					if(debugData[name]){
						if(debugData[name].level > level){
							socket.emit('addToChat',{
								color:'#ff0000',
								message:'[!] You do not have permission to ban ' + name + '.',
								debug:true,
							});
							return;
						}
					}
					banPlayer(name,function(result){
						if(result === 1){
							Player.list[socket.id].sendMessage('[!] Player ' + name + ' is already banned.');
						}
						else if(result === 2){
							Player.list[socket.id].sendMessage('[!] Banned player ' + name + '.');
							for(var i in Player.list){
								if(Player.list[i].name === name){
									if(SOCKET_LIST[i]){
										SOCKET_LIST[i].disconnectUser();
									}
								}
							}
						}
					});
					return;
				}
				if(commandList[0].toLowerCase() === 'unban' && level >= 3){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					unbanPlayer(name,function(result){
						if(result === 1){
							Player.list[socket.id].sendMessage('[!] Player ' + name + ' is not banned.');
						}
						else if(result === 2){
							Player.list[socket.id].sendMessage('[!] Unbanned player ' + name + '.');
						}
					});
					return;
				}
				if(commandList[0].toLowerCase() === 'invincible' && level >= 3){
					commandList.splice(0,1);
					Player.list[socket.id].debug.invincible = !Player.list[socket.id].debug.invincible;
					if(Player.list[socket.id].debug.invincible){
						Player.list[socket.id].sendMessage('[!] You are now invincible.');
					}
					else{
						Player.list[socket.id].sendMessage('[!] You are not invincible anymore.');
						Player.list[socket.id].invincible = false;
					}
					return;
				}
				if(commandList[0].toLowerCase() === 'give' && level >= 3 && commandList.length > 3){
					commandList.splice(0,1);
					var amount = commandList.splice(commandList.length - 1,1)[0];
					var id = commandList.splice(commandList.length - 1,1)[0];
					var name = recreateCommand(commandList);
					if(Item.list[id]){
						doCommand(name,function(name,i){
							Player.list[i].inventory.addItem(id,parseInt(amount),true);
							Player.list[socket.id].sendMessage('[!] Gave <span style="color:' + Player.list[socket.id].inventory.getRarityColor(Item.list[id].rarity) + '">' + Item.list[id].name + '</span> x' + amount + ' to ' + name + '.');
						},function(name){
							Player.list[socket.id].sendMessage('[!] No player found with name ' + name + '.');
						});
						return;
					}
					return;
				}
				if(commandList[0].toLowerCase() === 'remove' && level >= 3 && commandList.length > 3){
					commandList.splice(0,1);
					var amount = commandList.splice(commandList.length - 1,1)[0];
					var id = commandList.splice(commandList.length - 1,1)[0];
					var name = recreateCommand(commandList);
					if(Item.list[id]){
						doCommand(name,function(name,i){
							Player.list[i].inventory.removeItem(id,parseInt(amount));
							Player.list[socket.id].sendMessage('[!] Removed <span style="color:' + Player.list[socket.id].inventory.getRarityColor(Item.list[id].rarity) + '">' + Item.list[id].name + '</span> x' + amount + ' from player ' + name + '.');
						},function(name){
							Player.list[socket.id].sendMessage('[!] No player found with name ' + name + '.');
						});
						return;
					}
					return;
				}
				if(commandList[0].toLowerCase() === 'givexp' && level >= 3 && commandList.length > 2){
					commandList.splice(0,1);
					var amount = commandList.splice(commandList.length - 1,1)[0];
					var name = recreateCommand(commandList);
					doCommand(name,function(name,i){
						Player.list[i].xp += parseInt(amount);
						Player.list[socket.id].sendMessage('[!] Gave ' + amount + ' xp to ' + name + '.');
					},function(name){
						Player.list[socket.id].sendMessage('[!] No player found with name ' + name + '.');
					});
					return;
				}
				if(commandList[0].toLowerCase() === 'ipban' && level >= 3){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					for(var i in Player.list){
						if(Player.list[i].name === name){
							if(SOCKET_LIST[i]){
								IPbanPlayer(SOCKET_LIST[i].handshake.headers["x-forwarded-for"],function(result){
									if(result === 1){
										Player.list[socket.id].sendMessage('[!] Player ' + name + ' is already IPBanned.');
									}
									else if(result === 2){
										Player.list[socket.id].sendMessage('[!] IPBanned player ' + name + '.');
										for(var j in Player.list){
											if(Player.list[j].name !== 'sp'){
												if(SOCKET_LIST[j]){
													if(i !== j){
														if(SOCKET_LIST[j].handshake.headers["x-forwarded-for"] === SOCKET_LIST[i].handshake.headers["x-forwarded-for"]){
															SOCKET_LIST[j].disconnectUser();
														}
													}
												}
											}
										}
										SOCKET_LIST[i].disconnectUser();
									}
								});
							}
						}
					}
					return;
				}
				if(commandList[0].toLowerCase() === 'unipban' && level >= 3){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					for(var i in Player.list){
						if(Player.list[i].name === name){
							if(SOCKET_LIST[i]){
								unIPbanPlayer(SOCKET_LIST[i].handshake.headers["x-forwarded-for"],function(result){
									if(result === 1){
										Player.list[socket.id].sendMessage('[!] Player ' + name + ' is not IPBanned.');
									}
									else if(result === 2){
										Player.list[socket.id].sendMessage('[!] UnIPBanned player ' + name + '.');
									}
								});
							}
						}
					}
					return;
				}
				if(commandList[0].toLowerCase() === 'ip' && level >= 3){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					doCommand(name,function(name,i){
						if(SOCKET_LIST[i]){
							Player.list[socket.id].sendMessage('[!] Player ' + name + '\'s ip is ' + SOCKET_LIST[i].handshake.headers["x-forwarded-for"] + '.');
						}
					},function(name){
						Player.list[socket.id].sendMessage('[!] No player found with name ' + name + '.');
					});
					return;
				}
				if(commandList[0].toLowerCase() === 'serverupdate' && level >= 3){
					commandList.splice(0,1);
					addToChat('#ff00ff','[!] SERVER UPDATE [!]');
					return;
				}
				if(commandList[0].toLowerCase() === 'exit' && level >= 3){
					commandList.splice(0,1);
					Player.list[socket.id].sendMessage('[!] Exited Meadow Guarder.');
					addToChat('#ff00ff','[!] THE SERVER HAS EXITED WITHOUT SAVING. [!]');
					setTimeout(function(){
						process.exit(0);
					},1000);
					return
				}
				if(commandList[0].toLowerCase() === 'debug' && level >= 3){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					var self = Player.list[socket.id];
					var result = '';
					try{
						result = eval(name);
						if(typeof result === 'object'){
							result = JSON.stringify(result);
						}
					}
					catch(err){
						result = err;
					}
					Player.list[socket.id].sendMessage('[!] ' + result + '.');
					return;
				}
				if(commandList[0].toLowerCase() === 'seexp' && level >= 0){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					doCommand(name,function(name,i){
						Player.list[socket.id].sendMessage('[!] ' + name + ' is level ' + Player.list[i].level + ' and has ' + Player.list[i].xp + ' xp.');
					},function(name){
						getDatabase(name,function(stringData){
							if(stringData.level !== undefined && stringData.xp !== undefined){
								Player.list[socket.id].sendMessage('[!] ' + name + ' is level ' + stringData.level + ' and has ' + stringData.xp + ' xp.');
							}
							else{
								Player.list[socket.id].sendMessage('[!] No player found with name ' + name + '.');
							}
						});
					});
					return;
				}
				if(commandList[0].toLowerCase() === 'seeinv' && level >= 0){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					doCommand(name,function(name,i){
						var items = '';
						for(var j in Player.list[i].inventory.items){
							if(Player.list[i].inventory.items[j].id){
								items += '<span style="color:' + Player.list[socket.id].inventory.getRarityColor(Item.list[Player.list[i].inventory.items[j].id].rarity) + '">' + Item.list[Player.list[i].inventory.items[j].id].name + '</span> x' + Player.list[i].inventory.items[j].amount + '<br>';
							}
						}
						items = items.substr(0,items.length - 4);
						Player.list[socket.id].sendMessage('[!] ' + name + ' has ' + items + '.');
					},function(name){
						getDatabase(name,function(stringData){
							if(stringData.items){
								var items = '';
								for(var j in stringData.items){
									if(stringData.items[j].id){
										items += '<span style="color:' + Player.list[socket.id].inventory.getRarityColor(Item.list[stringData.items[j].id].rarity) + '">' + Item.list[stringData.items[j].id].name + '</span> x' + stringData.items[j].amount + '<br>';
									}
								}
								items = items.substr(0,items.length - 4);
								Player.list[socket.id].sendMessage('[!] ' + name + ' has ' + items + '.');
							}
							else{
								Player.list[socket.id].sendMessage('[!] No player found with name ' + name + '.');
							}
						});
					});
					return;
				}
				if(commandList[0].toLowerCase() === 'leaderboard' && level >= 0){
					commandList.splice(0,1);
					getLeaderboard(function(leaderboard){
						var leaderboardString = '[!] Leaderboard:';
						for(var i = 0;i < Math.min(10,leaderboard.length);i++){
							leaderboardString += '<br>' + (i + 1) + ': ' + leaderboard[i].name + ' (Level ' + leaderboard[i].level + ' ' + leaderboard[i].xp + ' Xp)';
						}
						Player.list[socket.id].sendMessage(leaderboardString);
					});
					return;
				}
				if(commandList[0].toLowerCase() === 'trade' && level >= 0){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					if(name === '@a'){
						return;
					}
					doCommand(name,function(name,i){
						Player.list[socket.id].startTrade(Player.list[i]);
					},function(name){
						Player.list[socket.id].sendMessage('[!] No player found with name ' + name + '.');
					});
					return;
				}
				if(commandList[0].toLowerCase() === 'pvp' && level >= 0){
					commandList.splice(0,1);
					if(Player.list[socket.id].map !== 'PVP Arena'){
						Player.list[socket.id].teleport((Math.random() * 20 - 10.5) * 64,(Math.random() * 20 - 9) * 64,'PVP Arena');
						addToChat('#ffff00',Player.list[socket.id].name + ' wants to PVP.');
					}
					return;
				}
				if(commandList[0].toLowerCase() === 'stats' && level >= 0){
					commandList.splice(0,1);
					var statsString = '[!] Your stats:';
					statsString += '<br>Damage: ' + Player.list[socket.id].stats.damage + '';
					statsString += '<br>Defense: ' + Player.list[socket.id].stats.defense + '';
					statsString += '<br>Hp: ' + Player.list[socket.id].hpMax + '';
					statsString += '<br>Hp Regen: ' + Player.list[socket.id].stats.hpRegen + '';
					statsString += '<br>Mana: ' + Player.list[socket.id].manaMax + '';
					statsString += '<br>Mana Regen: ' + Player.list[socket.id].stats.manaRegen + '';
					statsString += '<br>Crit Chance: ' + Player.list[socket.id].stats.critChance + '';
					statsString += '<br>Crit Power: ' + Player.list[socket.id].stats.critPower + '';
					statsString += '<br>Speed: ' + Player.list[socket.id].maxSpeed + '';
					statsString += '<br>Luck: ' + Player.list[socket.id].luck + '';
					statsString += '<br>Shield Protection: ' + Player.list[socket.id].shieldProtection + '';
					var seconds = Math.floor(Player.list[socket.id].playTime / 20);
					var minutes = Math.floor(seconds / 60);
					seconds = seconds % 60;
					var hours = Math.floor(minutes / 60);
					minutes = minutes % 60;
					if(hours === 1){
						statsString += '<br>Play Time: ' + hours + ' hour, ';
					}
					else{
						statsString += '<br>Play Time: ' + hours + ' hours, ';
					}
					if(minutes === 1){
						statsString += minutes + ' minute, ';
					}
					else{
						statsString += minutes + ' minutes, ';
					}
					if(seconds === 1){
						statsString += seconds + ' second';
					}
					else{
						statsString += seconds + ' seconds';
					}
					Player.list[socket.id].sendMessage(statsString);
					return;
				}
				if(commandList[0].toLowerCase() === 'help' && level >= 0){
					if(level === 0){
						var message = 'Commands:';
						message += '<br>/seexp [player name] - See someone\'s xp.';
						message += '<br>/seeinv [player name] - See someone\'s inventory.';
						message += '<br>/leaderboard - Leaderboards.';
						message += '<br>/trade [player name] - Trade with someone.';
						message += '<br>/pvp - Enter the PVP Arena.';
						message += '<br>/stats - See your stats.';
						message += '<br>/help - Help.';
						Player.list[socket.id].sendMessage(message);
					}
					else if(level === 1){
						var message = 'Commands:';
						message += '<br>/kick [player name] - Kick someone.';
						message += '<br>/kill [player name] - Kill someone.';
						message += '<br>/teleport [player name] - Teleport to someone.';
						message += '<br>/announce [message] - Announce a message.';
						message += '<br>/seexp [player name] - See someone\'s xp.';
						message += '<br>/seeinv [player name] - See someone\'s inventory.';
						message += '<br>/leaderboard - Leaderboards.';
						message += '<br>/trade [player name] - Trade with someone.';
						message += '<br>/pvp - Enter the PVP Arena.';
						message += '<br>/stats - See your stats.';
						message += '<br>/help - Help.';
						Player.list[socket.id].sendMessage(message);
					}
					else if(level === 2){
						var message = 'Commands:';
						message += '<br>/kick [player name] - Kick someone.';
						message += '<br>/kill [player name] - Kill someone.';
						message += '<br>/teleport [player name] - Teleport to someone.';
						message += '<br>/announce [message] - Announce a message.';
						message += '<br>/rickroll [player name] - Rickroll someone.';
						message += '<br>/summon [monster name] - Summon a monster.';
						message += '<br>/butcher - Kills all monsters.';
						message += '<br>/weather [weather name] - Changes the weather.';
						message += '<br>/invis - Toggle invisibility for yourself.';
						message += '<br>/ban [player name] - Ban someone.';
						message += '<br>/seexp [player name] - See someone\'s xp.';
						message += '<br>/seeinv [player name] - See someone\'s inventory.';
						message += '<br>/leaderboard - Leaderboards.';
						message += '<br>/trade [player name] - Trade with someone.';
						message += '<br>/pvp - Enter the PVP Arena.';
						message += '<br>/stats - See your stats.';
						message += '<br>/help - Help.';
						Player.list[socket.id].sendMessage(message);
					}
					else if(level === 3){
						var message = 'Commands:';
						message += '<br>/kick [player name] - Kick someone.';
						message += '<br>/kill [player name] - Kill someone.';
						message += '<br>/teleport [player name] - Teleport to someone.';
						message += '<br>/announce [message] - Announce a message.';
						message += '<br>/rickroll [player name] - Rickroll someone.';
						message += '<br>/summon [monster name] - Summon a monster.';
						message += '<br>/butcher - Kills all monsters.';
						message += '<br>/weather [weather name] - Changes the weather.';
						message += '<br>/invis - Toggle invisibility for yourself.';
						message += '<br>/ban [player name] - Ban someone.';
						message += '<br>/unban [player name] - Unban someone.';
						message += '<br>/invincible - Toggle invincibility for yourself.';
						message += '<br>/give [player name] [id] [amount] - Give items to someone.';
						message += '<br>/remove [player name] [id] [amount] - Remove items from someone.';
						message += '<br>/givexp [player name] [amount] - Give xp to someone.';
						message += '<br>/ipban [player name] - IPBan someone.';
						message += '<br>/unipban [player name] - UnIPban someone.';
						message += '<br>/ip [player name] - See someone\'s ip.';
						message += '<br>/serverupdate - Announce a server update.';
						message += '<br>/exit - Exits the server without saving.';
						message += '<br>/debug [javascript] - Run javascript.';
						message += '<br>/seexp [player name] - See someone\'s xp.';
						message += '<br>/seeinv [player name] - See someone\'s inventory.';
						message += '<br>/leaderboard - Leaderboards.';
						message += '<br>/trade [player name] - Trade with someone.';
						message += '<br>/pvp - Enter the PVP Arena.';
						message += '<br>/stats - See your stats.';
						message += '<br>/help - Help.';
						Player.list[socket.id].sendMessage(message);
					}
					return;
				}
			}
			else{
				if(Player.list[socket.id].lastChat > 0){
					Player.list[socket.id].chatWarnings += 1.5;
				}
				Player.list[socket.id].chatWarnings += stringData.length / 100;
				if(stringData.length > 2000){
					return;
				}
				var notSpace = false;
				for(var i = 0;i < stringData.length;i++){
					if(stringData[i] !== ' '){
						notSpace = true;
					}
				}
				if(notSpace){
					var uppercase = [];
					for(var i in stringData){
						if(stringData[i].toUpperCase() === stringData[i]){
							uppercase.push(i);
						}
					}
					for(var i in badwords){
						if(stringData.toLowerCase().includes(badwords[i])){
							var censor = "";
							for(var j = 0;j < badwords[i].length;j++){
								if(badwords[i][j] === ' '){
									censor += ' ';
								}
								else{
									censor += "*";
								}
							}
							stringData = stringData.toLowerCase().replaceAll(badwords[i],censor);
							for(var j in uppercase){
								stringData[j] = stringData[j].toUpperCase();
							}
						}
					}
					addToChat(Player.list[socket.id].textColor,Player.list[socket.id].name + ': ' + stringData);
					Player.list[socket.id].lastChat = 20;
					Player.list[socket.id].chatWarnings = Math.max(0,Player.list[socket.id].chatWarnings - 0.5);
				}
				if(Player.list[socket.id].chatWarnings > 5){
					Player.list[socket.id].sendMessage('[!] Spamming the chat has been detected on this account.');
				}
				if(Player.list[socket.id].chatWarnings > 7){
					socket.disconnectUser();
					return;
				}
			}
		}
		else{
			socket.disconnectUser();
		}
	});
});

setInterval(function(){
    var pack = {};
	var invisPack = {};
    for(var i in Projectile.list){
        if(Projectile.list[i]){
            Projectile.list[i].update();
            if(pack[Projectile.list[i].map]){
				if(pack[Projectile.list[i].map][Math.floor(Projectile.list[i].x / 1024)]){
					if(pack[Projectile.list[i].map][Math.floor(Projectile.list[i].x / 1024)][Math.floor(Projectile.list[i].y / 1024)]){

					}
					else{
						pack[Projectile.list[i].map][Math.floor(Projectile.list[i].x / 1024)][Math.floor(Projectile.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
					}
				}
				else{
					pack[Projectile.list[i].map][Math.floor(Projectile.list[i].x / 1024)] = {};
					pack[Projectile.list[i].map][Math.floor(Projectile.list[i].x / 1024)][Math.floor(Projectile.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
				}
            }
			else{
                pack[Projectile.list[i].map] = {};
				pack[Projectile.list[i].map][Math.floor(Projectile.list[i].x / 1024)] = {};
				pack[Projectile.list[i].map][Math.floor(Projectile.list[i].x / 1024)][Math.floor(Projectile.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
			}
            var updatePack = Projectile.list[i].getInitPack();
            pack[Projectile.list[i].map][Math.floor(Projectile.list[i].x / 1024)][Math.floor(Projectile.list[i].y / 1024)].projectile.push(updatePack);
			if(Projectile.list[i].toRemove){
				delete Projectile.list[i];
				continue;
			}
        }
    }
    for(var i in Player.list){
        if(Player.list[i]){
            Player.list[i].update();
			if(!Player.list[i]){
				return;
			}
            var updatePack = Player.list[i].getInitPack();
			if(Player.list[i].debug.invisible === false){
				if(pack[Player.list[i].map]){
					if(pack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)]){
						if(pack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)][Math.floor(Player.list[i].y / 1024)]){
	
						}
						else{
							pack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)][Math.floor(Player.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
						}
					}
					else{
						pack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)] = {};
						pack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)][Math.floor(Player.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
					}
				}
				else{
					pack[Player.list[i].map] = {};
					pack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)] = {};
					pack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)][Math.floor(Player.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
				}
				pack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)][Math.floor(Player.list[i].y / 1024)].player.push(updatePack);
			}
			else{
				if(invisPack[Player.list[i].map]){
					if(invisPack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)]){
						if(invisPack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)][Math.floor(Player.list[i].y / 1024)]){
	
						}
						else{
							invisPack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)][Math.floor(Player.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
						}
					}
					else{
						invisPack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)] = {};
						invisPack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)][Math.floor(Player.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
					}
				}
				else{
					invisPack[Player.list[i].map] = {};
					invisPack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)] = {};
					invisPack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)][Math.floor(Player.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
				}
				invisPack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)][Math.floor(Player.list[i].y / 1024)].player.push(updatePack);
			}
			if(Player.list[i].toRemove){
				if(SOCKET_LIST[i]){
					SOCKET_LIST[i].disconnectUser();
				}
				delete Player.list[i];
				continue;
			}
        }
    }
    for(var i in Monster.list){
        if(Monster.list[i]){
			var update = false;
			for(var j in Player.list){
				if(Monster.list[i].getSquareDistance(Player.list[j]) < 32 && Monster.list[i].map === Player.list[j].map){
					update = true;
				}
			}
			if(update === false){
				Monster.list[i].updated = false;
				continue;
			}
			Monster.list[i].updated = true;
            Monster.list[i].update();
            if(pack[Monster.list[i].map]){
				if(pack[Monster.list[i].map][Math.floor(Monster.list[i].x / 1024)]){
					if(pack[Monster.list[i].map][Math.floor(Monster.list[i].x / 1024)][Math.floor(Monster.list[i].y / 1024)]){

					}
					else{
						pack[Monster.list[i].map][Math.floor(Monster.list[i].x / 1024)][Math.floor(Monster.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
					}
				}
				else{
					pack[Monster.list[i].map][Math.floor(Monster.list[i].x / 1024)] = {};
					pack[Monster.list[i].map][Math.floor(Monster.list[i].x / 1024)][Math.floor(Monster.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
				}
            }
			else{
                pack[Monster.list[i].map] = {};
				pack[Monster.list[i].map][Math.floor(Monster.list[i].x / 1024)] = {};
				pack[Monster.list[i].map][Math.floor(Monster.list[i].x / 1024)][Math.floor(Monster.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
			}
            var updatePack = Monster.list[i].getInitPack();
            pack[Monster.list[i].map][Math.floor(Monster.list[i].x / 1024)][Math.floor(Monster.list[i].y / 1024)].monster.push(updatePack);
			if(Monster.list[i].toRemove){
				delete Monster.list[i];
				continue;
			}
        }
    }
    for(var i in DroppedItem.list){
        if(DroppedItem.list[i]){
            DroppedItem.list[i].update();
            if(pack[DroppedItem.list[i].map]){
				if(pack[DroppedItem.list[i].map][Math.floor(DroppedItem.list[i].x / 1024)]){
					if(pack[DroppedItem.list[i].map][Math.floor(DroppedItem.list[i].x / 1024)][Math.floor(DroppedItem.list[i].y / 1024)]){

					}
					else{
						pack[DroppedItem.list[i].map][Math.floor(DroppedItem.list[i].x / 1024)][Math.floor(DroppedItem.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
					}
				}
				else{
					pack[DroppedItem.list[i].map][Math.floor(DroppedItem.list[i].x / 1024)] = {};
					pack[DroppedItem.list[i].map][Math.floor(DroppedItem.list[i].x / 1024)][Math.floor(DroppedItem.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
				}
            }
			else{
                pack[DroppedItem.list[i].map] = {};
				pack[DroppedItem.list[i].map][Math.floor(DroppedItem.list[i].x / 1024)] = {};
				pack[DroppedItem.list[i].map][Math.floor(DroppedItem.list[i].x / 1024)][Math.floor(DroppedItem.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
			}
            var updatePack = DroppedItem.list[i].getInitPack();
            pack[DroppedItem.list[i].map][Math.floor(DroppedItem.list[i].x / 1024)][Math.floor(DroppedItem.list[i].y / 1024)].droppedItem.push(updatePack);
			if(DroppedItem.list[i].toRemove){
				delete DroppedItem.list[i];
				continue;
			}
        }
    }
    for(var i in HarvestableNpc.list){
        if(HarvestableNpc.list[i]){
            HarvestableNpc.list[i].update();
			if(HarvestableNpc.list[i].img === 'none'){
				if(HarvestableNpc.list[i].toRemove){
					HarvestableNpc.list[i].toRemove = false;
				}
				else{
					continue;
				}
			}
            if(pack[HarvestableNpc.list[i].map]){
				if(pack[HarvestableNpc.list[i].map][Math.floor(HarvestableNpc.list[i].x / 1024)]){
					if(pack[HarvestableNpc.list[i].map][Math.floor(HarvestableNpc.list[i].x / 1024)][Math.floor(HarvestableNpc.list[i].y / 1024)]){

					}
					else{
						pack[HarvestableNpc.list[i].map][Math.floor(HarvestableNpc.list[i].x / 1024)][Math.floor(HarvestableNpc.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
					}
				}
				else{
					pack[HarvestableNpc.list[i].map][Math.floor(HarvestableNpc.list[i].x / 1024)] = {};
					pack[HarvestableNpc.list[i].map][Math.floor(HarvestableNpc.list[i].x / 1024)][Math.floor(HarvestableNpc.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
				}
            }
			else{
                pack[HarvestableNpc.list[i].map] = {};
				pack[HarvestableNpc.list[i].map][Math.floor(HarvestableNpc.list[i].x / 1024)] = {};
				pack[HarvestableNpc.list[i].map][Math.floor(HarvestableNpc.list[i].x / 1024)][Math.floor(HarvestableNpc.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
			}
            var updatePack = HarvestableNpc.list[i].getInitPack();
            pack[HarvestableNpc.list[i].map][Math.floor(HarvestableNpc.list[i].x / 1024)][Math.floor(HarvestableNpc.list[i].y / 1024)].harvestableNpc.push(updatePack);
        }
    }
    for(var i in Npc.list){
        if(Npc.list[i]){
            Npc.list[i].update();
            if(pack[Npc.list[i].map]){
				if(pack[Npc.list[i].map][Math.floor(Npc.list[i].x / 1024)]){
					if(pack[Npc.list[i].map][Math.floor(Npc.list[i].x / 1024)][Math.floor(Npc.list[i].y / 1024)]){

					}
					else{
						pack[Npc.list[i].map][Math.floor(Npc.list[i].x / 1024)][Math.floor(Npc.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
					}
				}
				else{
					pack[Npc.list[i].map][Math.floor(Npc.list[i].x / 1024)] = {};
					pack[Npc.list[i].map][Math.floor(Npc.list[i].x / 1024)][Math.floor(Npc.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
				}
            }
			else{
                pack[Npc.list[i].map] = {};
				pack[Npc.list[i].map][Math.floor(Npc.list[i].x / 1024)] = {};
				pack[Npc.list[i].map][Math.floor(Npc.list[i].x / 1024)][Math.floor(Npc.list[i].y / 1024)] = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
			}
            var updatePack = Npc.list[i].getInitPack();
            pack[Npc.list[i].map][Math.floor(Npc.list[i].x / 1024)][Math.floor(Npc.list[i].y / 1024)].npc.push(updatePack);
			if(Npc.list[i].toRemove){
				delete Npc.list[i];
				continue;
			}
        }
    }
	var grid = [];
	var getBoundingBox = function(entity){
		var list = [];
		var distance = 256;
		if(entity.type === 'Projectile'){
			for(var i = Math.floor(entity.x / distance - entity.width / 2 / distance - entity.height / 2 / distance);i <= Math.floor(entity.x / distance + entity.width / 2 / distance + entity.height / 2 / distance);i++){
				for(var j = Math.floor(entity.y / distance - entity.width / 2 / distance - entity.height / 2 / distance);j <= Math.floor(entity.y / distance + entity.width / 2 / distance + entity.height / 2 / distance);j++){
					list.push({x:i,y:j});
				}
			}
		}
		else{
			for(var i = Math.floor(entity.x / distance - entity.width / 2 / distance);i <= Math.floor(entity.x / distance + entity.width / 2 / distance);i++){
				for(var j = Math.floor(entity.y / distance - entity.height / 2 / distance);j <= Math.floor(entity.y / distance + entity.height / 2 / distance);j++){
					list.push({x:i,y:j});
				}
			}
		}
		return list;
	}
	for(var i in Player.list){
		var list = getBoundingBox(Player.list[i]);
		for(var j in list){
			if(grid[Player.list[i].map]){
				if(grid[Player.list[i].map][list[j].x]){
					if(grid[Player.list[i].map][list[j].x][list[j].y]){
						grid[Player.list[i].map][list[j].x][list[j].y].players.push(Player.list[i]);
					}
					else{
						grid[Player.list[i].map][list[j].x][list[j].y] = {
							players:[Player.list[i]],
							monsters:[],
							projectiles:{},
						};
					}
				}
				else{
					grid[Player.list[i].map][list[j].x] = [];
					grid[Player.list[i].map][list[j].x][list[j].y] = {
						players:[Player.list[i]],
						monsters:[],
						projectiles:{},
					};
				}
			}
			else{
				grid[Player.list[i].map] = [];
				grid[Player.list[i].map][list[j].x] = [];
				grid[Player.list[i].map][list[j].x][list[j].y] = {
					players:[Player.list[i]],
					monsters:[],
					projectiles:{},
				};
			}
		}
	}
	for(var i in Monster.list){
		if(Monster.list[i].updated){
			var list = getBoundingBox(Monster.list[i]);
			for(var j in list){
				if(grid[Monster.list[i].map]){
					if(grid[Monster.list[i].map][list[j].x]){
						if(grid[Monster.list[i].map][list[j].x][list[j].y]){
							grid[Monster.list[i].map][list[j].x][list[j].y].monsters.push(Monster.list[i]);
						}
						else{
							grid[Monster.list[i].map][list[j].x][list[j].y] = {
								players:[],
								monsters:[Monster.list[i]],
								projectiles:{},
							};
						}
					}
					else{
						grid[Monster.list[i].map][list[j].x] = [];
						grid[Monster.list[i].map][list[j].x][list[j].y] = {
							players:[],
							monsters:[Monster.list[i]],
							projectiles:{},
						};
					}
				}
				else{
					grid[Monster.list[i].map] = [];
					grid[Monster.list[i].map][list[j].x] = [];
					grid[Monster.list[i].map][list[j].x][list[j].y] = {
						players:[],
						monsters:[Monster.list[i]],
						projectiles:{},
					};
				}
			}
		}
	}
	for(var i in Projectile.list){
		var list = getBoundingBox(Projectile.list[i]);
		for(var j in list){
			if(grid[Projectile.list[i].map]){
				if(grid[Projectile.list[i].map][list[j].x]){
					if(grid[Projectile.list[i].map][list[j].x][list[j].y]){
						if(grid[Projectile.list[i].map][list[j].x][list[j].y].projectiles[Projectile.list[i].team]){
							grid[Projectile.list[i].map][list[j].x][list[j].y].projectiles[Projectile.list[i].team].push(Projectile.list[i]);
						}
						else{
							grid[Projectile.list[i].map][list[j].x][list[j].y].projectiles[Projectile.list[i].team] = [Projectile.list[i]];
						}
					}
					else{
						grid[Projectile.list[i].map][list[j].x][list[j].y] = {
							players:[],
							monsters:[],
							projectiles:{},
						};
						grid[Projectile.list[i].map][list[j].x][list[j].y].projectiles[Projectile.list[i].team] = [Projectile.list[i]];
					}
				}
				else{
					grid[Projectile.list[i].map][list[j].x] = [];
					grid[Projectile.list[i].map][list[j].x][list[j].y] = {
						players:[],
						monsters:[],
						projectiles:{},
					};
					grid[Projectile.list[i].map][list[j].x][list[j].y].projectiles[Projectile.list[i].team] = [Projectile.list[i]];
				}
			}
			else{
				grid[Projectile.list[i].map] = [];
				grid[Projectile.list[i].map][list[j].x] = [];
				grid[Projectile.list[i].map][list[j].x][list[j].y] = {
					players:[],
					monsters:[],
					projectiles:{},
				};
				grid[Projectile.list[i].map][list[j].x][list[j].y].projectiles[Projectile.list[i].team] = [Projectile.list[i]];
			}
		}
	}
	for(var i in grid){
		for(var j in grid[i]){
			for(var k in grid[i][j]){
				for(var l in grid[i][j][k].players){
					for(var m in grid[i][j][k].projectiles){
						if(grid[i][j][k].players[l].team !== m){
							for(var n in grid[i][j][k].projectiles[m]){
								if(grid[i][j][k].projectiles[m][n].isColliding(grid[i][j][k].players[l]) && grid[i][j][k].projectiles[m][n].parent + '' !== grid[i][j][k].players[l].id + ''){
									grid[i][j][k].players[l].onDamage(grid[i][j][k].projectiles[m][n]);
								}
							}
						}
					}
					for(var m in grid[i][j][k].monsters){
						if(grid[i][j][k].players[l].team !== grid[i][j][k].monsters[m].team){
							if(grid[i][j][k].monsters[m].isColliding(grid[i][j][k].players[l])){
								grid[i][j][k].players[l].onDamage(grid[i][j][k].monsters[m]);
							}
						}
					}
				}
				for(var l in grid[i][j][k].monsters){
					for(var m in grid[i][j][k].projectiles){
						if(grid[i][j][k].monsters[l].team !== m){
							for(var n in grid[i][j][k].projectiles[m]){
								if(grid[i][j][k].projectiles[m][n].isColliding(grid[i][j][k].monsters[l])){
									grid[i][j][k].monsters[l].onDamage(grid[i][j][k].projectiles[m][n]);
									if(grid[i][j][k].monsters[l].hp <= 0){
										continue;
									}
								}
							}
						}
					}
				}
			}
		}
	}
	var players = [];
	for(var i in Player.list){
		if(Player.list[i].debug.invisible === false){
			if(Player.list[i].region){
				if(Player.list[i].hp <= 0){
					players.push('<img src="/client/websiteAssets/death.png"></img><span style="color:#ff0000">' + Player.list[i].name + ' (' + Player.list[i].region + ')</span><img src="/client/websiteAssets/death.png"></img>');
				}
				else{
					players.push(Player.list[i].name + ' (' + Player.list[i].region + ')');
				}
			}
			else{
				if(Player.list[i].hp <= 0){
					players.push('<img src="/client/websiteAssets/death.png"></img><span style="color:#ff0000">' + Player.list[i].name + '</span><img src="/client/websiteAssets/death.png"></img>');
				}
				else{
					players.push(Player.list[i].name);
				}
			}
		}
	}
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		if(Player.list[socket.id]){
			var map = Player.list[socket.id].map;
			var x = Math.floor(Player.list[socket.id].x / 1024);
			var y = Math.floor(Player.list[socket.id].y / 1024);
			var data = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
			for(var j = -1;j < 2;j++){
				for(var k = -1;k < 2;k++){
					if(pack[map]){
						if(pack[map][x + j]){
							if(pack[map][x + j][y + k]){
								for(var l in pack[map][x + j][y + k]){
									for(var m in pack[map][x + j][y + k][l]){
										data[l].push(pack[map][x + j][y + k][l][m]);
									}
								}
							}
						}
					}
				}
			}
			for(var j = -1;j < 2;j++){
				for(var k = -1;k < 2;k++){
					if(invisPack[map]){
						if(invisPack[map][x + j]){
							if(invisPack[map][x + j][y + k]){
								for(var l in invisPack[map][x + j][y + k]){
									for(var m in invisPack[map][x + j][y + k][l]){
										if(invisPack[map][x + j][y + k][l][m].id === socket.id){
											data[l].push(invisPack[map][x + j][y + k][l][m]);
										}
									}
								}
							}
						}
					}
				}
			}
			socket.emit('update',data);
			socket.emit('playerList',players);
		}
		socket.spam = Math.max(socket.spam - 1,0);
	}
	for(var i in Spawner.list){
		if(Math.random() < 0.001 && Spawner.list[i].spawned === false){
			spawnMonster(Spawner.list[i],i);
		}
	}
	if(weatherLastChanged > 100){
		for(var i in weatherData[currentWeather].changeChances){
			if(Math.random() * 500 / weatherLastChanged < weatherData[currentWeather].changeChances[i]){
				currentWeather = i;
				weatherLastChanged = 0;
				for(var j in SOCKET_LIST){
					if(Player.list[j]){
						SOCKET_LIST[j].emit('changeWeather',currentWeather);
					}
				}
				break;
			}
		}
	}
	weatherLastChanged += 1;
},1000 / 20);

if(SERVER !== 'localhost'){
	process.on('SIGTERM',function(){
		storeDatabase(Player.list);
		addToChat('#ff00ff','[!] THE SERVER HAS RESTARTED. YOU WILL BE DISCONNECTED. [!]');
		setTimeout(function(){
			process.exit(0);
		},1000);
	});
	process.on('SIGINT',function(){
		storeDatabase(Player.list);
		addToChat('#ff00ff','[!] THE SERVER HAS RESTARTED. YOU WILL BE DISCONNECTED. [!]');
		setTimeout(function(){
			process.exit(0);
		},1000);
	});
}
process.on('uncaughtException',function(err){
	storeDatabase(Player.list);
	logError(err.stack);
	addToChat('#ff00ff','[!] THE SERVER HAS CRASHED. CRASH CODE:\n' + err.message);
	// setTimeout(function(){
	// 	process.exit(1);
	// },1000);
});
process.on('unhandledRejection',function(reason,promise){
	storeDatabase(Player.list);
	addToChat('#ff00ff','[!] THE SERVER HAS CRASHED. CRASH CODE:\nPromise:' + promise + '\nReason:' + reason);
	// setTimeout(function(){
	// 	process.exit(1);
	// },1000);
});