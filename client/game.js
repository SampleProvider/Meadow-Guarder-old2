

var app = {
    socket:io(),
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
    fps:[],
    images:{},
    canvas:document.getElementById('canvas'),
    ctx:document.getElementById('canvas').getContext('2d'),
    resetCanvas:function(ctx){
        ctx.filter = 'url(#remove-alpha)';
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
    },
    updateCtx:function(){
        app.ctx.canvas.width = window.innerWidth;
        app.ctx.canvas.height = window.innerHeight;
        app.resetCanvas(app.ctx);
    },
    player:null,
    mouseX:0,
    mouseY:0,
    mouseMove:function(){
        
    },
    mouseDown:function(event){
        var clickType = 'leftClick';
        if(event.button === 0){
            clickType === 'leftClick';
        }
        else if(event.button === 2){
            clickType === 'rightClick';
        }
        for(var i in app.keyBinds){
            if(app.keyBinds[i] === clickType){
                app.socket.emit('keyPress',i);
            }
        }
    },
    mouseUp:function(event){
        var clickType = 'leftClick';
        if(event.button === 0){
            clickType === 'leftClick';
        }
        else if(event.button === 2){
            clickType === 'rightClick';
        }
        for(var i in app.keyBinds){
            if(app.keyBinds[i] === clickType){
                app.socket.emit('keyRelease',i);
            }
        }
    },
    cameraX:0,
    cameraY:0,
    updateCamera:function(){
        app.cameraX = app.floor(window.innerWidth / 2 - Player.list[app.player].x + 0.5);
        app.cameraY = app.floor(window.innerHeight / 2 - Player.list[app.player].y + 0.5);
    },
    keyBinds:{
        up:'w',
        down:'s',
        left:'a',
        right:'d',
        leftClick:'leftClick',
        rightClick:'rightClick',
    },
    keyPress:function(event){
        for(var i in app.keyBinds){
            if(app.keyBinds[i] === event.key.toLowerCase()){
                app.socket.emit('keyPress',i);
            }
        }
    },
    keyRelease:function(event){
        for(var i in app.keyBinds){
            if(app.keyBinds[i] === event.key.toLowerCase()){
                app.socket.emit('keyRelease',i);
            }
        }
    },
    disconnect:function(){

    },
    tick:function(){
        var now = performance.now();
        while(app.fps.length > 0 && app.fps[0] <= now - 1000){
            app.fps.shift();
        }
        app.fps.push(now);
        if(!Player.list[app.player]){
            window.requestAnimationFrame(app.tick);
            return;
        }
        app.ctx.clearRect(0,0,app.ctx.canvas.width,app.ctx.canvas.height);
        for(var i in Player.list){
            Player.list[i].update();
        }
        for(var i in Monster.list){
            Monster.list[i].update();
        }
        for(var i in Projectile.list){
            Projectile.list[i].update();
        }
        app.updateCamera();
        app.ctx.save();
        app.ctx.translate(app.cameraX,app.cameraY);
        if(maps.data['test']){
            app.ctx.drawImage(maps.data['test'][0][0].lower,0,0)
            app.ctx.drawImage(maps.data['test'][-16][0].lower,-1024,0)
            app.ctx.drawImage(maps.data['test'][0][-16].lower,0,-1024)
            app.ctx.drawImage(maps.data['test'][-16][-16].lower,-1024,-1024)
        }
        else{
            maps.renderChunks('test');
        }
        var entities = [];
        for(var i in Player.list){
            entities.push(Player.list[i]);
        }
        for(var i in Monster.list){
            entities.push(Monster.list[i]);
        }
        for(var i in Projectile.list){
            entities.push(Projectile.list[i]);
        }
        var sortEntities = function(a,b){
            var ay = a.y;
            var by = b.y;
            if(ay < by){
                return -1;
            }
            if(ay > by){
                return 1;
            }
            return 0;
        }
        entities.sort(sortEntities);
        for(var i in entities){
            entities[i].draw();
        }
        app.ctx.restore();
        window.requestAnimationFrame(app.tick);
    },
};

app.updateCtx();

app.socket.on('connect_error',function(){
    setTimeout(function(){
        app.socket.connect();
    },1000);
});
app.socket.on('disconnect',function(){
    app.disconnect();
});


app.socket.on('update',function(data){
    for(var i in Player.list){
        Player.list[i].updated = false;
    }
    for(var i in Monster.list){
        Monster.list[i].updated = false;
    }
    for(var i in Projectile.list){
        Projectile.list[i].updated = false;
    }
    var interpolationLength = app.floor(app.fps.length / 20);
    for(var i in data.player){
        if(Player.list[i]){
            var player = Player.list[i];
            player.spdX = 0;
            player.spdY = 0;
            player.interpolationStage = interpolationLength;
            player.updated = true;
            for(var j in data.player[i]){
                if(j === 'id'){

                }
                else if(j === 'x'){
                    player.spdX = (data.player[i].x - player.x) / interpolationLength;
                    player.serverX = data.player[i].x;
                }
                else if(j === 'y'){
                    player.spdY = (data.player[i].y - player.y) / interpolationLength;
                    player.serverY = data.player[i].y;
                }
                else if(j === 'direction'){
                    player[j] = (data.player[i][j] + 360) % 360;
                }
                else if(j === 'toRemove'){
                    player[j] = data.player[i][j];
                    player.fadeState = 2;
                    player.fade -= 0.05;
                }
                else{
                    player[j] = data.player[i][j];
                }
            }
        }
        else{
            new Player(data.player[i]);
        }
    }
    for(var i in data.monster){
        if(Monster.list[i]){
            var monster = Monster.list[i];
            monster.spdX = 0;
            monster.spdY = 0;
            monster.interpolationStage = interpolationLength;
            monster.updated = true;
            for(var j in data.monster[i]){
                if(j === 'id'){

                }
                else if(j === 'x'){
                    monster.spdX = (data.monster[i].x - monster.x) / interpolationLength;
                    monster.serverX = data.monster[i].x;
                }
                else if(j === 'y'){
                    monster.spdY = (data.monster[i].y - monster.y) / interpolationLength;
                    monster.serverY = data.monster[i].y;
                }
                else if(j === 'direction'){
                    monster[j] = (data.monster[i][j] + 360) % 360;
                }
                else if(j === 'toRemove'){
                    monster[j] = data.monster[i][j];
                    monster.fadeState = 2;
                    monster.fade -= 0.05;
                }
                else{
                    monster[j] = data.monster[i][j];
                }
            }
        }
        else{
            new Monster(data.monster[i]);
        }
    }
    for(var i in data.projectile){
        if(Projectile.list[i]){
            var projectile = Projectile.list[i];
            projectile.spdX = 0;
            projectile.spdY = 0;
            projectile.interpolationStage = interpolationLength;
            projectile.updated = true;
            for(var j in data.projectile[i]){
                if(j === 'id'){

                }
                else if(j === 'x'){
                    projectile.spdX = (data.projectile[i].x - projectile.x) / interpolationLength;
                    projectile.serverX = data.projectile[i].x;
                }
                else if(j === 'y'){
                    projectile.spdY = (data.projectile[i].y - projectile.y) / interpolationLength;
                    projectile.serverY = data.projectile[i].y;
                }
                else if(j === 'direction'){
                    projectile[j] = (data.projectile[i][j] + 360) % 360;
                }
                else if(j === 'toRemove'){
                    projectile[j] = data.projectile[i][j];
                    projectile.fadeState = 2;
                    projectile.fade -= 0.05;
                }
                else{
                    projectile[j] = data.projectile[i][j];
                }
            }
        }
        else{
            new Projectile(data.projectile[i]);
        }
    }
    for(var i in Player.list){
        if(Player.list[i].updated === false){
            Player.list[i].fadeOut();
        }
    }
    for(var i in Monster.list){
        if(Monster.list[i].updated === false){
            Monster.list[i].fadeOut();
        }
    }
    for(var i in Projectile.list){
        if(Projectile.list[i].updated === false){
            Projectile.list[i].fadeOut();
        }
    }
});

document.onmousemove = app.mouseMove;
document.onkeydown = app.keyPress;
document.onkeyup = app.keyRelease;
document.onmousedown = app.mouseDown;
document.onmouseup = app.mouseUp;
window.onresize = app.updateCtx;