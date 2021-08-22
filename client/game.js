var isFirefox = typeof InstallTrigger !== 'undefined';
if(isFirefox === true) {
    alert('This game uses OffscreenCanvas, which is not supported in Firefox.');
}

var VERSION = '0.0.1';

var socket = io({
    reconnection:false,
});
socket.on('connect_error',function(){
    setTimeout(function(){
        socket.connect();
    },1000);
});
socket.on('disconnect',function(){
    setTimeout(function(){
        socket.connect();
    },1000);
});

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var mouseX = 0;
var mouseY = 0;
var cameraX = 0;
var cameraY = 0;
var selfId = null;

var shadeSpeed = -0.01;
var shadeAmount = 1;
var mapShadeSpeed = 0;
var mapShadeAmount = 0;
var currentMap = 'World';

var respawnTimer = 0;

var resetCanvas = function(ctx){
    ctx.webkitImageSmoothingEnabled = false;
    ctx.filter = 'url(#remove-alpha)';
    ctx.imageSmoothingEnabled = false;
}
var pageDiv = document.getElementById('pageDiv');
var gameDiv = document.getElementById('gameDiv');
var disconnectedDiv = document.getElementById('disconnectedDiv');
var deathDiv = document.getElementById('deathDiv');


var ctxRaw = document.getElementById('ctx');
var ctx = document.getElementById("ctx").getContext("2d");
ctxRaw.style.width = window.innerWidth;
ctxRaw.style.height = window.innerHeight;
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
resetCanvas(ctx);

var Img = {};
Img.player = new Image();
Img.player.src = '/client/img/player.png';

var request = new XMLHttpRequest();
request.open('GET',"/client/data/projectiles.json",true);
request.onload = function(){
    if(this.status >= 200 && this.status < 400){
        var json = JSON.parse(this.response);
        for(var i in json){
            Img[i] = new Image();
            Img[i].src = '/client/img/' + i + '.png';
        }
    }
    else{

    }
};
request.onerror = function(){
    
};
request.send();
var request2 = new XMLHttpRequest();
request2.open('GET',"/client/data/monsters.json",true);
request2.onload = function(){
    if(this.status >= 200 && this.status < 400){
        var json = JSON.parse(this.response);
        for(var i in json){
            Img[i] = new Image();
            Img[i].src = '/client/img/' + i + '.png';
        }
    }
    else{

    }
};
request2.onerror = function(){
    
};
request2.send();

Img.greenHealthBar = new Image();
Img.greenHealthBar.src = '/client/img/greenHealthBar.png';
Img.redHealthBar = new Image();
Img.redHealthBar.src = '/client/img/redHealthBar.png';

var renderPlayer = function(img,shadeValues){
    if(isFirefox){
        var temp = document.createElement('canvas');
        temp.canvas.width = 72;
        temp.canvas.heiht = 152;
    }
    else{
        var temp = new OffscreenCanvas(72,152);
    }
    var gl = temp.getContext('2d');
    resetCanvas(gl);
    gl.drawImage(img,0,0);
    var imageData = gl.getImageData(0,0,72,152);
    var rgba = imageData.data;
    for(var i = 0;i < rgba.length;i += 4){
        if(rgba[i] === 0 && rgba[i + 1] === 0 && rgba[i + 2] === 0){
            //rgba[i + 3] = 0;
        }
        else{
            if(shadeValues[0] !== -1){
                rgba[i] = rgba[i] + (shadeValues[0] - rgba[i]) * shadeValues[3];
            }
            if(shadeValues[1] !== -1){
                rgba[i + 1] = rgba[i + 1] + (shadeValues[1] - rgba[i + 1]) * shadeValues[3];
            }
            if(shadeValues[2] !== -1){
                rgba[i + 2] = rgba[i + 2] + (shadeValues[2] - rgba[i + 2]) * shadeValues[3];
            }
        }
    }
    gl.clearRect(0,0,72,152);
    gl.putImageData(imageData,0,0);
    if(isFirefox){
        var finalTemp = document.createElement('canvas');
        finalTemp.canvas.width = 72 * 4;
        finalTemp.canvas.height = 152 * 4;
    }
    else{
        var finalTemp = new OffscreenCanvas(72 * 4,152 * 4);
    }
    var finalGl = finalTemp.getContext('2d');
    resetCanvas(finalGl);
    finalGl.drawImage(temp,0,0,72 * 4,152 * 4);
    return finalTemp;
}
var drawPlayer = function(img,canvas,animationDirection,animation,x,y,size,drawSize){
    var animationValue = 0;
    switch(animationDirection){
        case "down":
            animationValue = 0;
            break;
        case "left":
            animationValue = 1;
            break;
        case "right":
            animationValue = 2;
            break;
        case "up":
            animationValue = 3;
            break;
    }
    if(drawSize === 'small'){
        canvas.drawImage(img,16 * animation,16 * animationValue,16,16,x - size * 8,y - size * 8,size * 16,size * 16);
    }
    else if(drawSize === 'medium'){
        canvas.drawImage(img,16 * animation,24 * animationValue,16,24,x - size * 8,y - size * 18,size * 16,size * 24);
    }
    else{
        canvas.drawImage(img,32 * animation,32 * animationValue,32,32,x - size * 16,y - size * 16,size * 32,size * 32);
    }
    return canvas;
}
var arrayIsEqual = function(arr1,arr2){
	if(arr1.length !== arr2.length){
        return false;
    }
	for(var i = 0;i < arr1.length;i++){
		if(arr1[i] !== arr2[i]){
            return false;
        }
	}
	return true;
};

socket.on('selfId',function(data){
    selfId = data.id;
    // chat = '<div>Welcome to Meadow Guarders Open ' + VERSION + '!</div>';
    // chatText.innerHTML = '<div>Welcome to Meadow Guarders Open ' + VERSION + '!</div>';
    // gameDiv.style.display = 'inline-block';
});
socket.on('update',function(data){
    for(var i in Player.list){
        Player.list[i].updated = false;
    }
    for(var i in Projectile.list){
        Projectile.list[i].updated = false;
    }
    for(var i in Monster.list){
        Monster.list[i].updated = false;
    }
    if(data){
        if(data.player.length > 0){
            for(var i = 0;i < data.player.length;i++){
                if(Player.list[data.player[i].id]){
                    var player = Player.list[data.player[i].id];
                    player.spdX = 0;
                    player.spdY = 0;
                    player.interpolationStage = 4;
                    player.updated = true;
                    for(var j in data.player[i]){
                        if(j === 'id'){

                        }
                        else if(j === 'x'){
                            player.spdX = (data.player[i].x - player.x) / 4;
                        }
                        else if(j === 'y'){
                            player.spdY = (data.player[i].y - player.y) / 4;
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
        }
        if(data.projectile.length > 0){
            for(var i = 0;i < data.projectile.length;i++){
                if(Projectile.list[data.projectile[i].id]){
                    var projectile = Projectile.list[data.projectile[i].id];
                    projectile.spdX = 0;
                    projectile.spdY = 0;
                    projectile.interpolationStage = 4;
                    projectile.updated = true;
                    for(var j in data.projectile[i]){
                        if(j === 'id'){

                        }
                        else if(j === 'x'){
                            projectile.spdX = (data.projectile[i].x - projectile.x) / 4;
                        }
                        else if(j === 'y'){
                            projectile.spdY = (data.projectile[i].y - projectile.y) / 4;
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
        }
        if(data.monster.length > 0){
            for(var i = 0;i < data.monster.length;i++){
                if(Monster.list[data.monster[i].id]){
                    var monster = Monster.list[data.monster[i].id];
                    monster.spdX = 0;
                    monster.spdY = 0;
                    monster.interpolationStage = 4;
                    monster.updated = true;
                    for(var j in data.monster[i]){
                        if(j === 'id'){

                        }
                        else if(j === 'x'){
                            monster.spdX = (data.monster[i].x - monster.x) / 4;
                        }
                        else if(j === 'y'){
                            monster.spdY = (data.monster[i].y - monster.y) / 4;
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
        }
    }
    for(var i in Player.list){
        if(Player.list[i].updated === false){
            delete Player.list[i];
        }
    }
    for(var i in Projectile.list){
        if(Projectile.list[i].updated === false){
            delete Projectile.list[i];
        }
    }
    for(var i in Monster.list){
        if(Monster.list[i].updated === false){
            delete Monster.list[i];
        }
    }
});
socket.on('initEntity',function(data){
    if(data.type === "Player"){
        new Player(data);
    }
});
socket.on('disconnected',function(data){
    gameDiv.style.display = 'inline-block';
    disconnectedDiv.style.display = 'inline-block';
    pageDiv.style.display = 'none';
    Player.list[selfId].spdX = 0;
    Player.list[selfId].spdY = 0;
    setTimeout(function(){
        location.reload();
    },5000);
    socket.emit('disconnect');
    selfId = null;
});
socket.on('death',function(data){
    gameDiv.style.display = 'inline-block';
    disconnectedDiv.style.display = 'none';
    deathDiv.style.display = 'inline-block';
    pageDiv.style.display = 'none';
    respawnTimer = 5;
    document.getElementById('respawnTimer').innerHTML = respawnTimer;
    document.getElementById('respawn').style.display = 'none';
    setTimeout(updateRespawn,1500);
});
var respawn = function(){
    socket.emit('respawn');
    gameDiv.style.display = 'inline-block';
    disconnectedDiv.style.display = 'none';
    deathDiv.style.display = 'none';
    pageDiv.style.display = 'none';
    setTimeout(function(){
        gameDiv.style.display = 'inline-block';
        disconnectedDiv.style.display = 'none';
        deathDiv.style.display = 'none';
        pageDiv.style.display = 'none';
    },50);
}
var updateRespawn = function(){
    if(deathDiv.style.display === 'none'){
        return;
    }
    respawnTimer = Math.max(respawnTimer - 1,0);
    document.getElementById('respawnTimer').innerHTML = respawnTimer;
    if(respawnTimer === 0){
        document.getElementById('respawn').style.display = 'inline-block';
    }
    setTimeout(updateRespawn,1000);
}
socket.on('changeMap',function(data){
    if(shadeAmount < 0){
        shadeAmount = 0;
    }
    currentMap = data.teleport;
    shadeSpeed = 3 / 40;
});

setInterval(function(){
    if(!selfId){
        return;
    }
    if(!Player.list[selfId]){
        return;
    }
    if(WIDTH !== window.innerWidth || HEIGHT !== window.innerHeight){
        ctxRaw.style.width = window.innerWidth;
        ctxRaw.style.height = window.innerHeight;
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        resetCanvas(ctx);
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;
    }
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,WIDTH,HEIGHT);
    for(var i in Player.list){
        Player.list[i].update();
    }
    for(var i in Monster.list){
        Monster.list[i].update();
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
    }
    cameraX = WIDTH / 2 - Player.list[selfId].x;
    cameraY = HEIGHT / 2 - Player.list[selfId].y;
    var mouseCameraX = mouseX / 8;
    var mouseCameraY = mouseY / 8;
    if(mouseCameraX > 128){
        mouseCameraX = 128;
    }
    if(mouseCameraX < -128){
        mouseCameraX = -128;
    }
    if(mouseCameraY > 128){
        mouseCameraY = 128;
    }
    if(mouseCameraY < -128){
        mouseCameraY = -128;
    }
    // cameraX -= mouseCameraX;
    // cameraY -= mouseCameraY;
    cameraX = Math.round(cameraX);
    cameraY = Math.round(cameraY);
    ctx.save();
    ctx.translate(cameraX,cameraY);
    for(var i = -1;i < 2;i++){
        for(var j = -1;j < 2;j++){
            if(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':' + Math.floor(tileAnimation) + ':']){
                ctx.drawImage(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':' + Math.floor(tileAnimation) + ':'].lower,(Math.floor(Player.list[selfId].x / 1024) + i) * 1024,(Math.floor(Player.list[selfId].y / 1024) + j) * 1024);
            }
        }
    }
    for(var i in Player.list){
        Player.list[i].draw();
    }
    for(var i in Monster.list){
        Monster.list[i].draw();
    }
    for(var i in Projectile.list){
        Projectile.list[i].draw();
    }
    for(var i = -1;i < 2;i++){
        for(var j = -1;j < 2;j++){
            if(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':' + Math.floor(tileAnimation) + ':']){
                ctx.drawImage(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':' + Math.floor(tileAnimation) + ':'].upper,(Math.floor(Player.list[selfId].x / 1024) + i) * 1024,(Math.floor(Player.list[selfId].y / 1024) + j) * 1024);
            }
        }
    }
    for(var i in Player.list){
        Player.list[i].drawHp();
    }
    for(var i in Monster.list){
        Monster.list[i].drawHp();
    }
    ctx.restore();

    if(mapShadeAmount >= 3.5){
        mapShadeSpeed = -0.12;
    }
    if(Player.list[selfId].map === currentMap && shadeAmount > 1.5){
        shadeSpeed = -3 / 40;
    }
    if(shadeAmount < 0.25 && document.getElementById('regionDisplay').innerHTML !== Player.list[selfId].map){
        document.getElementById('regionDisplay').innerHTML = Player.list[selfId].map;
        mapShadeAmount = 0;
        mapShadeSpeed = 0.08;
    }
    shadeAmount += shadeSpeed;
    mapShadeAmount += mapShadeSpeed;
    if(shadeAmount >= -1){
        document.getElementById('mapFade').style.opacity = shadeAmount;
    }
    if(mapShadeAmount >= -1){
        document.getElementById('regionDisplay').style.opacity = mapShadeAmount;
    }

    tileAnimation += 0.1;
    if(tileAnimation >= 8){
        tileAnimation = 0;
    }
},1000/80);

document.onkeydown = function(event){
    if(!event.isTrusted){
        socket.emit('timeout');
    }
    var key = event.key || event.keyCode;
    if(key === 'Meta' || key === 'Alt' || key === 'Control'){
        socket.emit('keyPress',{inputId:'releaseAll'});
    }
    socket.emit('keyPress',{inputId:key,state:true});
}
document.onkeyup = function(event){
    var key = event.key || event.keyCode;
    socket.emit('keyPress',{inputId:key,state:false});
}
document.onmousemove = function(event){
    if(selfId){
        var x = -1 * cameraX - Player.list[selfId].x + event.clientX;
        var y = -1 * cameraY - Player.list[selfId].y + event.clientY;
        if(event.clientY < 0){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(event.clientY > window.innerHeight){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(event.clientX < 0){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(event.clientX > window.innerWidth){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        mouseX = event.clientX - WIDTH / 2;
        mouseY = event.clientY - HEIGHT / 2;
        socket.emit('keyPress',{inputId:'direction',state:{x:x,y:y}});
        // if(!talking){
        //     socket.emit('keyPress',{inputId:'direction',state:{x:x,y:y}});
        // }
        // var inSlot = false;
        // var inventorySlots = document.getElementsByClassName('inventorySlot');
        // for(var i = 0;i < inventorySlots.length;i++){
        //     if(inventorySlots[i].className.includes('inventoryMenuSlot') && document.getElementById('inventoryScreen').style.display === 'inline-block'){
        //         var rect = inventorySlots[i].getBoundingClientRect();
        //         if(mouseX + WIDTH / 2 > rect.left){
        //             if(mouseX + WIDTH / 2 < rect.left + 72){
        //                 if(mouseY + HEIGHT / 2 > rect.top){
        //                     if(mouseY + HEIGHT / 2 < rect.top + 72){
        //                         inSlot = true;
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     if(inventorySlots[i].className.includes('shopMenuSlot') && document.getElementById('shopScreen').style.display === 'inline-block'){
        //         var rect = inventorySlots[i].getBoundingClientRect();
        //         if(mouseX + WIDTH / 2 > rect.left){
        //             if(mouseX + WIDTH / 2 < rect.left + 72){
        //                 if(mouseY + HEIGHT / 2 > rect.top){
        //                     if(mouseY + HEIGHT / 2 < rect.top + 72){
        //                         inSlot = true;
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     if(inventorySlots[i].className.includes('craftMenuSlot') && document.getElementById('craftScreen').style.display === 'inline-block'){
        //         var rect = inventorySlots[i].getBoundingClientRect();
        //         if(mouseX + WIDTH / 2 > rect.left){
        //             if(mouseX + WIDTH / 2 < rect.left + 72){
        //                 if(mouseY + HEIGHT / 2 > rect.top){
        //                     if(mouseY + HEIGHT / 2 < rect.top + 72){
        //                         inSlot = true;
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
        // var itemMenu = document.getElementsByClassName('itemMenu');
        // if(inSlot === false){
        //     for(var i = 0;i < itemMenu.length;i++){
        //         if(itemMenu[i].style.display === 'inline-block'){
        //             itemMenu[i].style.display = 'none';
        //         }
        //     }
        // }
        // else{
        //     for(var i = 0;i < itemMenu.length;i++){
        //         if(itemMenu[i].style.display === 'inline-block'){
        //             itemMenu[i].style.left = (event.clientX + 3) + 'px';
        //             itemMenu[i].style.top = (event.clientY + 3) + 'px';
        //         }
        //     }
        // }
        // if(inventory.draggingItem !== -1){
        //     document.getElementById('draggingItem').style.left = (event.clientX - inventory.draggingX) + 'px';
        //     document.getElementById('draggingItem').style.top = (event.clientY - inventory.draggingY) + 'px';
        // }
        // else{
        //     document.getElementById('draggingItem').style.left = '-100px';
        //     document.getElementById('draggingItem').style.top = '-100px';
        // }
    }
}
document.addEventListener("visibilitychange",function(){
    socket.emit('init');
    socket.emit('keyPress',{inputId:"releaseAll",state:true});
});
mouseDown = function(event){
    if(!event.isTrusted){
        socket.emit('timeout');
    }
    if(event.button === 0){
        socket.emit('keyPress',{inputId:'attack',state:true});
    }
    if(event.button === 2){
        socket.emit('keyPress',{inputId:'second',state:true});
    }
}
mouseUp = function(event){
    if(event.button === 0){
        socket.emit('keyPress',{inputId:'attack',state:false});
    }
    if(event.button === 2){
        socket.emit('keyPress',{inputId:'second',state:false});
    }
}
document.querySelectorAll("button").forEach(function(item){
    item.addEventListener('focus',function(){
        this.blur();
    });
});
window.onresize = function(){
    document.getElementById('pageDiv').style.backgroundSize = window.innerWidth + 'px,' + window.innerHeight + 'px';
    document.getElementById('pageDiv').style.width = window.innerWidth + 'px';
    document.getElementById('pageDiv').style.height = window.innerHeight + 'px';
}
document.oncontextmenu = function(event){
    event.preventDefault();
}