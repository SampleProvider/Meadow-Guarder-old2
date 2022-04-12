javascript:
var hackedDiv = document.createElement('div');
gameDiv.appendChild(hackedDiv);
hackedDiv.style.position = 'absolute';
hackedDiv.style.top = '0px';
hackedDiv.style.left = '170px';
hackedDiv.backgroundColor = 'none';

var tracersColumn = document.createElement('div');
tracersColumn.className = 'UI-display';
hackedDiv.appendChild(tracersColumn);
tracersColumn.style.top = '25px';
tracersColumn.style.left = '0px';
tracersColumn.style.width = '88px';
tracersColumn.style.display = 'none';

var tracersButton = document.createElement('button');
tracersButton.className = 'UI-button';
hackedDiv.appendChild(tracersButton);
tracersButton.innerHTML = 'Tracers';
tracersButton.style.top = '0px';
tracersButton.style.left = '0px';
tracersButton.style.width = '100px';
var tracersOpen = false;
tracersButton.onclick = function(){
    tracersOpen = !tracersOpen;
    if(tracersOpen){
        tracersColumn.style.display = 'inline-block';
    }
    else{
        tracersColumn.style.display = 'none';
    }
};

var monsterTracers = document.createElement('button');
monsterTracers.className = 'UI-button';
monsterTracers.style.position = 'static';
monsterTracers.style.top = '8px';
monsterTracers.style.width = '100%';
monsterTracers.innerHTML = 'Monster Tracers';
tracersColumn.appendChild(monsterTracers);

var monsterTracersState = false;
monsterTracers.onclick = function(){
    monsterTracersState = !monsterTracersState;
    if(monsterTracersState){
        monsterTracers.style.color = '#ffffff';
        monsterTracers.style.backgroundColor = '#725640';
    }
    else{
        monsterTracers.style.color = '#ffffff';
        monsterTracers.style.backgroundColor = '#362a1e';
    }
};

var playerTracers = document.createElement('button');
playerTracers.className = 'UI-button';
playerTracers.style.position = 'static';
playerTracers.style.top = '8px';
playerTracers.style.width = '100%';
playerTracers.innerHTML = 'Player Tracers';
tracersColumn.appendChild(playerTracers);

var playerTracersState = false;
playerTracers.onclick = function(){
    playerTracersState = !playerTracersState;
    if(playerTracersState){
        playerTracers.style.color = '#ffffff';
        playerTracers.style.backgroundColor = '#725640';
    }
    else{
        playerTracers.style.color = '#ffffff';
        playerTracers.style.backgroundColor = '#362a1e';
    }
};

var npcTracers = document.createElement('button');
npcTracers.className = 'UI-button';
npcTracers.style.position = 'static';
npcTracers.style.top = '8px';
npcTracers.style.width = '100%';
npcTracers.innerHTML = 'Npc Tracers';
tracersColumn.appendChild(npcTracers);

var npcTracersState = false;
npcTracers.onclick = function(){
    npcTracersState = !npcTracersState;
    if(npcTracersState){
        npcTracers.style.color = '#ffffff';
        npcTracers.style.backgroundColor = '#725640';
    }
    else{
        npcTracers.style.color = '#ffffff';
        npcTracers.style.backgroundColor = '#362a1e';
    }
};

var attacksColumn = document.createElement('div');
attacksColumn.className = 'UI-display';
hackedDiv.appendChild(attacksColumn);
attacksColumn.style.top = '25px';
attacksColumn.style.left = '100px';
attacksColumn.style.width = '88px';
attacksColumn.style.display = 'none';

var attacksButton = document.createElement('button');
attacksButton.className = 'UI-button';
hackedDiv.appendChild(attacksButton);
attacksButton.innerHTML = 'Attacks';
attacksButton.style.top = '0px';
attacksButton.style.left = '100px';
attacksButton.style.width = '100px';
var attacksOpen = false;
attacksButton.onclick = function(){
    attacksOpen = !attacksOpen;
    if(attacksOpen){
        attacksColumn.style.display = 'inline-block';
    }
    else{
        attacksColumn.style.display = 'none';
    }
};

var attackMonsters = document.createElement('button');
attackMonsters.className = 'UI-button';
attackMonsters.style.position = 'static';
attackMonsters.style.top = '8px';
attackMonsters.style.width = '100%';
attackMonsters.innerHTML = 'Attack Monsters';
attacksColumn.appendChild(attackMonsters);

var attackMonstersState = false;
attackMonsters.onclick = function(){
    attackMonstersState = !attackMonstersState;
    if(attackMonstersState){
        attackMonsters.style.color = '#ffffff';
        attackMonsters.style.backgroundColor = '#725640';
    }
    else{
        attackMonsters.style.color = '#ffffff';
        attackMonsters.style.backgroundColor = '#362a1e';
    }
};

var attackPlayers = document.createElement('button');
attackPlayers.className = 'UI-button';
attackPlayers.style.position = 'static';
attackPlayers.style.top = '8px';
attackPlayers.style.width = '100%';
attackPlayers.innerHTML = 'Attack Players';
attacksColumn.appendChild(attackPlayers);

var attackPlayersState = false;
attackPlayers.onclick = function(){
    attackPlayersState = !attackPlayersState;
    if(attackPlayersState){
        attackPlayers.style.color = '#ffffff';
        attackPlayers.style.backgroundColor = '#725640';
    }
    else{
        attackPlayers.style.color = '#ffffff';
        attackPlayers.style.backgroundColor = '#362a1e';
    }
};

var autoAttack = document.createElement('button');
autoAttack.className = 'UI-button';
autoAttack.style.position = 'static';
autoAttack.style.top = '8px';
autoAttack.style.width = '100%';
autoAttack.innerHTML = 'Auto Attack';
attacksColumn.appendChild(autoAttack);

var autoAttackState = false;
autoAttack.onclick = function(){
    autoAttackState = !autoAttackState;
    if(autoAttackState){
        autoAttack.style.color = '#ffffff';
        autoAttack.style.backgroundColor = '#725640';
    }
    else{
        autoAttack.style.color = '#ffffff';
        autoAttack.style.backgroundColor = '#362a1e';
        socket.emit('keyPress',{inputId:'leftClick',state:false});
    }
};

var autoColumn = document.createElement('div');
autoColumn.className = 'UI-display';
hackedDiv.appendChild(autoColumn);
autoColumn.style.top = '25px';
autoColumn.style.left = '200px';
autoColumn.style.width = '88px';
autoColumn.style.display = 'none';

var autoButton = document.createElement('button');
autoButton.className = 'UI-button';
hackedDiv.appendChild(autoButton);
autoButton.innerHTML = 'Auto';
autoButton.style.top = '0px';
autoButton.style.left = '200px';
autoButton.style.width = '100px';
var autoOpen = false;
autoButton.onclick = function(){
    autoOpen = !autoOpen;
    if(autoOpen){
        autoColumn.style.display = 'inline-block';
    }
    else{
        autoColumn.style.display = 'none';
    }
};

var autoRespawn = document.createElement('button');
autoRespawn.className = 'UI-button';
autoRespawn.style.position = 'static';
autoRespawn.style.top = '8px';
autoRespawn.style.width = '100%';
autoRespawn.innerHTML = 'Auto Respawn';
autoColumn.appendChild(autoRespawn);

var autoRespawnState = false;
autoRespawn.onclick = function(){
    autoRespawnState = !autoRespawnState;
    if(autoRespawnState){
        autoRespawn.style.color = '#ffffff';
        autoRespawn.style.backgroundColor = '#725640';
    }
    else{
        autoRespawn.style.color = '#ffffff';
        autoRespawn.style.backgroundColor = '#362a1e';
    }
};

var autoCollect = document.createElement('button');
autoCollect.className = 'UI-button';
autoCollect.style.position = 'static';
autoCollect.style.top = '8px';
autoCollect.style.width = '100%';
autoCollect.innerHTML = 'Auto Collect';
autoColumn.appendChild(autoCollect);

var autoCollectState = false;
autoCollect.onclick = function(){
    autoCollectState = !autoCollectState;
    if(autoCollectState){
        autoCollect.style.color = '#ffffff';
        autoCollect.style.backgroundColor = '#725640';
    }
    else{
        autoCollect.style.color = '#ffffff';
        autoCollect.style.backgroundColor = '#362a1e';
    }
};

var otherColumn = document.createElement('div');
otherColumn.className = 'UI-display';
hackedDiv.appendChild(otherColumn);
otherColumn.style.top = '25px';
otherColumn.style.left = '300px';
otherColumn.style.width = '88px';
otherColumn.style.display = 'none';

var otherButton = document.createElement('button');
otherButton.className = 'UI-button';
hackedDiv.appendChild(otherButton);
otherButton.innerHTML = 'Other';
otherButton.style.top = '0px';
otherButton.style.left = '300px';
otherButton.style.width = '100px';
var otherOpen = false;
otherButton.onclick = function(){
    otherOpen = !otherOpen;
    if(otherOpen){
        otherColumn.style.display = 'inline-block';
    }
    else{
        otherColumn.style.display = 'none';
    }
};

var freeCam = document.createElement('button');
freeCam.className = 'UI-button';
freeCam.style.position = 'static';
freeCam.style.top = '8px';
freeCam.style.width = '100%';
freeCam.innerHTML = 'FreeCam';
otherColumn.appendChild(freeCam);

var freeCamState = false;
var freeCamX = 0;
var freeCamY = 0;
freeCam.onclick = function(){
    freeCamState = !freeCamState;
    if(freeCamState){
        freeCam.style.color = '#ffffff';
        freeCam.style.backgroundColor = '#725640';
        freeCamX = cameraX;
        freeCamY = cameraY;
    }
    else{
        freeCam.style.color = '#ffffff';
        freeCam.style.backgroundColor = '#362a1e';
    }
};

var noDeathScreen = document.createElement('button');
noDeathScreen.className = 'UI-button';
noDeathScreen.style.position = 'static';
noDeathScreen.style.top = '8px';
noDeathScreen.style.width = '100%';
noDeathScreen.innerHTML = 'No Death Screen';
otherColumn.appendChild(noDeathScreen);

var noDeathScreenState = false;
noDeathScreen.onclick = function(){
    noDeathScreenState = !noDeathScreenState;
    if(noDeathScreenState){
        noDeathScreen.style.color = '#ffffff';
        noDeathScreen.style.backgroundColor = '#725640';
        deathScreen.style.background = 'none';
    }
    else{
        noDeathScreen.style.color = '#ffffff';
        noDeathScreen.style.backgroundColor = '#362a1e';
        deathScreen.style.background = 'rgba(255,0,0,0.3)';
    }
};

var noDialogueScroll = document.createElement('button');
noDialogueScroll.className = 'UI-button';
noDialogueScroll.style.position = 'static';
noDialogueScroll.style.top = '8px';
noDialogueScroll.style.width = '100%';
noDialogueScroll.innerHTML = 'No Dialogue Scroll';
otherColumn.appendChild(noDialogueScroll);

var noDialogueScrollState = false;
noDialogueScroll.onclick = function(){
    noDialogueScrollState = !noDialogueScrollState;
    if(noDialogueScrollState){
        noDialogueScroll.style.color = '#ffffff';
        noDialogueScroll.style.backgroundColor = '#725640';
        deathScreen.style.backgroundColor = 'none';
    }
    else{
        noDialogueScroll.style.color = '#ffffff';
        noDialogueScroll.style.backgroundColor = '#362a1e';
        deathScreen.style.backgroundColor = 'rgba(255,0,0,0.3)';
    }
};

var noBlindness = document.createElement('button');
noBlindness.className = 'UI-button';
noBlindness.style.position = 'static';
noBlindness.style.top = '8px';
noBlindness.style.width = '100%';
noBlindness.innerHTML = 'No Blindness';
otherColumn.appendChild(noBlindness);

var noBlindnessState = false;
noBlindness.onclick = function(){
    noBlindnessState = !noBlindnessState;
    if(noBlindnessState){
        noBlindness.style.color = '#ffffff';
        noBlindness.style.backgroundColor = '#725640';
        darknessEffectCtxRaw.style.display = 'none';
    }
    else{
        noBlindness.style.color = '#ffffff';
        noBlindness.style.backgroundColor = '#362a1e';
        darknessEffectCtxRaw.style.display = 'inline-block';
    }
};

var t = 0;
var autoAim = false;

var keys = [];

var getDistance = function(pt1,pt2){
    return (pt1.x - pt2.x)**2 + (pt1.y - pt2.y)**2;
};

MGHC = function(){
    t += 1;
    if(monsterTracersState){
        ctx1.save();
        ctx1.translate(cameraX,cameraY);
        for(var i in Monster.list){
            if(Monster.list[i].team === Player.list[selfId].team){
                ctx1.lineWidth = 4;
                if(Monster.list[i].boss){
                    ctx1.lineWidth = 8;
                }
                ctx1.strokeStyle = '#5ac54f';
                ctx1.beginPath();
                ctx1.moveTo(Player.list[selfId].x,Player.list[selfId].y);
                ctx1.lineTo(Monster.list[i].x,Monster.list[i].y);
                ctx1.stroke();
            }
            else{
                ctx1.lineWidth = 4;
                if(Monster.list[i].boss){
                    ctx1.lineWidth = 8;
                }
                ctx1.strokeStyle = '#ea323c';
                ctx1.beginPath();
                ctx1.moveTo(Player.list[selfId].x,Player.list[selfId].y);
                ctx1.lineTo(Monster.list[i].x,Monster.list[i].y);
                ctx1.stroke();
            }
        }
        ctx1.restore();
    }
    if(playerTracersState){
        ctx1.save();
        ctx1.translate(cameraX,cameraY);
        for(var i in Player.list){
            if(Player.list[i].team === Player.list[selfId].team){
                ctx1.strokeStyle = '#5ac54f';
                ctx1.lineWidth = 6;
                ctx1.beginPath();
                ctx1.moveTo(Player.list[selfId].x,Player.list[selfId].y);
                ctx1.lineTo(Player.list[i].x,Player.list[i].y);
                ctx1.stroke();
            }
            else{
                ctx1.strokeStyle = '#ff9000';
                ctx1.lineWidth = 6;
                ctx1.beginPath();
                ctx1.moveTo(Player.list[selfId].x,Player.list[selfId].y);
                ctx1.lineTo(Player.list[i].x,Player.list[i].y);
                ctx1.stroke();
            }
        }
        ctx1.restore();
    }
    if(npcTracersState){
        ctx1.save();
        ctx1.translate(cameraX,cameraY);
        for(var i in Npc.list){
            ctx1.strokeStyle = '#90ff00';
            ctx1.lineWidth = 4;
            ctx1.beginPath();
            ctx1.moveTo(Player.list[selfId].x,Player.list[selfId].y);
            ctx1.lineTo(Npc.list[i].x,Npc.list[i].y);
            ctx1.stroke();
        }
        for(var i in HarvestableNpc.list){
            ctx1.strokeStyle = '#0090ff';
            ctx1.lineWidth = 4;
            ctx1.beginPath();
            ctx1.moveTo(Player.list[selfId].x,Player.list[selfId].y);
            ctx1.lineTo(HarvestableNpc.list[i].x,HarvestableNpc.list[i].y);
            ctx1.stroke();
        }
        ctx1.restore();
    }
    if(autoCollectState){
        var pickedUp = false;
        for(var i in DroppedItem.list){
            if(inventory.hasItem(DroppedItem.list[i].item,1)){
                pickedUp = true;
                socket.emit('keyPress',{inputId:'direction',state:{x:DroppedItem.list[i].x - Player.list[selfId].x,y:DroppedItem.list[i].y - Player.list[selfId].y}});
                socket.emit('keyPress',{inputId:'leftClick',state:true,selectedDroppedItem:i});
            }
        }
        if(pickedUp === true){
            socket.emit('keyPress',{inputId:'leftClick',state:false});
        }
    }
    autoAim = false;
    if(attackMonstersState){
        var closestMonster = undefined;
        for(var i in Monster.list){
            if(Monster.list[i].team !== Player.list[selfId].team){
                if(closestMonster === undefined){
                    closestMonster = Monster.list[i];
                }
                else if(getDistance(Player.list[selfId],closestMonster) > getDistance(Player.list[selfId],Monster.list[i])){
                    closestMonster = Monster.list[i];
                }
            }
        }
        if(closestMonster !== undefined){
            socket.emit('keyPress',{inputId:'direction',state:{x:closestMonster.x - Player.list[selfId].x,y:closestMonster.y - Player.list[selfId].y}});
            autoAim = true;
        }
    }
    if(attackPlayersState){
        var closestPlayer = undefined;
        for(var i in Player.list){
            if(Player.list[i].team !== Player.list[selfId].team){
                if(closestPlayer === undefined){
                    closestPlayer = Player.list[i];
                }
                else if(getDistance(Player.list[selfId],closestPlayer) > getDistance(Player.list[selfId],Player.list[i])){
                    closestPlayer = Player.list[i];
                }
            }
        }
        if(closestPlayer !== undefined){
            socket.emit('keyPress',{inputId:'direction',state:{x:closestPlayer.x - Player.list[selfId].x,y:closestPlayer.y - Player.list[selfId].y}});
            autoAim = true;
        }
    }
    if(autoAttackState && t % 20 === 0){
        socket.emit('keyPress',{inputId:'leftClick',state:true,selectedDroppedItem:null});
    }
};
MGHC1 = function(){
    if(freeCamState){
        socket.emit('keyPress',{inputId:'releaseAll'});
        if(keys['w'] || keys['W'] || keys['ArrowUp']){
            freeCamY += 35;
        }
        if(keys['s'] || keys['S'] || keys['ArrowDown']){
            freeCamY -= 35;
        }
        if(keys['a'] || keys['A'] || keys['ArrowLeft']){
            freeCamX += 35;
        }
        if(keys['d'] || keys['D'] || keys['ArrowRight']){
            freeCamX -= 35;
        }
        cameraX = freeCamX;
        cameraY = freeCamY;
    }
};

var onkeydown = document.onkeydown;
document.onkeydown = function(event){
    onkeydown(event);
    if(chatPress){
        return;
    }
    var key = event.key || event.keyCode;
    keys[key] = true;
    if(key === 'f' || key === 'F'){
        freeCamState = !freeCamState;
        if(freeCamState){
            freeCam.style.color = '#ffffff';
            freeCam.style.backgroundColor = '#725640';
            freeCamX = cameraX;
            freeCamY = cameraY;
        }
        else{
            freeCam.style.color = '#ffffff';
            freeCam.style.backgroundColor = '#362a1e';
        }
    }
};
var onkeyup = document.onkeyup;
document.onkeyup = function(event){
    onkeyup(event);
    if(chatPress){
        return;
    }
    var key = event.key || event.keyCode;
    keys[key] = false;
};

socket.removeListener('death');
socket.on('death',function(data){
    if(autoRespawnState){
        socket.emit('respawn');
    }
    else{
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
    }
});
socket.removeListener('dialogue');
socket.on('dialogue',function(data){
    if(noDialogueScrollState){
        if(data.message){
            openDialogue();
            dialogueMessage.innerHTML = data.message;
            dialogueOption1.style.display = 'none';
            dialogueOption2.style.display = 'none';
            dialogueOption3.style.display = 'none';
            dialogueOption4.style.display = 'none';
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
        }
        else{
            closeDialogue();
        }
    }
    else{
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
            typeWriter(function(){
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
    }
});