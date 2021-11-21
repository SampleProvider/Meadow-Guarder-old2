
VERSION = '0.0.6';

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
console.log('This server is running Meadow Guarder ' + VERSION + '.');

SOCKET_LIST = {};
io = require('socket.io')(serv,{upgradeTimeout:36000000});
io.sockets.on('connection',function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	socket.on('signIn',function(data){
		Database.isValidPassword(data,function(res){
			if(res === 3){
				Player.onConnect(socket,data.username);
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
			socket.emit('createAccountResponse',{success:5,username:data.username});
			return;
		}
		if(data.username.includes('--') || data.password.includes('--')){
			socket.emit('createAccountResponse',{success:3,username:data.username});
			return;
		}
		if(data.username.includes(';') || data.password.includes(';')){
			socket.emit('createAccountResponse',{success:3,username:data.username});
			return;
		}
		if(data.username.includes('\'') || data.password.includes('\'')){
			socket.emit('createAccountResponse',{success:3,username:data.username});
			return;
		}
		if(data.username.includes('<') || data.password.includes('<')){
			socket.emit('createAccountResponse',{success:3,username:data.username});
			return;
		}
		if(data.username.includes('>') || data.password.includes('>')){
			socket.emit('createAccountResponse',{success:3,username:data.username});
			return;
		}
		if(data.username.length > 3 && data.username.length < 41 && data.password.length < 41){
			Database.isUsernameTaken(data,function(res){
				if(res === 0){
					socket.emit('createAccountResponse',{success:0,username:data.username});
				}
				else{
					Database.addUser(data,function(){
						socket.emit('createAccountResponse',{success:1,username:data.username});
					});
				}
			});
		}
		else if(data.username.length > 40 || data.password.length > 40){
			socket.emit('createAccountResponse',{success:4,username:data.username});
			return;
		}
		else{
			socket.emit('createAccountResponse',{success:2,username:data.username});
			return;
		}
	});
	socket.on('deleteAccount',function(data){
		if(data.username === 'sp'){
			socket.emit('deleteAccountResponse',{success:4,username:data.username});
			return;
		}
		Database.isValidPassword(data,function(res){
			if(res === 3){
				Database.removeUser(data,function(){

				});
			}
			socket.emit('deleteAccountResponse',{success:res,username:data.username});
		});
	});
	socket.on('changePassword',function(data){
		if(data.newPassword.includes('--')){
			socket.emit('changePasswordResponse',{success:4,username:data.username,newPassword:data.newPassword});
			return;
		}
		if(data.newPassword.includes(';')){
			socket.emit('changePasswordResponse',{success:4,username:data.username,newPassword:data.newPassword});
			return;
		}
		if(data.newPassword.includes('\'')){
			socket.emit('changePasswordResponse',{success:4,username:data.username,newPassword:data.newPassword});
			return;
		}
		if(data.newPassword.length > 40){
			socket.emit('changePasswordResponse',{success:5,username:data.username,newPassword:data.newPassword});
			return;
		}
		else{
			Database.isValidPassword(data,function(res){
				if(res === 3){
					Database.changePassword(data,function(){

					});
				}
				socket.emit('changePasswordResponse',{success:res,username:data.username,newPassword:data.newPassword});
			});
		}
	});
	socket.on('disconnect',function(){
		if(Player.list[socket.id]){
			Player.list[socket.id].toRemove = true;
		}
	});
	socket.on('timeout',function(){
		if(Player.list[socket.id]){
			Player.list[socket.id].toRemove = true;
		}
	});
	socket.on('tick',function(){
		var players = [];
		for(var i in Player.list){
			if(Player.list[i].hp < 1){
				players.push('<img src="/client/websiteAssets/death.png"></img><span style="color:#ff0000">' + Player.list[i].name + ' (' + Player.list[i].region + ')</span><img src="/client/websiteAssets/death.png"></img>');
			}
			else{
				players.push(Player.list[i].name + ' (' + Player.list[i].region + ')');
			}
		}
		socket.emit('tick',players);
	});
	socket.on('chatMessage',function(data){
		if(Player.list[socket.id]){
			if(data[0] === '/'){
				if(data.length === 1){
					return;
				}
				data = data.slice(1);
				var commandList = [];
				var command = '';
				for(var i in data){
					if(data[i] === ' '){
						commandList.push(command);
						command = '';
					}
					else{
						command += data[i];
					}
				}
				commandList.push(command);
				console.log(Player.list[socket.id].name,commandList)
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
				if(commandList[0] === 'kick' && Player.list[socket.id].name === 'sp'){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					doCommand(name,function(name,i){
						if(SOCKET_LIST[i]){
							SOCKET_LIST[i].emit('disconnected');
							Player.onDisconnect(SOCKET_LIST[i]);
							delete SOCKET_LIST[i];
							socket.emit('addToChat',{
								color:'#ff0000',
								message:'[!] Kicked player ' + name + '.',
							});
						}
					},function(name){
						socket.emit('addToChat',{
							color:'#ff0000',
							message:'[!] No player found with name ' + name + '.',
						});
					});
					return;
				}
				if(commandList[0] === 'kill' && Player.list[socket.id].name === 'sp'){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					doCommand(name,function(name,i){
						Player.list[i].hp = 0;
						Player.list[i].onDeath(Player.list[i]);
						if(SOCKET_LIST[i]){
							SOCKET_LIST[i].emit('death');
						}
						addToChat('#ff0000',Player.list[i].name + ' felt the wrath of ' + Player.list[socket.id].name + '.');
						socket.emit('addToChat',{
							color:'#ff0000',
							message:'[!] Killed player ' + name + '.',
						});
					},function(name){
						socket.emit('addToChat',{
							color:'#ff0000',
							message:'[!] No player found with name ' + name + '.',
						});
					});
					return;
				}
				if(commandList[0] === 'give' && Player.list[socket.id].name === 'sp'){
					commandList.splice(0,1);
					var amount = commandList.splice(commandList.length - 1,1);
					var id = commandList.splice(commandList.length - 1,1);
					var name = recreateCommand(commandList);
					if(Item.list[id]){
						doCommand(name,function(name,i){
							data.addItem(id,amount);
							socket.emit('addToChat',{
								color:'#ff0000',
								message:'[!] Gave <span style="color:' + Player.list[socket.id].inventory.getRarityColor(Item.list[id].rarity) + '">' + Item.list[id].name + '</span> x' + amount + ' to ' + name + '.',
							});
						},function(name){
							socket.emit('addToChat',{
								color:'#ff0000',
								message:'[!] No player found with name ' + name + '.',
							});
						});
						return;
					}
					return;
				}
				if(commandList[0] === 'remove' && Player.list[socket.id].name === 'sp'){
					commandList.splice(0,1);
					var amount = commandList.splice(commandList.length - 1,1);
					var id = commandList.splice(commandList.length - 1,1);
					var name = recreateCommand(commandList);
					if(Item.list[id]){
						doCommand(name,function(name,i){
							Player.list[i].inventory.removeItem(id,amount);
							socket.emit('addToChat',{
								color:'#ff0000',
								message:'[!] Removed <span style="color:' + Player.list[socket.id].inventory.getRarityColor(Item.list[id].rarity) + '">' + Item.list[id].name + '</span> x' + amount + ' from player ' + name + '.',
							});
						},function(name){
							socket.emit('addToChat',{
								color:'#ff0000',
								message:'[!] No player found with name ' + name + '.',
							});
						});
						return;
					}
					return;
				}
				if(commandList[0] === 'debug' && Player.list[socket.id].name === 'sp'){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					try{
						socket.emit('addToChat',{
							color:'#ff0000',
							message:'[!] ' + eval(name) + '.',
						});
					}
					catch(err){
						socket.emit('addToChat',{
							color:'#ff0000',
							message:'[!] ' + err + '.',
						});
					}
					return;
				}
				if(commandList[0] === 'seexp'){
					commandList.splice(0,1);
					var name = recreateCommand(commandList);
					doCommand(name,function(name,i){
						socket.emit('addToChat',{
							color:'#ffff00',
							message:'[!] ' + name + ' is level ' + Player.list[i].level + ' and has ' + Player.list[i].xp + ' xp.',
						});
					},function(name){
						getDatabase(name,function(data){
							if(data.level !== undefined && data.xp !== undefined){
								socket.emit('addToChat',{
									color:'#ffff00',
									message:'[!] ' + name + ' is level ' + data.level + ' and has ' + data.xp + ' xp.',
								});
							}
							else{
								socket.emit('addToChat',{
									color:'#ff0000',
									message:'[!] No player found with name ' + name + '.',
								});
							}
						});
					});
					return;
				}
				if(commandList[0] === 'seeinv'){
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
						socket.emit('addToChat',{
							color:'#ffff00',
							message:'[!] ' + name + ' has ' + items + ' .',
							debug:true,
						});
					},function(name){
						getDatabase(name,function(data){
							if(data.items){
								var items = '';
								for(var j in data.items){
									if(data.items[j].id){
										items += '<span style="color:' + Player.list[socket.id].inventory.getRarityColor(Item.list[data.items[j].id].rarity) + '">' + Item.list[data.items[j].id].name + '</span> x' + data.items[j].amount + '<br>';
									}
								}
								items = items.substr(0,items.length - 4);
								socket.emit('addToChat',{
									color:'#ffff00',
									message:'[!] ' + name + ' has ' + items + ' .',
									debug:true,
								});
							}
							else{
								socket.emit('addToChat',{
									color:'#ff0000',
									message:'[!] No player found with name ' + name + '.',
								});
							}
						});
					});
					return;
				}
				if(commandList[0] === 'help'){
					socket.emit('addToChat',{
						color:'#ff0000',
						message:'Commands:<br>/seexp - See someone\'s xp.<br>/seeinv - See someone\'s inventory.<br>/help - Help.',
						debug:true,
					});
					return;
				}
			}
			else{
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
						return;
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
            var updatePack = Player.list[i].getInitPack();
            pack[Player.list[i].map][Math.floor(Player.list[i].x / 1024)][Math.floor(Player.list[i].y / 1024)].player.push(updatePack);
			if(Player.list[i].toRemove){
				if(SOCKET_LIST[i]){
					SOCKET_LIST[i].emit('disconnected');
					Player.onDisconnect(SOCKET_LIST[i]);
					delete SOCKET_LIST[i];
				}
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
				continue;
			}
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
	for(var i in Player.list){
		for(var j in Projectile.list){
			if(Projectile.list[j].isColliding(Player.list[i]) && i + '' !== Projectile.list[j].parent + ''){
				if(Player.list[i].team !== Projectile.list[j].team){
					Player.list[i].onDamage(Projectile.list[j]);
				}
			}
		}
		for(var j in Monster.list){
			if(Player.list[i].isColliding(Monster.list[j])){
				if(Player.list[i].team !== Monster.list[j].team){
					Player.list[i].onDamage(Monster.list[j]);
				}
			}
		}
	}
	for(var i in Monster.list){
		for(var j in Projectile.list){
			if(Projectile.list[j].isColliding(Monster.list[i]) && i + '' !== Projectile.list[j].parent + ''){
				if(Monster.list[i].team !== Projectile.list[j].team){
					Monster.list[i].onDamage(Projectile.list[j]);
					if(Monster.list[i].toRemove){
						break;
					}
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
			socket.emit('update',data);
		}
	}
	for(var i in Spawner.list){
		if(Math.random() < 0.003 && Spawner.list[i].spawned === false){
			spawnMonster(Spawner.list[i],i);
		}
	}
},1000 / 20);

