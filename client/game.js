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
var rawMouseX = 0;
var rawMouseY = 0;
var cameraX = 0;
var cameraY = 0;
var selfId = null;
var scrollAllowed = true;

var shadeSpeed = -0.01;
var shadeAmount = 1;
var mapShadeSpeed = 0;
var mapShadeAmount = 0;
var currentMap = '';

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
Img.sword = new Image();
Img.sword.src = '/client/img/sword.png';
Img.select = new Image();
Img.select.src = '/client/img/select.png';


var inventory = new Inventory(socket,false);
socket.on('updateInventory',function(pack){
    inventory.items = pack.items;
    inventory.refreshInventory();
});
socket.on('updateItem',function(pack){
    inventory.items = pack.items;
    inventory.refreshItem(pack.index);
});
socket.on('refreshMenu',function(pack){
    inventory.maxSlots = pack;
    inventory.refreshMenu();
});
socket.on('refreshCraft',function(pack){
    inventory.craftItems = pack;
    inventory.refreshCraft();
});
socket.on('updateCraft',function(pack){
    for(var i in inventory.craftItems.items){
        inventory.updateCraftClient(i);
    }
});

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
        canvas.drawImage(img,16 * animation,16 * animationValue,16,16,x - size * 8,y - size * 8.5,size * 16,size * 16);
    }
    else if(drawSize === 'medium'){
        canvas.drawImage(img,16 * animation,24 * animationValue,16,24,x - size * 8,y - size * 17.5,size * 16,size * 24);
    }
    else{
        canvas.drawImage(img,32 * animation,32 * animationValue,32,32,x - size * 16,y - size * 16.5,size * 32,size * 32);
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
    signErrorText = signError.innerHTML;
    signError.innerHTML = '<span style="color: #55ff55">Success! Server response recieved.</span><br>' + signErrorText;
    setTimeout(function(){
        selfId = data.id;
        chat = '<div>Welcome to Meadow Guarder ' + VERSION + '!</div>';
        chatText.innerHTML = '<div>Welcome to Meadow Guarder ' + VERSION + '!</div>';
        gameDiv.style.display = 'inline-block';
        window.requestAnimationFrame(loop);
        socket.emit('signInFinished');
    },750);
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
    for(var i in Npc.list){
        Npc.list[i].updated = false;
    }
    for(var i in HarvestableNpc.list){
        HarvestableNpc.list[i].updated = false;
    }
    for(var i in DroppedItem.list){
        DroppedItem.list[i].updated = false;
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
                            if(!player.x){
                                player.x = data.player[i].x;
                            }
                            else{
                                player.spdX = (data.player[i].x - player.x) / 4;
                            }
                        }
                        else if(j === 'y'){
                            if(!player.y){
                                player.y = data.player[i].y;
                            }
                            else{
                                player.spdY = (data.player[i].y - player.y) / 4;
                            }
                        }
                        else if(j === 'hp'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                document.getElementById('healthBarText').innerHTML = player.hp + " / " + player.hpMax;
                                document.getElementById('healthBarValue').style.width = "" + 150 * player.hp / player.hpMax + "px";
                            }
                        }
                        else if(j === 'hpMax'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                document.getElementById('healthBarText').innerHTML = player.hp + " / " + player.hpMax;
                                document.getElementById('healthBarValue').style.width = "" + 150 * player.hp / player.hpMax + "px";
                            }
                        }
                        else if(j === 'xp'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                document.getElementById('xpBarText').innerHTML = player.xp + " / " + player.xpMax;
                                document.getElementById('xpBarValue').style.width = "" + 150 * player.xp / player.xpMax + "px";
                            }
                        }
                        else if(j === 'xpMax'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                document.getElementById('xpBarText').innerHTML = player.xp + " / " + player.xpMax;
                                document.getElementById('xpBarValue').style.width = "" + 150 * player.xp / player.xpMax + "px";
                            }
                        }
                        else if(j === 'mana'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                document.getElementById('manaBarText').innerHTML = player.mana + " / " + player.manaMax;
                                document.getElementById('manaBarValue').style.width = "" + 150 * player.mana / player.manaMax + "px";
                            }
                        }
                        else if(j === 'manaMax'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                document.getElementById('manaBarText').innerHTML = player.mana + " / " + player.manaMax;
                                document.getElementById('manaBarValue').style.width = "" + 150 * player.mana / player.manaMax + "px";
                            }
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
                            if(!projectile.x){
                                projectile.x = data.projectile[i].x;
                            }
                            else{
                                projectile.spdX = (data.projectile[i].x - projectile.x) / 4;
                            }
                        }
                        else if(j === 'y'){
                            if(!projectile.y){
                                projectile.y = data.projectile[i].y;
                            }
                            else{
                                projectile.spdY = (data.projectile[i].y - projectile.y) / 4;
                            }
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
                            if(!monster.x){
                                monster.x = data.monster[i].x;
                            }
                            else{
                                monster.spdX = (data.monster[i].x - monster.x) / 4;
                            }
                        }
                        else if(j === 'y'){
                            if(!monster.y){
                                monster.y = data.monster[i].y;
                            }
                            else{
                                monster.spdY = (data.monster[i].y - monster.y) / 4;
                            }
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
        if(data.npc.length > 0){
            for(var i = 0;i < data.npc.length;i++){
                if(Npc.list[data.npc[i].id]){
                    var npc = Npc.list[data.npc[i].id];
                    npc.spdX = 0;
                    npc.spdY = 0;
                    npc.interpolationStage = 4;
                    npc.updated = true;
                    for(var j in data.npc[i]){
                        if(j === 'id'){

                        }
                        else if(j === 'x'){
                            if(!npc.x){
                                npc.x = data.npc[i].x;
                            }
                            else{
                                npc.spdX = (data.npc[i].x - npc.x) / 4;
                            }
                        }
                        else if(j === 'y'){
                            if(!npc.y){
                                npc.y = data.npc[i].y;
                            }
                            else{
                                npc.spdY = (data.npc[i].y - npc.y) / 4;
                            }
                        }
                        else{
                            npc[j] = data.npc[i][j];
                        }
                    }
                }
                else{
                    new Npc(data.npc[i]);
                }
            }
        }
        if(data.harvestableNpc.length > 0){
            for(var i = 0;i < data.harvestableNpc.length;i++){
                if(HarvestableNpc.list[data.harvestableNpc[i].id]){
                    var harvestableNpc = HarvestableNpc.list[data.harvestableNpc[i].id];
                    harvestableNpc.spdX = 0;
                    harvestableNpc.spdY = 0;
                    harvestableNpc.interpolationStage = 4;
                    harvestableNpc.updated = true;
                    for(var j in data.harvestableNpc[i]){
                        if(j === 'id'){

                        }
                        else if(j === 'x'){
                            if(!harvestableNpc.x){
                                harvestableNpc.x = data.harvestableNpc[i].x;
                            }
                            else{
                                harvestableNpc.spdX = (data.harvestableNpc[i].x - harvestableNpc.x) / 4;
                            }
                        }
                        else if(j === 'y'){
                            if(!harvestableNpc.y){
                                harvestableNpc.y = data.harvestableNpc[i].y;
                            }
                            else{
                                harvestableNpc.spdY = (data.harvestableNpc[i].y - harvestableNpc.y) / 4;
                            }
                        }
                        else{
                            harvestableNpc[j] = data.harvestableNpc[i][j];
                        }
                    }
                }
                else{
                    new HarvestableNpc(data.harvestableNpc[i]);
                }
            }
        }
        if(data.droppedItem.length > 0){
            for(var i = 0;i < data.droppedItem.length;i++){
                if(DroppedItem.list[data.droppedItem[i].id]){
                    var droppedItem = DroppedItem.list[data.droppedItem[i].id];
                    droppedItem.spdX = 0;
                    droppedItem.spdY = 0;
                    droppedItem.interpolationStage = 4;
                    droppedItem.updated = true;
                    for(var j in data.droppedItem[i]){
                        if(j === 'id'){

                        }
                        else if(j === 'x'){
                            if(!droppedItem.x){
                                droppedItem.x = data.droppedItem[i].x;
                            }
                            else{
                                droppedItem.spdX = (data.droppedItem[i].x - droppedItem.x) / 4;
                            }
                        }
                        else if(j === 'y'){
                            if(!droppedItem.y){
                                droppedItem.y = data.droppedItem[i].y;
                            }
                            else{
                                droppedItem.spdY = (data.droppedItem[i].y - droppedItem.y) / 4;
                            }
                        }
                        else{
                            droppedItem[j] = data.droppedItem[i][j];
                        }
                    }
                }
                else{
                    new DroppedItem(data.droppedItem[i]);
                }
            }
        }
    }
    for(var i in Player.list){
        if(Player.list[i].updated === false){
            if(Player.list[i].fadeState === 1){
                Player.list[i].fadeState = 2;
                Player.list[i].fade = 0.99;
            }
        }
    }
    for(var i in Projectile.list){
        if(Projectile.list[i].updated === false){
            if(Projectile.list[i].relativeToParent === false){
                if(Projectile.list[i].fadeState === 1){
                    Projectile.list[i].fadeState = 2;
                    Projectile.list[i].fade = 0.99;
                }
            }
            else{
                delete Projectile.list[i];
            }
        }
    }
    for(var i in Monster.list){
        if(Monster.list[i].updated === false){
            if(Monster.list[i].fadeState === 1){
                Monster.list[i].fadeState = 2;
                Monster.list[i].fade = 0.99;
            }
        }
    }
    for(var i in Npc.list){
        if(Npc.list[i].updated === false){
            if(Npc.list[i].fadeState === 1){
                Npc.list[i].fadeState = 2;
                Npc.list[i].fade = 0.99;
            }
        }
    }
    for(var i in HarvestableNpc.list){
        if(HarvestableNpc.list[i].updated === false){
            if(HarvestableNpc.list[i].fadeState === 1){
                HarvestableNpc.list[i].fadeState = 2;
                HarvestableNpc.list[i].fade = 0.99;
            }
        }
    }
    for(var i in DroppedItem.list){
        if(DroppedItem.list[i].updated === false){
            delete DroppedItem.list[i];
        }
    }
});
socket.on('initEntity',function(data){
    if(data.type === "Player"){
        new Player(data);
    }
    else if(data.type === "Monster"){
        new Monster(data);
    }
    else if(data.type === "Projectile"){
        new Projectile(data);
    }
    else if(data.type === "Npc"){
        new Npc(data);
    }
});
socket.on('initEntities',function(data){
    Player.list = [];
    for(var i in data.player){
        new Player(data.player[i]);
    }
    Projectile.list = [];
    for(var i in data.projectile){
        new Projectile(data.projectile[i]);
    }
    Monster.list = [];
    for(var i in data.monster){
        new Monster(data.monster[i]);
    }
    Npc.list = [];
    for(var i in data.npc){
        new Npc(data.npc[i]);
    }
    DroppedItem.list = [];
    for(var i in data.droppedItem){
        new DroppedItem(data.droppedItem[i]);
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
    document.getElementById('healthBarText').innerHTML = 0 + " / " + Player.list[selfId].hpMax;
    document.getElementById('healthBarValue').style.width = "" + 150 * 0 / Player.list[selfId].hpMax + "px";
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
    document.getElementById('regionDisplay').innerHTML = data.teleport;
    if(shadeAmount < 0){
        shadeAmount = 0;
    }
    currentMap = data.teleport;
    shadeSpeed = 3 / 40;
});
socket.on('regionChange',function(data){
    document.getElementById('regionDisplay').innerHTML = data;
    mapShadeAmount = 0;
    mapShadeSpeed = 0.08;
});

var findChunk = function(pt,x,y){
    if(x !== undefined){
        return pt.map + ':' + Math.floor(pt.x / 1024 + x) * 16 + ':' + Math.floor(pt.y / 1024 + y) * 16 + ':';
    }
    else{
        return pt.map + ':' + Math.floor(pt.x / 1024) * 16 + ':' + Math.floor(pt.y / 1024) * 16 + ':';
    }
}

var increaseProjectileByParent = function(projectile){
    if(projectile.parentType === 'Player'){
        if(Player.list[projectile.relativeToParent]){
            projectile.x += Player.list[projectile.relativeToParent].x;
            projectile.y += Player.list[projectile.relativeToParent].y;
        }
    }
    else if(projectile.parentType === 'Monster'){
        if(Monster.list[projectile.relativeToParent]){
            projectile.x += Monster.list[projectile.relativeToParent].x;
            projectile.y += Monster.list[projectile.relativeToParent].y;
        }
    }
}
var decreaseProjectileByParent = function(projectile){
    if(projectile.parentType === 'Player'){
        if(Player.list[projectile.relativeToParent]){
            projectile.x -= Player.list[projectile.relativeToParent].x;
            projectile.y -= Player.list[projectile.relativeToParent].y;
        }
    }
    else if(projectile.parentType === 'Monster'){
        if(Monster.list[projectile.relativeToParent]){
            projectile.x -= Monster.list[projectile.relativeToParent].x;
            projectile.y -= Monster.list[projectile.relativeToParent].y;
        }
    }
}

var loop = function(){
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
        if(Player.list[i].toRemove){
            delete Player.list[i];
            continue;
        }
        Player.list[i].update();
    }
    for(var i in Monster.list){
        if(Monster.list[i].toRemove){
            delete Monster.list[i];
            continue;
        }
        Monster.list[i].update();
    }
    for(var i in Projectile.list){
        if(Projectile.list[i].toRemove){
            delete Projectile.list[i];
            continue;
        }
        Projectile.list[i].update();
    }
    for(var i in Npc.list){
        if(Npc.list[i].toRemove){
            delete Npc.list[i];
            continue;
        }
        Npc.list[i].update();
    }
    for(var i in DroppedItem.list){
        DroppedItem.list[i].update();
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
    if(mapData[Player.list[selfId].map].width > window.innerWidth){
        if(cameraX > -mapData[Player.list[selfId].map].x1){
            cameraX = -mapData[Player.list[selfId].map].x1;
        }
        if(cameraX < window.innerWidth - mapData[Player.list[selfId].map].x2){
            cameraX = window.innerWidth - mapData[Player.list[selfId].map].x2;
        }
    }
    if(mapData[Player.list[selfId].map].height > window.innerHeight){
        if(cameraY > -mapData[Player.list[selfId].map].y1){
            cameraY = -mapData[Player.list[selfId].map].y1;
        }
        if(cameraY < window.innerHeight - mapData[Player.list[selfId].map].y2){
            cameraY = window.innerHeight - mapData[Player.list[selfId].map].y2;
        }
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
    for(var i in HarvestableNpc.list){
        // for(var j = -1;j < 2;j++){
        //     for(var k = -1;k < 2;k++){
        //         if(findChunk(HarvestableNpc.list[i]) === findChunk(Player.list[selfId],j,k)){
                    HarvestableNpc.list[i].drawLayer0();
        //         }
        //     }
        // }
    }

    selected = false;

    var entities = [];
    for(var i in Player.list){
        // for(var j = -1;j < 2;j++){
        //     for(var k = -1;k < 2;k++){
        //         if(findChunk(Player.list[i]) === findChunk(Player.list[selfId],j,k)){
                    entities.push(Player.list[i]);
        //         }
        //     }
        // }
    }
    for(var i in Projectile.list){
        // increaseProjectileByParent(Projectile.list[i]);
        // for(var j = -1;j < 2;j++){
        //     for(var k = -1;k < 2;k++){
        //         if(findChunk(Projectile.list[i]) === findChunk(Player.list[selfId],j,k)){
                    entities.push(Projectile.list[i]);
        //         }
        //     }
        // }
        // decreaseProjectileByParent(Projectile.list[i]);
    }
    for(var i in Monster.list){
        // for(var j = -1;j < 2;j++){
        //     for(var k = -1;k < 2;k++){
        //         if(findChunk(Monster.list[i]) === findChunk(Player.list[selfId],j,k)){
                    entities.push(Monster.list[i]);
        //         }
        //     }
        // }
    }
    for(var i in Npc.list){
        // for(var j = -1;j < 2;j++){
        //     for(var k = -1;k < 2;k++){
        //         if(findChunk(Npc.list[i]) === findChunk(Player.list[selfId],j,k)){
                    entities.push(Npc.list[i]);
        //         }
        //     }
        // }
    }
    for(var i in DroppedItem.list){
        // for(var j = -1;j < 2;j++){
        //     for(var k = -1;k < 2;k++){
        //         if(findChunk(DroppedItem.list[i]) === findChunk(Player.list[selfId],j,k)){
                    entities.push(DroppedItem.list[i]);
        //         }
        //     }
        // }
    }
    function compare(a,b){
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
    entities.sort(compare);
    for(var i = 0;i < entities.length;i++){
        entities[i].draw();
    }

    for(var i = -1;i < 2;i++){
        for(var j = -1;j < 2;j++){
            if(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':' + Math.floor(tileAnimation) + ':']){
                ctx.drawImage(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':' + Math.floor(tileAnimation) + ':'].upper,(Math.floor(Player.list[selfId].x / 1024) + i) * 1024,(Math.floor(Player.list[selfId].y / 1024) + j) * 1024);
            }
        }
    }
    for(var i in HarvestableNpc.list){
        if(HarvestableNpc.list[i].toRemove){
            delete HarvestableNpc.list[i];
            continue;
        }
        // for(var j = -1;j < 2;j++){
        //     for(var k = -1;k < 2;k++){
        //         if(findChunk(HarvestableNpc.list[i]) === findChunk(Player.list[selfId],j,k)){
                    HarvestableNpc.list[i].drawLayer1();
        //         }
        //     }
        // }
    }

    ctx.globalAlpha = 0.5;
    ctx.drawImage(Img.select,64 * Math.floor((Player.list[selfId].x + mouseX) / 64),64 * Math.floor((Player.list[selfId].y + mouseY) / 64),64,64);
    ctx.globalAlpha = 1;

    for(var i in Player.list){
        // for(var j = -1;j < 2;j++){
        //     for(var k = -1;k < 2;k++){
        //         if(findChunk(Player.list[i]) === findChunk(Player.list[selfId],j,k)){
                    Player.list[i].drawHp();
        //         }
        //     }
        // }
    }
    for(var i in Monster.list){
        // for(var j = -1;j < 2;j++){
        //     for(var k = -1;k < 2;k++){
        //         if(findChunk(Monster.list[i]) === findChunk(Player.list[selfId],j,k)){
                    Monster.list[i].drawHp();
        //         }
        //     }
        // }
    }
    ctx.restore();

    if(mapShadeAmount >= 3.5){
        mapShadeSpeed = -0.12;
    }
    if(Player.list[selfId].map === currentMap && shadeAmount > 1.5){
        shadeSpeed = -3 / 40;
    }
    if(shadeAmount < 0.25 && mapShadeSpeed !== 0.08 && currentMap !== '' && shadeSpeed === -3 / 40){
        currentMap = '';
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
    window.requestAnimationFrame(loop);
}


document.onkeydown = function(event){
    if(chatPress){
        return;
    }
    if(!event.isTrusted){
        socket.emit('timeout');
    }
    var key = event.key || event.keyCode;
    if(key === 'i' || key === 'I'){
        toggleInventory();
    }
    if(key === 'c' || key === 'c'){
        toggleCraft();
    }
    if(key === 'Meta' || key === 'Alt' || key === 'Control'){
        socket.emit('keyPress',{inputId:'releaseAll'});
    }
    socket.emit('keyPress',{inputId:key,state:true});
}
document.onkeyup = function(event){
    chatPress = false;
    var key = event.key || event.keyCode;
    socket.emit('keyPress',{inputId:key,state:false});
}
document.onmousemove = function(event){
    if(selfId){
        var x = -cameraX - Player.list[selfId].x + event.clientX;
        var y = -cameraY - Player.list[selfId].y + event.clientY;
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
        mouseX = x;
        mouseY = y;
        rawMouseX = event.clientX;
        rawMouseY = event.clientY;
        socket.emit('keyPress',{inputId:'direction',state:{x:x,y:y}});
        // if(!talking){
        //     socket.emit('keyPress',{inputId:'direction',state:{x:x,y:y}});
        // }
        var inSlot = -1;
        var slotType = '';
        var inventorySlots = document.getElementsByClassName('inventorySlot');
        for(var i = 0;i < inventorySlots.length;i++){
            if(inventorySlots[i].className.includes('inventoryMenuSlot') && document.getElementById('inventoryDiv').style.display === 'inline-block'){
                var rect = inventorySlots[i].getBoundingClientRect();
                if(rawMouseX > rect.left){
                    if(rawMouseX < rect.right){
                        if(rawMouseY > rect.top){
                            if(rawMouseY < rect.bottom){
                                inSlot = inventorySlots[i].id.substring(13);
                                slotType = 'itemDescriptions';
                            }
                        }
                    }
                }
            }
            if(inventorySlots[i].className.includes('craftMenuSlot') && document.getElementById('craftDiv').style.display === 'inline-block'){
                var rect = inventorySlots[i].getBoundingClientRect();
                if(rawMouseX > rect.left){
                    if(rawMouseX < rect.right){
                        if(rawMouseY > rect.top){
                            if(rawMouseY < rect.bottom){
                                inSlot = inventorySlots[i].id.substring(9);
                                slotType = 'craftDescriptions';
                            }
                        }
                    }
                }
            }
        }
        var hotbarSlots = document.getElementsByClassName('hotbarSlot');
        for(var i = 0;i < hotbarSlots.length;i++){
            var rect = hotbarSlots[i].getBoundingClientRect();
            if(rawMouseX > rect.left){
                if(rawMouseX < rect.right){
                    if(rawMouseY > rect.top){
                        if(rawMouseY < rect.bottom){
                            inSlot = inventorySlots[i].id.substring(13);
                            slotType = 'itemDescriptions';
                        }
                    }
                }
            }
        }
        var itemMenu = document.getElementById('itemMenu');
        if(inSlot === -1 || inventory.draggingItem !== -1){
            if(itemMenu.style.display === 'inline-block'){
                itemMenu.style.display = 'none';
            }
        }
        else{
            if(itemMenu.style.display === 'none'){
                if(slotType === 'craftDescriptions'){
                    var rect = document.getElementById('craftBackground').getBoundingClientRect();
                    if(rawMouseX > rect.left){
                        if(rawMouseX < rect.right){
                            if(rawMouseY > rect.top){
                                if(rawMouseY < rect.bottom){
                                    itemMenu.style.display = 'inline-block';
                                    itemMenu.innerHTML = inventory[slotType][inSlot];
                                }
                            }
                        }
                    }

                }
                else if(inventory.items[inSlot].id){
                    var rect = document.getElementById('inventoryBackground').getBoundingClientRect();
                    if(rawMouseX > rect.left){
                        if(rawMouseX < rect.right){
                            if(rawMouseY > rect.top){
                                if(rawMouseY < rect.bottom){
                                    itemMenu.style.display = 'inline-block';
                                    itemMenu.innerHTML = inventory[slotType][inSlot];
                                }
                            }
                        }
                    }
                }
            }
            var rect = itemMenu.getBoundingClientRect();
            itemMenu.style.left = '';
            itemMenu.style.right = '';
            itemMenu.style.top = '';
            itemMenu.style.bottom = '';
            if(event.clientX + 3 + rect.right - rect.left > window.innerWidth){
                itemMenu.style.right = window.innerWidth - (event.clientX - 3) + 'px';
            }
            else{
                itemMenu.style.left = (event.clientX + 3) + 'px';
            }
            if(event.clientY + 3 + rect.bottom - rect.top > window.innerHeight){
                itemMenu.style.bottom = window.innerHeight - (event.clientY - 3) + 'px';
            }
            else{
                itemMenu.style.top = (event.clientY + 3) + 'px';
            }
        }
        if(inventory.draggingItem !== -1){
            document.getElementById('draggingItem').style.left = (event.clientX - inventory.draggingX) + 'px';
            document.getElementById('draggingItem').style.top = (event.clientY - inventory.draggingY) + 'px';
        }
        else{
            document.getElementById('draggingItem').style.left = '-100px';
            document.getElementById('draggingItem').style.top = '-100px';
        }
    }
}
document.onmouseup = function(event){
    if(inventory.draggingItem !== -1){
        document.getElementById('itemMenu').style.display = 'none';
        var rect = document.getElementById('inventoryDiv').getBoundingClientRect();
        if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
            var draggedItem = false;
            var inventorySlots = document.getElementsByClassName('inventorySlot');
            for(var i = 0;i < inventorySlots.length;i++){
                var rect = inventorySlots[i].getBoundingClientRect();
                if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
                    socket.emit('dragItem',{
                        index1:inventory.draggingItem,
                        index2:inventorySlots[i].id.substring(13),
                    });
                    inventory.draggingItem = -1;
                    draggedItem = true;
                }
            }
            if(draggedItem === false){
                inventory.refreshItem(inventory.draggingItem);
                inventory.draggingItem = -1;
            }
        }
        else{
            if(inventory.draggingItem !== -1){
                socket.emit('dragItem',{
                    index1:inventory.draggingItem,
                    index2:'drop',
                });
                inventory.draggingItem = -1;
            }
        }
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
mouseOut = function(event){
    scrollAllowed = false;
}
mouseIn = function(event){
    scrollAllowed = true;
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
window.addEventListener('wheel',function(event){
    if(scrollAllowed === false){
        return;
    }
    var hotbarSlots = document.getElementsByClassName('hotbarSlot');
    for(var i = 0;i < hotbarSlots.length;i++){
        hotbarSlots[i].style.border = '1px solid #000000';
    }
    if(event.deltaY < 0){
        inventory.hotbarSelectedItem -= 1;
    }
    else{
        inventory.hotbarSelectedItem += 1;
    }
    if(inventory.hotbarSelectedItem < 0){
        inventory.hotbarSelectedItem = 9;
    }
    else if(inventory.hotbarSelectedItem > 9){
        inventory.hotbarSelectedItem = 0;
    }
    document.getElementById('hotbarSlot' + inventory.hotbarSelectedItem).style.border = '1px solid #ffff00';
    socket.emit('hotbarSelectedItem',inventory.hotbarSelectedItem);
});