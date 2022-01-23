if(window.requestAnimationFrame === undefined){
    alert('This game uses RequestAnimationFrame, which is not supported in your browser.');
}

var VERSION = '0.1.1';

versionDiv.innerHTML = VERSION;

var socket = io({
    reconnection:false,
});
socket.on('connect_error',function(){
    setTimeout(function(){
        socket.connect();
    },1000);
});
socket.on('disconnect',function(){
    disconnectClient();
});

onGesture = function(){
    try{
        if(audioContext.state === 'suspended'){
            audioContext.resume();
        }
    }
    catch(err){

    }
    tabVisible = true;
}

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

var shadeSpeed = 0;
var shadeAmount = 1;
var mapShadeSpeed = 0;
var mapShadeAmount = 0;
var teleportingMap = '';
var worldRegion = '';

var respawnTimer = 0;

var fpsTimes = [];

var effectDarkness = 0;
var currentEffectDarkness = 0;
var effectDarknessSpeed = 0;

var inGame = false;

var getEntityDescription = function(entity){
    var description = '';
    description += entity.name !== undefined ? entity.name : entity.amount === 1 ? '<span style="color: ' + inventory.getRarityColor(Item.list[entity.item].rarity) + '">' + Item.list[entity.item].name + '</span>' : '<span style="color: ' + inventory.getRarityColor(Item.list[entity.item].rarity) + '">' + Item.list[entity.item].name + ' (' + entity.amount + ')</span>';
    description += '<br><div style="font-size: 11px">';
    if(entity.hp !== undefined){
        description += '<span style="color: #5ac54f">Health: ' + Math.max(Math.round(entity.hp),0) + ' / ' + entity.hpMax + ' (' + Math.max(Math.ceil(entity.hp / entity.hpMax * 100),0) + '%)</span><br>';
    }
    if(entity.harvestHp !== undefined){
        description += '<span style="color: #5ac54f">Health: ' + Math.max(Math.round(entity.harvestHp),0) + ' / ' + entity.harvestHpMax + ' (' + Math.max(Math.ceil(entity.harvestHp / entity.harvestHpMax * 100),0) + '%)</span><br>';
    }
    if(entity.xp !== undefined){
        description += '<span style="color: #cccc00">Xp: Level ' + entity.level + ' ' + entity.xp + ' / ' + entity.xpMax + ' (' + Math.ceil(entity.xp / entity.xpMax * 100) + '%)</span><br>';
    }
    if(entity.mana !== undefined){
        description += '<span style="color: #ff55ff">Mana: ' + Math.round(entity.mana) + ' / ' + entity.manaMax + ' (' + Math.ceil(entity.mana / entity.manaMax * 100) + '%)</span><br>';
    }
    if(entity.item !== undefined){
        description += inventory.getDescription(Item.list[entity.item]);
    }
    if(entity.type === 'Player'){
        if(entity.id !== selfId){
            description += 'Right click to initiate trade.';
        }
    }
    if(entity.type === 'Npc'){
        description += 'Right click to interact with ' + entity.name + '.';
    }
    description += '</div>';
    return description;
}

var resetCanvas = function(ctx){
    ctx.webkitImageSmoothingEnabled = false;
    ctx.filter = 'url(#remove-alpha)';
    ctx.imageSmoothingEnabled = false;
}
var map0Raw = document.getElementById('map0');
var map0 = document.getElementById("map0").getContext("2d");
map0Raw.style.width = window.innerWidth;
map0Raw.style.height = window.innerHeight;
map0.canvas.width = window.innerWidth;
map0.canvas.height = window.innerHeight;
resetCanvas(map0);
var ctx0Raw = document.getElementById('ctx0');
var ctx0 = document.getElementById("ctx0").getContext("2d");
ctx0Raw.style.width = window.innerWidth;
ctx0Raw.style.height = window.innerHeight;
ctx0.canvas.width = window.innerWidth;
ctx0.canvas.height = window.innerHeight;
resetCanvas(ctx0);
var map1Raw = document.getElementById('map1');
var map1 = document.getElementById("map1").getContext("2d");
map1Raw.style.width = window.innerWidth;
map1Raw.style.height = window.innerHeight;
map1.canvas.width = window.innerWidth;
map1.canvas.height = window.innerHeight;
resetCanvas(map1);
var particleCtxRaw = document.getElementById('particleCtx');
var particleCtx = document.getElementById("particleCtx").getContext("2d");
particleCtxRaw.style.width = window.innerWidth;
particleCtxRaw.style.height = window.innerHeight;
particleCtx.canvas.width = window.innerWidth;
particleCtx.canvas.height = window.innerHeight;
resetCanvas(particleCtx);
var ctx1Raw = document.getElementById('ctx1');
var ctx1 = document.getElementById("ctx1").getContext("2d");
ctx1Raw.style.width = window.innerWidth;
ctx1Raw.style.height = window.innerHeight;
ctx1.canvas.width = window.innerWidth;
ctx1.canvas.height = window.innerHeight;
resetCanvas(ctx1);
var darknessEffectCtxRaw = document.getElementById('darknessEffectCtx');
var darknessEffectCtx = document.getElementById("darknessEffectCtx").getContext("2d");
darknessEffectCtxRaw.style.width = window.innerWidth;
darknessEffectCtxRaw.style.height = window.innerHeight;
darknessEffectCtx.canvas.width = window.innerWidth;
darknessEffectCtx.canvas.height = window.innerHeight;
resetCanvas(darknessEffectCtx);

var Img = {};
Img.Human = new Image();
Img.Human.src = '/client/img/player/bodies/Human.png';
Img.Orc = new Image();
Img.Orc.src = '/client/img/player/bodies/Orc.png';
Img.Undead = new Image();
Img.Undead.src = '/client/img/player/bodies/Undead.png';
Img.Panda = new Image();
Img.Panda.src = '/client/img/player/bodies/Panda.png';
Img.Avian = new Image();
Img.Avian.src = '/client/img/player/bodies/Avian.png';
Img.select = new Image();
Img.select.src = '/client/img/select.png';
Img.items2 = new Image();
Img.items2.src = '/client/img/items2.png';
Img.items2select = new Image();
Img.items2select.src = '/client/img/items2select.png';

var inventory = new Inventory(socket,false);
var crafts = [];
socket.on('updateInventory',function(pack){
    inventory.items = pack.items;
    inventory.refreshInventory();
});
socket.on('updateItem',function(pack){
    inventory.items = pack.items;
    inventory.refreshItem(pack.index);
});
socket.on('refreshMenu',function(pack){
    inventory.maxSlots = pack.maxSlots;
    inventory.refreshMenu(pack.oldMaxSlots);
});
socket.on('refreshCraft',function(pack){
    crafts = pack;
    inventory.refreshCraft();
});
socket.on('itemChange',function(pack){
    for(var i in crafts){
        inventory.updateCraftClient(i);
    }
    inventory.refreshShop();
});
socket.on('refreshShop',function(pack){
    shopHeader.innerHTML = pack + '\'s Shop';
    inventory.refreshShop(pack);
    openShop();
});

Img.healthbar = new Image();
Img.healthbar.src = '/client/img/healthbar.png';

var renderPlayer = function(img,drawSize){
    if(drawSize === 'small'){
        var size = 16;
    }
    else if(drawSize === 'medium'){
        var size = 32;
    }
    else{
        var size = 32;
    }
    try{
        var temp = new OffscreenCanvas(size * 4,size * 4);
        var gl = temp.getContext('2d');
    }
    catch(err){
        var temp = document.createElement('canvas');
        var gl = temp.getContext('2d');
        gl.canvas.width = size * 4;
        gl.canvas.height = size * 4;
    }
    resetCanvas(gl);
    for(var i in img){
        if(img[i] !== "none"){
            if(Img[img[i]]){
                try{
                    gl.drawImage(Img[img[i]],0,0,size * 4,size * 4);
                }
                catch(err){
                    var src = Img[img[i]].src;
                    delete Img[img[i]];
                    Img[img[i]] = new Image();
                    Img[img[i]].src = src;
                    Img[img[i]].onload = function(){
                        return renderPlayer(img,drawSize);
                    }
                }
            }
        }
    }
    return temp;
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
        canvas.drawImage(img,32 * animation,32 * animationValue,32,32,x - size * 16,y - size * 24,size * 32,size * 32);
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

debuffDescriptions = [];

socket.on('selfId',function(data){
    var settingPlayers = document.getElementsByClassName('settingDropdown');
    for(var i = 0;i < settingPlayers.length;i++){
        for(var j = 0;j < settingPlayers[i].options.length;j++){
            if(settingPlayers[i].options[j].value === data.img[settingPlayers[i].name]){
                settingPlayers[i].selectedIndex = j;
            }
        }
    }
    currentWeather = data.weather;
    playerClan = data.clan;
    playerName = data.name;
    updateClan();
    signError.innerHTML = '<span style="color: #55ff55">Success! Server response recieved.</span><br>' + signError.innerHTML;
    setTimeout(function(){
        selfId = data.id;
        renderMap(Player.list[selfId].map,function(){
            shadeSpeed = -0.01;
        });
        chatText.innerHTML = '<div>Welcome to Meadow Guarder ' + VERSION + '!</div>';
        pageBackground.style.animation = 'none';
        gameDiv.style.display = 'inline-block';
        window.requestAnimationFrame(loop);
        socket.emit('signInFinished');
        canSignIn = true;
        itemMenu.style.display = 'none';
        debuffMenu.style.display = 'none';
        worldRegion = data.worldRegion;
        playRegionSong(worldRegion);
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
                            player.spdX = (data.player[i].x - player.x) / 3;
                            player.serverX = data.player[i].x;
                        }
                        else if(j === 'y'){
                            player.spdY = (data.player[i].y - player.y) / 3;
                            player.serverY = data.player[i].y;
                        }
                        else if(j === 'hp'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                healthBarText.innerHTML = player.hp + " / " + player.hpMax;
                                healthBarValue.style.width = "" + 150 * player.hp / player.hpMax + "px";
                            }
                        }
                        else if(j === 'hpMax'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                healthBarText.innerHTML = player.hp + " / " + player.hpMax;
                                healthBarValue.style.width = "" + 150 * player.hp / player.hpMax + "px";
                            }
                        }
                        else if(j === 'xp'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                xpBarText.innerHTML = player.xp + " / " + player.xpMax;
                                xpBarValue.style.width = "" + 150 * player.xp / player.xpMax + "px";
                            }
                        }
                        else if(j === 'xpMax'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                xpBarText.innerHTML = player.xp + " / " + player.xpMax;
                                xpBarValue.style.width = "" + 150 * player.xp / player.xpMax + "px";
                            }
                        }
                        else if(j === 'mana'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                manaBarText.innerHTML = player.mana + " / " + player.manaMax;
                                manaBarValue.style.width = "" + 150 * player.mana / player.manaMax + "px";
                            }
                        }
                        else if(j === 'manaMax'){
                            player[j] = Math.max(Math.round(data.player[i][j]),0);
                            if(data.player[i].id === selfId){
                                manaBarText.innerHTML = player.mana + " / " + player.manaMax;
                                manaBarValue.style.width = "" + 150 * player.mana / player.manaMax + "px";
                            }
                        }
                        else if(j === 'debuffs'){
                            var different = false;
                            if(!player[j]){
                                different = true;
                            }
                            else{
                                for(var k in data.player[i][j]){
                                    if(!player[j][k]){
                                        different = true;
                                    }
                                }
                                for(var k in player[j]){
                                    if(!data.player[i][j][k]){
                                        different = true;
                                    }
                                }
                            }
                            player[j] = data.player[i][j];
                            if(data.player[i].id === selfId){
                                if(different){
                                    var inSlot = false;
                                    effectDarkness = 0;
                                    debuffDiv.innerHTML = '';
                                    for(var k in data.player[i][j]){
                                        debuffDiv.innerHTML += '<div id="debuffSlot' + k + '" class="debuffSlot"></div>';
                                    }
                                    for(var k in data.player[i][j]){
                                        var createDebuff = function(index){
                                            var slot = document.getElementById('debuffSlot' + index);
                                            var debuff = debuffData[index];
                                            inventory.drawItem(slot,debuff.drawId,'small');
                                            if(debuff.darkness){
                                                effectDarkness += debuff.darkness;
                                            }
                                            var debuffName = debuff.name;
                                            var time = Math.ceil(data.player[i][j][index].time / 20);
                                            if(time >= 60){
                                                debuffName += ' (' + Math.ceil(time / 60) + 'm)';
                                            }
                                            else{
                                                debuffName += ' (' + time + 's)';
                                            }
                                            slot.style.backgroundImage = 'conic-gradient(rgba(255,0,0,0.5) ' + Math.ceil(data.player[i][j][index].time / data.player[i][j][index].totalTime * 100) + '%, rgba(255,255,255,0.3) ' + Math.ceil(data.player[i][j][index].time / data.player[i][j][index].totalTime * 100) + '% ' + Math.floor(100 - data.player[i][j][index].time / data.player[i][j][index].totalTime * 100) + '%)';
                                            debuffDescriptions[index] = '<span style="color: ' + inventory.getRarityColor(debuff.rarity) + '">' + debuffName + '</span><br><div style="font-size: 11px">' + inventory.getDescription(debuff) + '</div>';
                                            slot.onmouseover = function(){
                                                updateDebuffPopupMenu(index);
                                            }
                                            slot.onmouseout = function(){
                                                updateDebuffPopupMenu(-1);
                                            }
                                            var rect = slot.getBoundingClientRect();
                                            if(rawMouseX >= rect.left && rawMouseX <= rect.right && rawMouseY >= rect.top && rawMouseY <= rect.bottom){
                                                inSlot = true;
                                                updateDebuffPopupMenu(index);
                                            }
                                        }
                                        createDebuff(k);
                                    }
                                    if(effectDarkness === 0){
                                        effectDarknessSpeed = -0.02;
                                    }
                                    else{
                                        effectDarknessSpeed = 0.02;
                                    }
                                    if(inSlot === false){
                                        updateDebuffPopupMenu(-1);
                                    }
                                }
                                else{
                                    var inSlot = false;
                                    for(var k in data.player[i][j]){
                                        var index = k;
                                        var slot = document.getElementById('debuffSlot' + index);
                                        var debuff = debuffData[index];
                                        var debuffName = debuff.name;
                                        var time = Math.ceil(data.player[i][j][index].time / 20);
                                        if(time >= 60){
                                            debuffName += ' (' + Math.ceil(time / 60) + 'm)';
                                        }
                                        else{
                                            debuffName += ' (' + time + 's)';
                                        }
                                        slot.style.backgroundImage = 'conic-gradient(rgba(255,0,0,0.5) ' + Math.ceil(data.player[i][j][index].time / data.player[i][j][index].totalTime * 100) + '%, rgba(255,255,255,0.3) ' + Math.ceil(data.player[i][j][index].time / data.player[i][j][index].totalTime * 100) + '% ' + Math.floor(100 - data.player[i][j][index].time / data.player[i][j][index].totalTime * 100) + '%)';
                                        debuffDescriptions[index] = '<span style="color: ' + inventory.getRarityColor(debuff.rarity) + '">' + debuffName + '</span><br><div style="font-size: 11px">' + inventory.getDescription(debuff) + '</div>';
                                        var rect = slot.getBoundingClientRect();
                                        if(rawMouseX >= rect.left && rawMouseX <= rect.right && rawMouseY >= rect.top && rawMouseY <= rect.bottom){
                                            inSlot = true;
                                            updateDebuffPopupMenu(index);
                                        }
                                    }
                                    if(inSlot === false){
                                        updateDebuffPopupMenu(-1);
                                    }
                                }
                            }
                        }
                        else if(j === 'direction'){
                            player[j] = (data.player[i][j] + 360) % 360;
                        }
                        else if(j === 'img'){
                            for(var k in data.player[i][j]){
                                if(player[j][k] !== data.player[i][j][k]){
                                    player[j] = data.player[i][j];
                                    player.render = renderPlayer(player[j]);
                                    break;
                                }
                            }
                            player[j] = data.player[i][j];
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
                            projectile.spdX = (data.projectile[i].x - projectile.x) / 3;
                            projectile.serverX = data.projectile[i].x;
                        }
                        else if(j === 'y'){
                            projectile.spdY = (data.projectile[i].y - projectile.y) / 3;
                            projectile.serverY = data.projectile[i].y;
                        }
                        else if(j === 'direction'){
                            projectile.direction = projectile.direction % 360;
                            while(projectile.direction < 0){
                                projectile.direction += 360;
                            }
                            var direction = data.projectile[i][j];
                            if(direction - projectile.direction > 180){
                                direction -= 360;
                            }
                            else if(direction - projectile.direction < -180){
                                direction += 360;
                            }
                            projectile.spdDirection = (direction - projectile.direction) / 3;
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
                            monster.spdX = (data.monster[i].x - monster.x) / 3;
                            monster.serverX = data.monster[i].x;
                        }
                        else if(j === 'y'){
                            monster.spdY = (data.monster[i].y - monster.y) / 3;
                            monster.serverY = data.monster[i].y;
                        }
                        else if(j === 'direction'){
                            monster[j] = (data.monster[i][j] + 360) % 360;
                        }
                        else if(j === 'toRemove'){
                            monster[j] = data.monster[i][j];
                            monster.fadeState = 2;
                            monster.fade -= 0.05;
                            Particle.create(monster.x,monster.y,monster.map,'death',20);
                        }
                        else{
                            monster[j] = data.monster[i][j];
                        }
                    }
                    if(monster.boss === true){
                        startBossbar(monster.name,monster.hp,monster.hpMax);
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
                            npc.spdX = (data.npc[i].x - npc.x) / 3;
                            npc.serverX = data.npc[i].x;
                        }
                        else if(j === 'y'){
                            npc.spdY = (data.npc[i].y - npc.y) / 3;
                            npc.serverY = data.npc[i].y;
                        }
                        else if(j === 'direction'){
                            npc[j] = (data.npc[i][j] + 360) % 360;
                        }
                        else if(j === 'toRemove'){
                            npc[j] = data.npc[i][j];
                            npc.fadeState = 2;
                            npc.fade -= 0.05;
                            Particle.create(npc.x,npc.y,npc.map,'death',20);
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
                            harvestableNpc.spdX = (data.harvestableNpc[i].x - harvestableNpc.x) / 3;
                            harvestableNpc.serverX = data.harvestableNpc[i].x;
                        }
                        else if(j === 'y'){
                            harvestableNpc.spdY = (data.harvestableNpc[i].y - harvestableNpc.y) / 3;
                            harvestableNpc.serverY = data.harvestableNpc[i].y;
                        }
                        else if(j === 'toRemove'){
                            harvestableNpc[j] = data.harvestableNpc[i][j];
                            harvestableNpc.fadeState = 2;
                            harvestableNpc.fade -= 0.05;
                            harvestableNpc.harvestHp = 0;
                        }
                        else if(j === 'img'){
                            if(data.harvestableNpc[i][j] === "none" && harvestableNpc.fadeState === 1){
                                harvestableNpc.fadeState = 2;
                                harvestableNpc.fade -= 0.05;
                                harvestableNpc.harvestHp = 0;
                                harvestableNpc.toRemove = true;
                            }
                            else{
                                harvestableNpc[j] = data.harvestableNpc[i][j];
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
                            droppedItem.spdX = (data.droppedItem[i].x - droppedItem.x) / 3;
                            droppedItem.serverX = data.droppedItem[i].x;
                        }
                        else if(j === 'y'){
                            droppedItem.spdY = (data.droppedItem[i].y - droppedItem.y) / 3;
                            droppedItem.serverY = data.droppedItem[i].y;
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
            if(Player.list[i].toRemove === false){
                delete Player.list[i];
            }
        }
    }
    for(var i in Projectile.list){
        if(Projectile.list[i].updated === false){
            if(!Projectile.list[i].toRemove || Projectile.list[i].relativeToParent === true){
                delete Projectile.list[i];
            }
        }
    }
    for(var i in Monster.list){
        if(Monster.list[i].updated === false){
            if(!Monster.list[i].toRemove){
                if(Monster.list[i].boss === true){
                    if(Monster.list[i].bossMusic !== 'none'){
                        stopBossSong(Monster.list[i].bossMusic);
                    }
                    stopBossbar();
                }
                delete Monster.list[i];
            }
        }
    }
    for(var i in Npc.list){
        if(Npc.list[i].updated === false){
            if(Npc.list[i].toRemove === false){
                delete Npc.list[i];
            }
        }
    }
    for(var i in HarvestableNpc.list){
        if(HarvestableNpc.list[i].updated === false){
            if(HarvestableNpc.list[i].toRemove === false){
                delete HarvestableNpc.list[i];
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
socket.on('removePlayer',function(data){
    if(Player.list[data]){
        Player.list[data].toRemove = true;
        Player.list[data].fadeState = 2;
        Player.list[data].fade -= 0.05;
    }
});
socket.on('createParticle',function(data){
    Particle.create(data.x,data.y,data.map,data.particleType,data.number,data.value);
});
socket.on('disconnected',function(data){
    disconnectClient();
});
socket.on('death',function(data){
    gameDiv.style.display = 'inline-block';
    disconnectedDiv.style.display = 'none';
    deathDiv.style.display = 'inline-block';
    pageDiv.style.display = 'none';
    respawnTimer = 5;
    respawnTimerDiv.innerHTML = respawnTimer;
    respawn.style.display = 'none';
    setTimeout(updateRespawn,1500);
    healthBarText.innerHTML = 0 + " / " + Player.list[selfId].hpMax;
    healthBarValue.style.width = "" + 150 * 0 / Player.list[selfId].hpMax + "px";
    itemMenu.style.display = 'none';
    debuffMenu.style.display = 'none';
    socket.emit('keyPress',{inputId:'releaseAll'});
});
var runRespawn = function(){
    socket.emit('respawn');
    gameDiv.style.display = 'inline-block';
    disconnectedDiv.style.display = 'none';
    deathDiv.style.display = 'none';
    pageDiv.style.display = 'none';
    itemMenu.style.display = 'none';
    debuffMenu.style.display = 'none';
}
var updateRespawn = function(){
    if(deathDiv.style.display === 'none'){
        return;
    }
    respawnTimer = Math.max(respawnTimer - 1,0);
    respawnTimerDiv.innerHTML = respawnTimer;
    if(respawnTimer === 0){
        respawn.style.display = 'inline-block';
    }
    setTimeout(updateRespawn,1000);
}
socket.on('changeMap',function(data){
    if(shadeAmount < 0){
        shadeAmount = 0;
    }
    teleportingMap = data.teleport;
    shadeSpeed = 0.1;
    closeShop();
});
socket.on('regionChange',function(data){
    regionDisplay.innerHTML = data.region + '<div id="regionDisplaySmall" class="UI-text" onmousedown="mouseDown(event)" onmouseup="mouseUp(event)" onmouseover="mouseInGame(event);">' + data.mapName + '</div>';
    mapShadeAmount = 0;
    mapShadeSpeed = 0.08;
    if(selfId){
        if(Player.list[selfId].map === 'World'){
            if(worldRegion !== data.region){
                worldRegion = data.region;
                playRegionSong(data.region);
            }
        }
    }
});

var increaseProjectileByParent = function(projectile){
    if(projectile.relativeToParent){
        if(projectile.parentType === 'Player'){
            if(Player.list[projectile.parent]){
                projectile.x += Player.list[projectile.parent].x;
                projectile.y += Player.list[projectile.parent].y;
            }
        }
        else if(projectile.parentType === 'Monster'){
            if(Monster.list[projectile.parent]){
                projectile.x += Monster.list[projectile.parent].x;
                projectile.y += Monster.list[projectile.parent].y;
            }
        }
    }
}
var decreaseProjectileByParent = function(projectile){
    if(projectile.relativeToParent){
        if(projectile.parentType === 'Player'){
            if(Player.list[projectile.parent]){
                projectile.x -= Player.list[projectile.parent].x;
                projectile.y -= Player.list[projectile.parent].y;
            }
        }
        else if(projectile.parentType === 'Monster'){
            if(Monster.list[projectile.parent]){
                projectile.x -= Monster.list[projectile.parent].x;
                projectile.y -= Monster.list[projectile.parent].y;
            }
        }
    }
}

var MGHC = function(){};
var MGHC1 = function(){};

var loop = function(){
    var now = performance.now();
    while(fpsTimes.length > 0 && fpsTimes[0] <= now - 1000){
        fpsTimes.shift();
    }
    fpsTimes.push(now);
    if(fpsDisplay.innerHTML !== fpsTimes.length){
        fpsDisplay.innerHTML = fpsTimes.length;
    }
    
    if(!selfId){
        return;
    }
    if(!Player.list[selfId]){
        return;
    }
    if(WIDTH !== window.innerWidth || HEIGHT !== window.innerHeight){
        map0Raw.style.width = window.innerWidth;
        map0Raw.style.height = window.innerHeight;
        map0.canvas.width = window.innerWidth;
        map0.canvas.height = window.innerHeight;
        resetCanvas(map0);
        ctx0Raw.style.width = window.innerWidth;
        ctx0Raw.style.height = window.innerHeight;
        ctx0.canvas.width = window.innerWidth;
        ctx0.canvas.height = window.innerHeight;
        resetCanvas(ctx0);
        map1Raw.style.width = window.innerWidth;
        map1Raw.style.height = window.innerHeight;
        map1.canvas.width = window.innerWidth;
        map1.canvas.height = window.innerHeight;
        resetCanvas(map1);
        particleCtxRaw.style.width = window.innerWidth;
        particleCtxRaw.style.height = window.innerHeight;
        particleCtx.canvas.width = window.innerWidth;
        particleCtx.canvas.height = window.innerHeight;
        resetCanvas(particleCtx);
        ctx1Raw.style.width = window.innerWidth;
        ctx1Raw.style.height = window.innerHeight;
        ctx1.canvas.width = window.innerWidth;
        ctx1.canvas.height = window.innerHeight;
        resetCanvas(ctx1);
        darknessEffectCtxRaw.style.width = window.innerWidth;
        darknessEffectCtxRaw.style.height = window.innerHeight;
        darknessEffectCtx.canvas.width = window.innerWidth;
        darknessEffectCtx.canvas.height = window.innerHeight;
        resetCanvas(darknessEffectCtx);
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;
    }
    map0.fillStyle = '#354149';
    map0.fillRect(0,0,WIDTH,HEIGHT);
    ctx0.clearRect(0,0,WIDTH,HEIGHT);
    map1.clearRect(0,0,WIDTH,HEIGHT);
    particleCtx.clearRect(0,0,WIDTH,HEIGHT);
    ctx1.clearRect(0,0,WIDTH,HEIGHT);
    for(var i in Player.list){
        Player.list[i].update();
    }
    for(var i in Monster.list){
        Monster.list[i].update();
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
    }
    for(var i in Npc.list){
        Npc.list[i].update();
    }
    for(var i in DroppedItem.list){
        DroppedItem.list[i].update();
    }
    for(var i in Particle.list){
        Particle.list[i].update();
        if(Particle.list[i].toRemove === true){
            delete Particle.list[i];
        }
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
    var cameraChanged = false;
    if(mapData[Player.list[selfId].map].width > window.innerWidth){
        if(cameraX > -mapData[Player.list[selfId].map].x1){
            cameraX = -mapData[Player.list[selfId].map].x1;
            cameraChanged = true;
        }
        if(cameraX < window.innerWidth - mapData[Player.list[selfId].map].x2){
            cameraX = window.innerWidth - mapData[Player.list[selfId].map].x2;
            cameraChanged = true;
        }
    }
    if(mapData[Player.list[selfId].map].height > window.innerHeight){
        if(cameraY > -mapData[Player.list[selfId].map].y1){
            cameraY = -mapData[Player.list[selfId].map].y1;
            cameraChanged = true;
        }
        if(cameraY < window.innerHeight - mapData[Player.list[selfId].map].y2){
            cameraY = window.innerHeight - mapData[Player.list[selfId].map].y2;
            cameraChanged = true;
        }
    }
    if(cameraChanged){
        mouseX = -cameraX - Player.list[selfId].x + rawMouseX;
        mouseY = -cameraY - Player.list[selfId].y + rawMouseY;
        socket.emit('keyPress',{inputId:'direction',state:{x:mouseX,y:mouseY}});
    }
    // cameraX -= mouseCameraX;
    // cameraY -= mouseCameraY;
    cameraX = Math.round(cameraX);
    cameraY = Math.round(cameraY);

    if(shadeAmount > 1){
        socket.emit('teleportFadeIn');
    }
    if(Player.list[selfId].map === teleportingMap && shadeAmount > 1){
        mouseX = -cameraX - Player.list[selfId].x + rawMouseX;
        mouseY = -cameraY - Player.list[selfId].y + rawMouseY;
        socket.emit('keyPress',{inputId:'direction',state:{x:mouseX,y:mouseY}});
        if(Player.list[selfId].map === 'World'){
            setWeather(currentWeather);
        }
        else{
            resetWeather();
        }
        renderMap(teleportingMap,function(){
            shadeSpeed = -0.1;
        });
    }
    if(Player.list[selfId].map === teleportingMap && shadeAmount <= 0 && shadeSpeed < 0){
        teleportingMap = '';
        socket.emit('teleportFadeOut');
    }
    if(Player.list[selfId].map === 'World'){
        for(var i = -settings.renderDistance + 1;i < settings.renderDistance;i++){
            for(var j = -settings.renderDistance + 1;j < settings.renderDistance;j++){
                for(var k in weatherData[currentWeather].particles){
                    for(var l = 0;l < Math.ceil(weatherData[currentWeather].particles[k] * settings.particlesPercentage / 100);l++){
                        Particle.create((Math.floor(Player.list[selfId].x / 1024) + i) * 1024 + Math.random() * 1024,(Math.floor(Player.list[selfId].y / 1024) + j) * 1024 + Math.random() * 1024,Player.list[selfId].map,k,1,1);
                    }
                }
            }
        }
    }
    MGHC1();

    map0.save();
    map0.translate(cameraX,cameraY);
    for(var i = -settings.renderDistance + 1;i < settings.renderDistance;i++){
        for(var j = -settings.renderDistance + 1;j < settings.renderDistance;j++){
            if(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':']){
                map0.drawImage(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':'].lower,(Math.floor(Player.list[selfId].x / 1024) + i) * 1024,(Math.floor(Player.list[selfId].y / 1024) + j) * 1024);
            }
        }
    }
    map0.restore();
    ctx0.save();
    ctx0.translate(cameraX,cameraY);
    for(var i in HarvestableNpc.list){
        HarvestableNpc.list[i].drawLayer0();
    }

    var entities = [];
    for(var i in Player.list){
        entities.push(Player.list[i]);
    }
    for(var i in Projectile.list){
        increaseProjectileByParent(Projectile.list[i]);
        entities.push(Projectile.list[i]);
    }
    for(var i in Monster.list){
        entities.push(Monster.list[i]);
    }
    for(var i in Npc.list){
        entities.push(Npc.list[i]);
    }
    for(var i in DroppedItem.list){
        entities.push(DroppedItem.list[i]);
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
    selectedDroppedItem = null;
    if(inGame){
        itemMenu.style.display = 'none';
    }
    debuffDisplayed = false;
    if(debuffMenu.style.display !== 'none'){
        debuffDisplayed = true;
    }
    for(var i = 0;i < entities.length;i++){
        entities[i].draw();
        if(inGame && entities[i].name && selectedDroppedItem === null && !debuffDisplayed){
            if(entities[i].isColliding({x:mouseX + Player.list[selfId].x,y:mouseY + Player.list[selfId].y,width:0,height:0})){
                itemMenu.innerHTML = getEntityDescription(entities[i]);
                itemMenu.style.display = 'inline-block';
                var rect = itemMenu.getBoundingClientRect();
                itemMenu.style.left = '';
                itemMenu.style.right = '';
                itemMenu.style.top = '';
                itemMenu.style.bottom = '';
                if(rawMouseX + rect.right - rect.left > window.innerWidth){
                    itemMenu.style.right = window.innerWidth - rawMouseX + 'px';
                }
                else{
                    itemMenu.style.left = rawMouseX + 'px';
                }
                if(rawMouseY + rect.bottom - rect.top > window.innerHeight){
                    itemMenu.style.bottom = window.innerHeight - rawMouseY + 'px';
                }
                else{
                    itemMenu.style.top = rawMouseY + 'px';
                }
            }
        }
    }
    for(var i in Projectile.list){
        decreaseProjectileByParent(Projectile.list[i]);
    }

    for(var i in Player.list){
        Player.list[i].drawLayer1();
    }
    for(var i in HarvestableNpc.list){
        HarvestableNpc.list[i].drawLayer1();
    }
    ctx0.restore();
    map1.save();
    map1.translate(cameraX,cameraY);
    for(var i = -settings.renderDistance + 1;i < settings.renderDistance;i++){
        for(var j = -settings.renderDistance + 1;j < settings.renderDistance;j++){
            if(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':']){
                map1.drawImage(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':'].upper,(Math.floor(Player.list[selfId].x / 1024) + i) * 1024,(Math.floor(Player.list[selfId].y / 1024) + j) * 1024);
            }
        }
    }
    map1.restore();
    particleCtx.save();
    particleCtx.translate(cameraX,cameraY);
    for(var i in Particle.list){
        Particle.list[i].draw();
    }
    particleCtx.restore();
    ctx1.save();
    ctx1.translate(cameraX,cameraY);

    ctx1.globalAlpha = 0.5;
    ctx1.drawImage(Img.select,64 * Math.floor((Player.list[selfId].x + mouseX) / 64),64 * Math.floor((Player.list[selfId].y + mouseY) / 64),64,64);
    ctx1.globalAlpha = 1;

    for(var i in Player.list){
        Player.list[i].drawHp();
    }
    for(var i in Monster.list){
        Monster.list[i].drawHp();
    }
    for(var i in Npc.list){
        Npc.list[i].drawHp();
    }
    for(var i in HarvestableNpc.list){
        HarvestableNpc.list[i].drawHp();
    }

    ctx1.restore();

    if(currentEffectDarkness !== 0){
        darknessEffectCtx.clearRect(0,0,WIDTH,HEIGHT);
        var grd = darknessEffectCtx.createRadialGradient(cameraX + Player.list[selfId].x,cameraY + Player.list[selfId].y,50,cameraX + Player.list[selfId].x,cameraY + Player.list[selfId].y,500);
        grd.addColorStop(0,"rgba(0,0,0,0)");
        grd.addColorStop(1,"rgba(0,0,0," + currentEffectDarkness + ")");
        darknessEffectCtx.fillStyle = grd;
        darknessEffectCtx.fillRect(cameraX + Player.list[selfId].x - WIDTH,cameraY + Player.list[selfId].y - HEIGHT,WIDTH * 2,HEIGHT * 2);
    }
    else{
        darknessEffectCtx.clearRect(0,0,WIDTH,HEIGHT);
    }
    currentEffectDarkness += effectDarknessSpeed;
    if(effectDarknessSpeed > 0 && currentEffectDarkness > effectDarkness){
        currentEffectDarkness = effectDarkness;
        effectDarknessSpeed = 0;
    }
    if(effectDarknessSpeed < 0 && currentEffectDarkness < effectDarkness){
        currentEffectDarkness = effectDarkness;
        effectDarknessSpeed = 0;
    }

    if(mapShadeAmount >= 8.5){
        mapShadeSpeed = -0.12;
    }
    shadeAmount += shadeSpeed;
    mapShadeAmount += mapShadeSpeed;
    if(shadeAmount >= -1){
        mapFade.style.opacity = shadeAmount;
    }
    if(mapShadeAmount >= -1){
        regionDisplay.style.opacity = mapShadeAmount;
    }
    MGHC();

    window.requestAnimationFrame(loop);
}

socket.on("nextReload",function(){
    for(var i in inventory.items){
        if(inventory.items[i]){
            if(inventory.items[i].id){
                if(inventory.items[i].cooldown > 0){
                    inventory.items[i].cooldown -= 1;
                    document.getElementById('cooldownDiv' + i).style.height = 100 * inventory.items[i].cooldown / Item.list[inventory.items[i].id].useTime + '%';
                    if(i >= 0 && i <= 9){
                        document.getElementById('hotbarCooldownDiv' + i).style.height = 100 * inventory.items[i].cooldown / Item.list[inventory.items[i].id].useTime + '%';
                    }
                }
            }
        }
    }
});
socket.on("attack",function(type){
    for(var i in inventory.items){
        if(inventory.items[i]){
            if(inventory.items[i].id){
                if(type === Item.list[inventory.items[i].id].type){
                    inventory.items[i].cooldown = Item.list[inventory.items[i].id].useTime;
                    document.getElementById('cooldownDiv' + i).style.height = '100%';
                    if(i >= 0 && i <= 9){
                        document.getElementById('hotbarCooldownDiv' + i).style.height = '100%';
                    }
                }
            }
        }
    }
});

disconnectClient = function(){
    disconnectedDiv.style.display = 'inline-block';
    if(selfId){
        Player.list[selfId].spdX = 0;
        Player.list[selfId].spdY = 0;
    }
    setTimeout(function(){
        location.reload();
    },5000);
    socket.emit('timeout');
    selfId = null;
    stopAllSongs();
}

doRickroll = function(){
    disconnectClient = function(){};
    pageDiv.style.display = 'none';
    gameDiv.style.display = 'none';
    disconnectedDiv.style.display = 'none';
    socket.emit('timeout');
    selfId = null;
    stopAllSongs();
    rickroll.play();
}

socket.on('rickroll',function(){
    doRickroll();
});


updateInventoryPopupMenu = function(slotType,index){
    if(index === -1){
        itemMenu.style.display = 'none';
        return;
    }
    if(inventory[slotType][index] === undefined){
        return;
    }
    itemMenu.style.display = 'inline-block';
    itemMenu.innerHTML = inventory[slotType][index];
    var rect = itemMenu.getBoundingClientRect();
    itemMenu.style.left = '';
    itemMenu.style.right = '';
    itemMenu.style.top = '';
    itemMenu.style.bottom = '';
    if(rawMouseX + rect.right - rect.left > window.innerWidth){
        itemMenu.style.right = window.innerWidth - rawMouseX + 'px';
    }
    else{
        itemMenu.style.left = rawMouseX + 'px';
    }
    if(rawMouseY + rect.bottom - rect.top > window.innerHeight){
        itemMenu.style.bottom = window.innerHeight - rawMouseY + 'px';
    }
    else{
        itemMenu.style.top = rawMouseY + 'px';
    }
}
updateDebuffPopupMenu = function(index){
    if(index === -1){
        debuffMenu.style.display = 'none';
        return;
    }
    debuffMenu.style.display = 'inline-block';
    debuffMenu.innerHTML = debuffDescriptions[index];
    var rect = debuffMenu.getBoundingClientRect();
    debuffMenu.style.left = '';
    debuffMenu.style.right = '';
    debuffMenu.style.top = '';
    debuffMenu.style.bottom = '';
    if(rawMouseX + rect.right - rect.left > window.innerWidth){
        debuffMenu.style.right = window.innerWidth - rawMouseX + 'px';
    }
    else{
        debuffMenu.style.left = rawMouseX + 'px';
    }
    if(rawMouseY + rect.bottom - rect.top > window.innerHeight){
        debuffMenu.style.bottom = window.innerHeight - rawMouseY + 'px';
    }
    else{
        debuffMenu.style.top = rawMouseY + 'px';
    }
}
updateClanPopupMenu = function(index){
    if(index === -1){
        itemMenu.style.display = 'none';
        return;
    }
    if(clanDescriptions[index] === undefined){
        return;
    }
    itemMenu.style.display = 'inline-block';
    itemMenu.innerHTML = clanDescriptions[index];
    var rect = itemMenu.getBoundingClientRect();
    itemMenu.style.left = '';
    itemMenu.style.right = '';
    itemMenu.style.top = '';
    itemMenu.style.bottom = '';
    if(rawMouseX + rect.right - rect.left > window.innerWidth){
        itemMenu.style.right = window.innerWidth - rawMouseX + 'px';
    }
    else{
        itemMenu.style.left = rawMouseX + 'px';
    }
    if(rawMouseY + rect.bottom - rect.top > window.innerHeight){
        itemMenu.style.bottom = window.innerHeight - rawMouseY + 'px';
    }
    else{
        itemMenu.style.top = rawMouseY + 'px';
    }
}
dropItem = function(click){
    socket.emit('dragItem',{
        index1:-1,
        index2:"drop",
        click:click,
    });
    inventory.runDraggingItem({
        index1:-1,
        index2:"drop",
        click:click,
    });
    itemMenu.style.display = 'none';
    if(inventory.draggingItem.id){
        draggingItem.style.display = 'inline-block';
        draggingItem.innerHTML = '';
        inventory.drawItem(draggingItem,Item.list[inventory.draggingItem.id].drawId,true);
        draggingItem.style.left = (rawMouseX - 32) + 'px';
        draggingItem.style.top = (rawMouseY - 32) + 'px';
        if(inventory.draggingItem.amount !== 1){
            var itemAmount = document.createElement('div');
            itemAmount.innerHTML = inventory.draggingItem.amount;
            itemAmount.className = 'UI-text itemAmount';
            var itemAmountDiv = document.createElement('div');
            itemAmountDiv.className = 'itemAmountLargeDiv';
            itemAmountDiv.appendChild(itemAmount);
            draggingItem.appendChild(itemAmountDiv);
        }
        var cooldownDiv = document.createElement('div');
        cooldownDiv.className = 'cooldownDiv';
        cooldownDiv.style.height = 100 * inventory.draggingItem.cooldown / Item.list[inventory.draggingItem.id].useTime + "%";
        draggingItem.appendChild(cooldownDiv);
    }
    else{
        draggingItem.style.display = 'none';
    }
}

releaseAll = function(){
    socket.emit('keyPress',{inputId:"releaseAll"});
}

document.onkeydown = function(event){
    onGesture();
    if(!selfId){
        return;
    }
    if(chatPress){
        var key = event.key || event.keyCode;
        if(key === 'ArrowUp'){
            commandIndex = Math.max(commandIndex - 1,0);
            if(commandIndex >= 0 && commandIndex < commandList.length){
                chatInput.value = commandList[commandIndex];
            }
            event.preventDefault();
        }
        if(key === 'ArrowDown'){
            commandIndex = Math.min(commandIndex + 1,commandList.length - 1);
            if(commandIndex >= 0 && commandIndex < commandList.length){
                chatInput.value = commandList[commandIndex];
            }
            event.preventDefault();
        }
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
    if(key === 'b' || key === 'B'){
        toggleSetting();
    }
    if(key === 'k' || key === 'K'){
        toggleBook();
    }
    if(key === 'Enter' || key === '/'){
        chatInput.focus();
    }
    if(key === 'Enter'){
        event.preventDefault();
    }
    if(key === 'Meta' || key === 'Alt' || key === 'Control'){
        socket.emit('keyPress',{inputId:'releaseAll'});
    }
    socket.emit('keyPress',{inputId:key,state:true});
}
document.onkeyup = function(event){
    onGesture();
    chatPress = false;
    var key = event.key || event.keyCode;
    socket.emit('keyPress',{inputId:key,state:false});
}
document.onmousemove = function(event){
    onGesture();
    if(selfId){
        var x = -cameraX - Player.list[selfId].x + event.clientX;
        var y = -cameraY - Player.list[selfId].y + event.clientY;
        if(event.clientY > window.innerHeight){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        mouseX = x;
        mouseY = y;
        rawMouseX = event.clientX;
        rawMouseY = event.clientY;
        socket.emit('keyPress',{inputId:'direction',state:{x:x,y:y}});
        if(inventory.draggingItem.id){
            draggingItem.style.left = (rawMouseX - 32) + 'px';
            draggingItem.style.top = (rawMouseY - 32) + 'px';
        }
        else{
            draggingItem.style.left = '-100px';
            draggingItem.style.top = '-100px';
        }
        if(itemMenu.style.display === 'inline-block'){
            var rect = itemMenu.getBoundingClientRect();
            itemMenu.style.left = '';
            itemMenu.style.right = '';
            itemMenu.style.top = '';
            itemMenu.style.bottom = '';
            if(rawMouseX + rect.right - rect.left > window.innerWidth){
                itemMenu.style.right = window.innerWidth - rawMouseX + 'px';
            }
            else{
                itemMenu.style.left = rawMouseX + 'px';
            }
            if(rawMouseY + rect.bottom - rect.top > window.innerHeight){
                itemMenu.style.bottom = window.innerHeight - rawMouseY + 'px';
            }
            else{
                itemMenu.style.top = rawMouseY + 'px';
            }
        }
        if(debuffMenu.style.display === 'inline-block'){
            var rect = debuffMenu.getBoundingClientRect();
            debuffMenu.style.left = '';
            debuffMenu.style.right = '';
            debuffMenu.style.top = '';
            debuffMenu.style.bottom = '';
            if(rawMouseX + rect.right - rect.left > window.innerWidth){
                debuffMenu.style.right = window.innerWidth - rawMouseX + 'px';
            }
            else{
                debuffMenu.style.left = rawMouseX + 'px';
            }
            if(rawMouseY + rect.bottom - rect.top > window.innerHeight){
                debuffMenu.style.bottom = window.innerHeight - rawMouseY + 'px';
            }
            else{
                debuffMenu.style.top = rawMouseY + 'px';
            }
        }
    }
    else{
        mouseX = event.clientX;
        mouseY = event.clientY;
        rawMouseX = event.clientX;
        rawMouseY = event.clientY;
    }
}
var tabVisible = true;
document.addEventListener("visibilitychange",function(){
    tabVisible = !tabVisible;
    socket.emit('init');
    socket.emit('keyPress',{inputId:"releaseAll",state:true});
});
mouseDown = function(event){
    tabVisible = true;
    if(inventory.draggingItem.id){
        return;
    }
    if(document.activeElement === chatInput || document.activeElement === craftInput){
        return;
    }
    if(!event.isTrusted){
        socket.emit('timeout');
    }
    if(event.button === 0){
        socket.emit('keyPress',{inputId:'leftClick',state:true,selectedDroppedItem:selectedDroppedItem});
    }
    if(event.button === 2){
        socket.emit('keyPress',{inputId:'rightClick',state:true});
    }
}
mouseUp = function(event){
    tabVisible = true;
    if(event.button === 0){
        socket.emit('keyPress',{inputId:'leftClick',state:false});
    }
    if(event.button === 2){
        socket.emit('keyPress',{inputId:'rightClick',state:false});
    }
}
mouseInGame = function(event){
    tabVisible = true;
    scrollAllowed = true;
    inGame = true;
}
mouseInMenu = function(event){
    tabVisible = true;
    if(inGame === true){
        itemMenu.style.display = 'none';
        debuffMenu.style.display = 'none';
    }
    scrollAllowed = false;
    inGame = false;
    socket.emit('keyPress',{inputId:'leftClick',state:false});
    socket.emit('keyPress',{inputId:'rightClick',state:false});
}
mouseInHotbar = function(event){
    tabVisible = true;
    if(inGame === true){
        itemMenu.style.display = 'none';
        debuffMenu.style.display = 'none';
    }
    scrollAllowed = true;
    inGame = false;
    socket.emit('keyPress',{inputId:'leftClick',state:false});
    socket.emit('keyPress',{inputId:'rightClick',state:false});
}
document.querySelectorAll("button").forEach(function(item){
    item.addEventListener('focus',function(){
        this.blur();
    });
});
window.onresize = function(){
    onGesture();
    pageDiv.style.backgroundSize = window.innerWidth + 'px,' + window.innerHeight + 'px';
    pageDiv.style.width = window.innerWidth + 'px';
    pageDiv.style.height = window.innerHeight + 'px';
}
document.onclick = function(){
    onGesture();
}
document.oncontextmenu = function(event){
    onGesture();
    event.preventDefault();
}
window.addEventListener('wheel',function(event){
    tabVisible = true;
    if(!selfId){
        return;
    }
    if(inMap){
        if(event.deltaY < 0){
            mapSize *= 1.1;
            var rect = worldMap.getBoundingClientRect();
            worldMap.style.top = (worldMap.offsetTop + (rect.top - rawMouseY) * 0.1) + "px";
            worldMap.style.left = (worldMap.offsetLeft + (rect.left - rawMouseX) * 0.1) + "px";
            worldMap.style.backgroundSize = mapSize + '%';
        }
        else{
            mapSize /= 1.1;
            var rect = worldMap.getBoundingClientRect();
            worldMap.style.top = (worldMap.offsetTop + (rect.top - rawMouseY) * -0.09) + "px";
            worldMap.style.left = (worldMap.offsetLeft + (rect.left - rawMouseX) * -0.09) + "px";
            worldMap.style.backgroundSize = mapSize + '%';
        }
        return;
    }
    if(scrollAllowed === false){
        return;
    }
    var hotbarSlots = document.getElementsByClassName('hotbarSlot');
    for(var i = 0;i < hotbarSlots.length;i++){
        hotbarSlots[i].style.border = '1px solid #000000';
        hotbarSlots[i].className = 'hotbarSlot hotbarSlotNormal';
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
    document.getElementById('hotbarSlot' + inventory.hotbarSelectedItem).className = 'hotbarSlot hotbarSlotSelected';
    socket.emit('hotbarSelectedItem',inventory.hotbarSelectedItem);
});