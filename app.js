
var express = require('express');

app = {
    version:'0.2.0',
    floor:function(number){
        if(number > 0){
            return ~~number;
        }
        else{
            if(~~number === number){
                return ~~number;
            }
            else{
                return ~~number - 1;
            }
        }
    },
    server:process.env.PORT ? 'heroku' : 'localhost',
    start:function(){
        app.application = express();
        app.serv = require('http').Server(app.application);
        
        app.application.get('/',function(req,res){
            res.sendFile(__dirname + '/client/index.html');
        });
        app.application.use('/client',express.static(__dirname + '/client'));
        
        if(app.server === 'localhost'){
            var port = app.serv.listen(3000);
        }
        else{
            var port = app.serv.listen(process.env.PORT);
        }
        
        console.log('Server Started on port ' + port.address().port);
        console.log('This server is running Meadow Guarder ' + app.version + '.');

        app.enableConnections();
    },
    enableConnections:function(){
        io = require('socket.io')(app.serv,{upgradeTimeout:36000000});
        io.sockets.on('connection',function(socket){
            socket.disconnectUser = function(){
                socket.disconnect(true);
            }
            socket.on('signIn',function(data){
                if(!data){
                    socket.disconnectUser();
                    return;
                }
                if(typeof data.username !== 'string' || typeof data.password !== 'string'){
                    socket.disconnectUser();
                    return;
                }
                //database checks
                var player = Player({
                    username:data.username,
                    socket:socket,
                });
                socket.emit('signInResponse',{
                    response:'success',
                    player:player.id,
                });
            });
        });
    },
    tick:function(){
        var pack = {
            player:{},
            monster:{},
            projectile:{},
        };
        for(var i in Player.list){
            Player.list[i].update();
            pack.player[i] = Player.list[i].getInitPack();
        }
        for(var i in Monster.list){
            Monster.list[i].update();
            pack.monster[i] = Monster.list[i].getInitPack();
        }
        for(var i in Projectile.list){
            Projectile.list[i].update();
            pack.projectile[i] = Projectile.list[i].getInitPack();
        }
        for(var i in Player.list){
            Player.list[i].socket.emit('update',pack);
        }
    },
};

app.start();

globalId = 1;
require('./server/collision.js');
require('./server/entity.js');
require('./server/maps.js');

setInterval(app.tick,50);