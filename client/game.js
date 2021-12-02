var isFirefox = typeof InstallTrigger !== 'undefined';
if(isFirefox === true){
    alert('This game uses OffscreenCanvas, which is not supported in Firefox.');
}
if(window.requestAnimationFrame === undefined){
    alert('This game uses RequestAnimationFrame, which is not supported in your browser.');
}

var VERSION = '0.0.9';

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
var teleportingMap = '';
var lastMap = '';

var respawnTimer = 0;

var inGame = false;

var getEntityDescription = function(entity){
    var description = '';
    description += entity.name !== undefined ? entity.name : entity.amount === 1 ? '<span style="color: ' + inventory.getRarityColor(Item.list[entity.item].rarity) + '">' + Item.list[entity.item].name + '</span>' : '<span style="color: ' + inventory.getRarityColor(Item.list[entity.item].rarity) + '">' + Item.list[entity.item].name + ' (' + entity.amount + ')</span>';
    description += '<br><div style="font-size: 11px">';
    if(entity.hp !== undefined){
        description += '<span style="color: #5ac54f">Health: ' + Math.max(Math.round(entity.hp),0) + ' / ' + entity.hpMax + ' (' + Math.ceil(entity.hp / entity.hpMax * 100) + '%)</span><br>';
    }
    if(entity.harvestHp !== undefined){
        description += '<span style="color: #5ac54f">Health: ' + Math.max(Math.round(entity.harvestHp),0) + ' / ' + entity.harvestHpMax + ' (' + Math.ceil(entity.harvestHp / entity.harvestHpMax * 100) + '%)</span><br>';
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
var ctxRaw = document.getElementById('ctx');
var ctx = document.getElementById("ctx").getContext("2d");
ctxRaw.style.width = window.innerWidth;
ctxRaw.style.height = window.innerHeight;
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
resetCanvas(ctx);

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
socket.on('updateInventory',function(pack){
    var items = pack.items;
    for(var i in inventory.items){
        if(items[i]){
            if(inventory.items[i].cooldown){
                items[i].cooldown = inventory.items[i].cooldown;
            }
            else{
                items[i].cooldown = 0;
            }
        }
    }
    inventory.items = items;
    inventory.refreshInventory();
});
socket.on('updateItem',function(pack){
    var items = pack.items;
    for(var i in inventory.items){
        if(items[i]){
            if(inventory.items[i].cooldown){
                items[i].cooldown = inventory.items[i].cooldown;
            }
            else{
                items[i].cooldown = 0;
            }
        }
    }
    inventory.items = items;
    inventory.refreshItem(pack.index);
});
socket.on('refreshMenu',function(pack){
    inventory.maxSlots = pack.maxSlots;
    inventory.refreshMenu(pack.oldMaxSlots);
});
socket.on('refreshCraft',function(pack){
    inventory.craftItems = pack;
    inventory.refreshCraft();
});
socket.on('itemChange',function(pack){
    for(var i in inventory.craftItems){
        inventory.updateCraftClient(i);
    }
    inventory.refreshShop();
});
socket.on('refreshShop',function(pack){
    shopHeader.innerHTML = pack + '\'s Shop';
    inventory.refreshShop(pack);
    openShop();
});

socket.on('openTrade',function(pack){
    openTrade();
    openInventory();
    canDragTradeItems = true;
    traderAccepted.innerHTML = 'Pending Accept';
    traderAccepted.style.color = '#eeee33';
    acceptTrade.style.display = 'inline-block';
    acceptTrade.innerHTML = 'Accept Trade';
    declineTrade.style.display = 'inline-block';
    traderLabel.innerHTML = pack + '\'s Items';
    for(var i = 0;i < 18;i++){
        inventory.items['trade' + i] = {};
    }
    inventory.refreshInventory();
});
socket.on('updateTrade',function(pack){
    if(pack.index >= 0 && pack.index <= 8){
        inventory.items['trade' + (9 + pack.index)] = {
            id:pack.id,
            amount:pack.amount,
        };
        inventory.refreshItem('trade' + (9 + pack.index));
    }
});
socket.on('closeTrade',function(pack){
    closeTrade();
});
socket.on('traderAccepted',function(pack){
    if(pack.final === false){
        traderAccepted.innerHTML = 'Trader Accepted';
        traderAccepted.style.color = '#33ee33';
    }
    else{
        traderAccepted.innerHTML = 'Trader Final Accepted';
        traderAccepted.style.color = '#33ee33';
    }
});
socket.on('finalAccept',function(data){
    traderAccepted.innerHTML = 'Pending Final Accept';
    traderAccepted.style.color = '#eeee33';
    acceptTrade.style.display = 'inline-block';
    acceptTrade.innerHTML = 'Final Accept';
    declineTrade.style.display = 'inline-block';
});

var canDragTradeItems = true;

acceptTrade.onclick = function(){
    acceptTrade.style.display = 'none';
    declineTrade.style.display = 'none';
    socket.emit('acceptTrade');
    canDragTradeItems = false;
}

declineTrade.onclick = function(){
    acceptTrade.style.display = 'none';
    declineTrade.style.display = 'none';
    socket.emit('declineTrade');
    canDragTradeItems = false;
}

var text = '';
var textIndex = 0;
var typeWriter = function(element,cb){
    if(textIndex < text.length){
        element.innerHTML += text.charAt(textIndex);
        textIndex += 1;
        setTimeout(function(){
            typeWriter(element,cb);
        },100 / settings.textSpeed);
    }
    else{
        cb();
    }
}

socket.on('dialogue',function(data){
    if(data.message){
        openDialogue();
        dialogueMessage.innerHTML = '';
        text = data.message;
        textIndex = 0;
        dialogueOption1.style.display = 'none';
        dialogueOption2.style.display = 'none';
        dialogueOption3.style.display = 'none';
        dialogueOption4.style.display = 'none';
        dialogueOption1.style.animationName = 'none';
        dialogueOption2.style.animationName = 'none';
        dialogueOption3.style.animationName = 'none';
        dialogueOption4.style.animationName = 'none';
        typeWriter(dialogueMessage,function(){
            if(data.option1){
                dialogueOption1.innerHTML = data.option1;
                dialogueOption1.style.display = 'inline-block';
                dialogueOption1.style.opacity = 0.7;
                dialogueOption1.style.animationName = 'fadeIn';
            }
            if(data.option2){
                dialogueOption2.innerHTML = data.option2;
                dialogueOption2.style.display = 'inline-block';
                dialogueOption2.style.opacity = 0.7;
                dialogueOption2.style.animationName = 'fadeIn';
            }
            if(data.option3){
                dialogueOption3.innerHTML = data.option3;
                dialogueOption3.style.display = 'inline-block';
                dialogueOption3.style.opacity = 0.7;
                dialogueOption3.style.animationName = 'fadeIn';
            }
            if(data.option4){
                dialogueOption4.innerHTML = data.option4;
                dialogueOption4.style.display = 'inline-block';
                dialogueOption4.style.opacity = 0.7;
                dialogueOption4.style.animationName = 'fadeIn';
            }
        });
    }
    else{
        closeDialogue();
    }
});

var dialogueResponse = function(response){
    socket.emit("dialogueResponse",response);
}

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
    if(isFirefox){
        var temp = document.createElement('canvas');
        temp.canvas.width = size * 4;
        temp.canvas.height = size * 4;
    }
    else{
        var temp = new OffscreenCanvas(size * 4,size * 4);
    }
    var gl = temp.getContext('2d');
    resetCanvas(gl);
    for(var i in img){
        if(img[i] !== "none"){
            gl.drawImage(Img[img[i]],0,0,size * 4,size * 4);
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

socket.on('selfId',function(data){
    var settingPlayers = document.getElementsByClassName('settingDropdown');
    for(var i = 0;i < settingPlayers.length;i++){
        for(var j = 0;j < settingPlayers[i].options.length;j++){
            if(settingPlayers[i].options[j].value === data.img[settingPlayers[i].name]){
                settingPlayers[i].selectedIndex = j;
            }
        }
    }
    signError.innerHTML = '<span style="color: #55ff55">Success! Server response recieved.</span><br>' + signError.innerHTML;
    setTimeout(function(){
        selfId = data.id;
        chat = '<div>Welcome to Meadow Guarder ' + VERSION + '!</div>';
        chatText.innerHTML = '<div>Welcome to Meadow Guarder ' + VERSION + '!</div>';
        gameDiv.style.display = 'inline-block';
        window.requestAnimationFrame(loop);
        socket.emit('signInFinished');
        canSignIn = true;
        tickArray = [];
        itemMenu.style.display = 'none';
        playSong('theMeadow');
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
                            player.spdX = (data.player[i].x - player.x) / 4;
                        }
                        else if(j === 'y'){
                            player.spdY = (data.player[i].y - player.y) / 4;
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
                        else if(j === 'img'){
                            player[j] = data.player[i][j];
                            player.render = renderPlayer(player[j]);
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
                            projectile.spdX = (data.projectile[i].x - projectile.x) / 4;
                        }
                        else if(j === 'y'){
                            projectile.spdY = (data.projectile[i].y - projectile.y) / 4;
                        }
                        else if(j === 'direction'){
                            if(data.projectile[i].direction % 360 - projectile.direction % 360 > 180){
                                projectile.spdDirection = ((data.projectile[i].direction % 360 - projectile.direction % 360) - 360) / 4;
                            }
                            else if(data.projectile[i].direction % 360 - projectile.direction % 360 < -180){
                                projectile.spdDirection = ((data.projectile[i].direction % 360 - projectile.direction % 360) + 360) / 4;
                            }
                            else{
                                projectile.spdDirection = (data.projectile[i].direction % 360 - projectile.direction % 360) / 4;
                            }
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
                            monster.spdX = (data.monster[i].x - monster.x) / 4;
                        }
                        else if(j === 'y'){
                            monster.spdY = (data.monster[i].y - monster.y) / 4;
                        }
                        else if(j === 'toRemove'){
                            monster[j] = data.monster[i][j];
                            monster.fadeState = 2;
                            monster.fade -= 0.05;
                            Particle.create(monster.x,monster.y,monster.map,'death',40);
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
                            npc.spdX = (data.npc[i].x - npc.x) / 4;
                        }
                        else if(j === 'y'){
                            npc.spdY = (data.npc[i].y - npc.y) / 4;
                        }
                        else if(j === 'toRemove'){
                            npc[j] = data.npc[i][j];
                            npc.fadeState = 2;
                            npc.fade -= 0.05;
                            Particle.create(npc.x,npc.y,npc.map,'death',40);
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
                            harvestableNpc.spdX = (data.harvestableNpc[i].x - harvestableNpc.x) / 4;
                        }
                        else if(j === 'y'){
                            harvestableNpc.spdY = (data.harvestableNpc[i].y - harvestableNpc.y) / 4;
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
                            droppedItem.spdX = (data.droppedItem[i].x - droppedItem.x) / 4;
                        }
                        else if(j === 'y'){
                            droppedItem.spdY = (data.droppedItem[i].y - droppedItem.y) / 4;
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
                if(Monster.list[i].monsterType === 'teneyedone'){
                    fadeOutSong('tenEyedOne');
                    fadeInSong('theMeadow');
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
    socket.emit('keyPress',{inputId:'releaseAll'});
});
var runRespawn = function(){
    socket.emit('respawn');
    gameDiv.style.display = 'inline-block';
    disconnectedDiv.style.display = 'none';
    deathDiv.style.display = 'none';
    pageDiv.style.display = 'none';
    itemMenu.style.display = 'none';
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
    lastMap = Player.list[selfId].map;
    shadeSpeed = 3 / 40;
    closeShop();
});
socket.on('regionChange',function(data){
    regionDisplay.innerHTML = data.region + '<div id="regionDisplaySmall" class="UI-text-light" onmousedown="mouseDown(event)" onmouseup="mouseUp(event)" onmouseover="mouseInGame(event);">' + data.mapName + '</div>';
    mapShadeAmount = 0;
    mapShadeSpeed = 0.08;
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
    ctx.fillStyle = '#354149';
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
    MGHC1();
    ctx.save();
    ctx.translate(cameraX,cameraY);
    for(var i = -1;i < 2;i++){
        for(var j = -1;j < 2;j++){
            if(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':']){
                ctx.drawImage(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':'].lower,(Math.floor(Player.list[selfId].x / 1024) + i) * 1024,(Math.floor(Player.list[selfId].y / 1024) + j) * 1024);
            }
        }
    }
    for(var i in HarvestableNpc.list){
        HarvestableNpc.list[i].drawLayer0();
    }

    selected = false;

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
    if(inGame){
        itemMenu.style.display = 'none';
    }
    for(var i in Particle.list){
        Particle.list[i].draw();
    }
    for(var i = 0;i < entities.length;i++){
        entities[i].draw();
        if(inGame && entities[i].name){
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

    for(var i = -1;i < 2;i++){
        for(var j = -1;j < 2;j++){
            if(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':']){
                ctx.drawImage(loadedMap[Player.list[selfId].map + ':' + (Math.floor(Player.list[selfId].x / 1024) + i) * 16 + ':' + (Math.floor(Player.list[selfId].y / 1024) + j) * 16 + ':'].upper,(Math.floor(Player.list[selfId].x / 1024) + i) * 1024,(Math.floor(Player.list[selfId].y / 1024) + j) * 1024);
            }
        }
    }
    for(var i in HarvestableNpc.list){
        HarvestableNpc.list[i].drawLayer1();
    }

    ctx.globalAlpha = 0.5;
    ctx.drawImage(Img.select,64 * Math.floor((Player.list[selfId].x + mouseX) / 64),64 * Math.floor((Player.list[selfId].y + mouseY) / 64),64,64);
    ctx.globalAlpha = 1;

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
    ctx.restore();

    if(mapShadeAmount >= 8.5){
        mapShadeSpeed = -0.12;
    }
    if(Player.list[selfId].map === teleportingMap && shadeAmount < 1){
        if(lastMap !== ''){
            Player.list[selfId].map = lastMap;
        }
    }
    if(Player.list[selfId].map === teleportingMap && shadeAmount > 1.5){
        shadeSpeed = -3 / 40;
        lastMap = '';
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
socket.on("attack",function(){
    for(var i in inventory.items){
        if(inventory.items[i]){
            if(inventory.items[i].id){
                if(Item.list[inventory.items[inventory.hotbarSelectedItem].id].equip === Item.list[inventory.items[i].id].equip){
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

socket.on('playerList',function(data){
    playerList.innerHTML = '';
    for(var i in data){
        playerList.innerHTML += data[i] + '<br>';
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
}

socket.on('rickroll',function(){
    window.location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
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
            itemAmount.className = 'UI-text-light itemAmount';
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
    tabVisible = true;
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
    if(key === 'p' || key === 'P'){
        togglePlayerList();
    }
    if(key === 'Enter'){
        chatInput.focus();
    }
    if(key === 'Meta' || key === 'Alt' || key === 'Control'){
        socket.emit('keyPress',{inputId:'releaseAll'});
    }
    socket.emit('keyPress',{inputId:key,state:true});
}
document.onkeyup = function(event){
    tabVisible = true;
    chatPress = false;
    var key = event.key || event.keyCode;
    socket.emit('keyPress',{inputId:key,state:false});
}
document.onmousemove = function(event){
    tabVisible = true;
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
        socket.emit('keyPress',{inputId:'leftClick',state:true});
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
    }
    scrollAllowed = false;
    inGame = false;
}
mouseInHotbar = function(event){
    tabVisible = true;
    if(inGame === true){
        itemMenu.style.display = 'none';
    }
    scrollAllowed = true;
    inGame = false;
}
document.querySelectorAll("button").forEach(function(item){
    item.addEventListener('focus',function(){
        this.blur();
    });
});
window.onresize = function(){
    tabVisible = true;
    pageDiv.style.backgroundSize = window.innerWidth + 'px,' + window.innerHeight + 'px';
    pageDiv.style.width = window.innerWidth + 'px';
    pageDiv.style.height = window.innerHeight + 'px';
}
document.oncontextmenu = function(event){
    tabVisible = true;
    event.preventDefault();
}
window.addEventListener('wheel',function(event){
    tabVisible = true;
    if(!selfId){
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

// if(navigator.webdriver === true){
//     disconnectClient();
// }