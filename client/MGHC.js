javascript:
var hackedDiv = document.createElement('div');
document.getElementById('settingDiv').appendChild(hackedDiv);
hackedDiv.style.top = '20px';
hackedDiv.style.right = '20px';
hackedDiv.backgroundColor = 'none';

var hackedCollumn1 = document.createElement('div');
hackedCollumn1.className = 'UI-display';
hackedDiv.appendChild(hackedCollumn1);
hackedCollumn1.style.top = '20px';
hackedCollumn1.style.right = '20px';

var hackedCollumn2 = document.createElement('div');
hackedCollumn2.className = 'UI-display';
hackedDiv.appendChild(hackedCollumn2);
hackedCollumn2.style.top = '60px';
hackedCollumn2.style.right = '20px';

var hackedCollumn3 = document.createElement('div');
hackedCollumn3.className = 'UI-display';
hackedDiv.appendChild(hackedCollumn3);
hackedCollumn3.style.top = '100px';
hackedCollumn3.style.right = '20px';

var hackedCollumn4 = document.createElement('div');
hackedCollumn4.className = 'UI-display';
hackedDiv.appendChild(hackedCollumn4);
hackedCollumn4.style.top = '140px';
hackedCollumn4.style.right = '20px';

var hackedCollumn5 = document.createElement('div');
hackedCollumn5.className = 'UI-display';
hackedDiv.appendChild(hackedCollumn5);
hackedCollumn5.style.top = '180px';
hackedCollumn5.style.right = '20px';

var attackMonsters = document.createElement('button');
attackMonsters.className = 'UI-button';
attackMonsters.style.position = 'static';
attackMonsters.style.top = '8px';
attackMonsters.innerHTML = 'Attack Monsters';
hackedCollumn1.appendChild(attackMonsters);

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

var monsterTracers = document.createElement('button');
monsterTracers.className = 'UI-button';
monsterTracers.style.position = 'static';
monsterTracers.style.top = '8px';
monsterTracers.innerHTML = 'Monster Tracers';
hackedCollumn1.appendChild(monsterTracers);

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

var autoRespawn = document.createElement('button');
autoRespawn.className = 'UI-button';
autoRespawn.style.position = 'static';
autoRespawn.style.top = '8px';
autoRespawn.innerHTML = 'Auto Respawn';
hackedCollumn2.appendChild(autoRespawn);

var autoRespawnState = false;
var autoRespawning = false;
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

var attackPlayers = document.createElement('button');
attackPlayers.className = 'UI-button';
attackPlayers.style.position = 'static';
attackPlayers.style.top = '8px';
attackPlayers.innerHTML = 'Attack Players';
hackedCollumn2.appendChild(attackPlayers);

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

var playerTracers = document.createElement('button');
playerTracers.className = 'UI-button';
playerTracers.style.position = 'static';
playerTracers.style.top = '8px';
playerTracers.innerHTML = 'Player Tracers';
hackedCollumn2.appendChild(playerTracers);

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
npcTracers.innerHTML = 'Npc Tracers';
hackedCollumn3.appendChild(npcTracers);

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

var freeCam = document.createElement('button');
freeCam.className = 'UI-button';
freeCam.style.position = 'static';
freeCam.style.top = '8px';
freeCam.innerHTML = 'FreeCam';
hackedCollumn4.appendChild(freeCam);

var freeCamState = false;
var freeCamX = 0;
var freeCamY = 0;
var keys = [];
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

var autoAttack = document.createElement('button');
autoAttack.className = 'UI-button';
autoAttack.style.position = 'static';
autoAttack.style.top = '8px';
autoAttack.innerHTML = 'Auto Attack';
hackedCollumn4.appendChild(autoAttack);

var autoAttackState = false;
autoAttack.onclick = function(){
    autoAttackState = !autoAttackState;
    if(autoAttackState){
        autoAttack.style.color = '#ffffff';
        autoAttack.style.backgroundColor = '#725640';
        socket.emit('keyPress',{inputId:'leftClick',state:true});
    }
    else{
        autoAttack.style.color = '#ffffff';
        autoAttack.style.backgroundColor = '#362a1e';
        socket.emit('keyPress',{inputId:'leftClick',state:false});
    }
};

var disableRickroll = document.createElement('button');
disableRickroll.className = 'UI-button';
disableRickroll.style.position = 'static';
disableRickroll.style.top = '8px';
disableRickroll.innerHTML = 'Disable Rickroll';
hackedCollumn5.appendChild(disableRickroll);

var disableRickrollState = false;
disableRickroll.onclick = function(){
    disableRickrollState = !disableRickrollState;
    if(disableRickrollState){
        disableRickroll.style.color = '#ffffff';
        disableRickroll.style.backgroundColor = '#725640';
    }
    else{
        disableRickroll.style.color = '#ffffff';
        disableRickroll.style.backgroundColor = '#362a1e';
    }
};

var disableDialogueScroll = document.createElement('button');
disableDialogueScroll.className = 'UI-button';
disableDialogueScroll.style.position = 'static';
disableDialogueScroll.style.top = '8px';
disableDialogueScroll.innerHTML = 'Disable Dialogue Scroll';
hackedCollumn5.appendChild(disableDialogueScroll);

var disableDialogueScrollState = false;
disableDialogueScroll.onclick = function(){
    disableDialogueScrollState = !disableDialogueScrollState;
    if(disableDialogueScrollState){
        disableDialogueScroll.style.color = '#ffffff';
        disableDialogueScroll.style.backgroundColor = '#725640';
    }
    else{
        disableDialogueScroll.style.color = '#ffffff';
        disableDialogueScroll.style.backgroundColor = '#362a1e';
    }
};

var t = 0;

var getDistance = function(pt1,pt2){
    return (pt1.x - pt2.x)**2 + (pt1.y - pt2.y)**2;
};

MGHC = function(){
    t += 1;
    if(monsterTracersState){
        ctx.save();
        ctx.translate(cameraX,cameraY);
        for(var i in Monster.list){
            var tracers = {
                skeleton:{
                    strokeStyle:'#999955',
                    lineWidth:4,
                },
                snake:{
                    strokeStyle:'#cccc55',
                    lineWidth:4,
                },
                slime:{
                    strokeStyle:'#33dd33',
                    lineWidth:4,
                },
                radioactiveskeleton:{
                    strokeStyle:'#ff0000',
                    lineWidth:6,
                },
                karateskeleton:{
                    strokeStyle:'#725640',
                    lineWidth:6,
                },
                skeletonking:{
                    strokeStyle:'#ffff00',
                    lineWidth:8,
                },
                teneyedone:{
                    strokeStyle:'#ff3333',
                    lineWidth:10,
                },
            };
            ctx.strokeStyle = tracers[Monster.list[i].monsterType].strokeStyle;
            ctx.lineWidth = tracers[Monster.list[i].monsterType].lineWidth;
            ctx.beginPath();
            ctx.moveTo(Player.list[selfId].x,Player.list[selfId].y);
            ctx.lineTo(Monster.list[i].x,Monster.list[i].y);
            ctx.stroke();
        }
        ctx.restore();
    }
    if(playerTracersState){
        ctx.save();
        ctx.translate(cameraX,cameraY);
        for(var i in Player.list){
            ctx.strokeStyle = '#ff9000';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(Player.list[selfId].x,Player.list[selfId].y);
            ctx.lineTo(Player.list[i].x,Player.list[i].y);
            ctx.stroke();
        }
        ctx.restore();
    }
    if(npcTracersState){
        ctx.save();
        ctx.translate(cameraX,cameraY);
        for(var i in Npc.list){
            ctx.strokeStyle = '#90ff00';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(Player.list[selfId].x,Player.list[selfId].y);
            ctx.lineTo(Npc.list[i].x,Npc.list[i].y);
            ctx.stroke();
        }
        ctx.restore();
    }
    if(attackMonstersState){
        if(Monster.list === {}){
            return;
        };
        var closestMonster = undefined;
        for(var i in Monster.list){
            if(closestMonster === undefined){
                closestMonster = Monster.list[i];
            }
            else if(getDistance(Player.list[selfId],closestMonster) > getDistance(Player.list[selfId],Monster.list[i])){
                closestMonster = Monster.list[i];
            }
        }
        if(closestMonster !== undefined){
            socket.emit('keyPress',{inputId:'direction',state:{x:closestMonster.x - Player.list[selfId].x,y:closestMonster.y - Player.list[selfId].y}});
        }
    }
    if(attackPlayersState){
        var numPlayers = 0;
        for(var i in Player.list){
            numPlayers += 1;
        }
        if(numPlayers === 1){
            return;
        };
        var closestPlayer = undefined;
        for(var i in Player.list){
            if(i + '' === selfId + ''){

            }
            else if(closestPlayer === undefined){
                closestPlayer = Player.list[i];
            }
            else if(getDistance(Player.list[selfId],closestPlayer) > getDistance(Player.list[selfId],Player.list[i])){
                closestPlayer = Player.list[i];
            }
        }
        if(closestPlayer !== undefined){
            socket.emit('keyPress',{inputId:'direction',state:{x:closestPlayer.x - Player.list[selfId].x,y:closestPlayer.y - Player.list[selfId].y}});
        }
    }
    if(autoAttackState && t % 20 === 0){
        socket.emit('keyPress',{inputId:'leftClick',state:true});
    }
};
MGHC1 = function(){
    if(freeCamState){
        talking = true;
        socket.emit('keyPress',{inputId:'releaseAll'});
        if(keys['w']){
            freeCamY += 35;
        }
        if(keys['s']){
            freeCamY -= 35;
        }
        if(keys['a']){
            freeCamX += 35;
        }
        if(keys['d']){
            freeCamX -= 35;
        }
        cameraX = freeCamX;
        cameraY = freeCamY;
    }
    if(keys['f']){
        keys['f'] = false;
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
            talking = false;
        }
    }
};
document.onkeydown = function(event){
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
    keys[key] = true;
};
document.onkeyup = function(event){
    chatPress = false;
    var key = event.key || event.keyCode;
    socket.emit('keyPress',{inputId:key,state:false});
    keys[key] = false;
};
document.onmousemove = function(event){
    if(selfId){
        var x = -cameraX - Player.list[selfId].x + event.clientX;
        var y = -cameraY - Player.list[selfId].y + event.clientY;
        if(event.clientY > window.innerHeight){
            socket.emit('keyPress',{inputId:'releaseAll'});
            attacking = false;
        }
        rawMouseX = event.clientX;
        rawMouseY = event.clientY;
        if(!attackMonstersState && !attackPlayersState){
            socket.emit('keyPress',{inputId:'direction',state:{x:x,y:y}});
            mouseX = x;
            mouseY = y;
        }
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
socket.removeListener('rickroll');
socket.on('rickroll',function(data){
    if(disableRickrollState){
        document.body.innerHTML = '<iframe width="' + window.innerWidth + '" height="' + window.innerHeight + '" src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0&autoplay=1" title="Rickroll LOL" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        socket.emit('timeout');
        selfId = null;
        stopAllSongs();
    }
    else{
        document.body.innerHTML = '<iframe width="' + window.innerWidth + '" height="' + window.innerHeight + '" src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0&autoplay=1" title="Rickroll LOL" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        socket.emit('timeout');
        selfId = null;
        stopAllSongs();
    }
});
socket.removeListener('dialogue');
socket.on('dialogue',function(data){
    if(disableDialogueScrollState){
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