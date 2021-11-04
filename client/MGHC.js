javascript:
var hackedDiv = document.createElement('div');
document.getElementById('gameDiv').appendChild(hackedDiv);
hackedDiv.style.top = '140px';
hackedDiv.style.backgroundColor = 'rgba(0,0,0,0);';

var hackedCollumn1 = document.createElement('div');
hackedCollumn1.className = 'UI-display-light';
hackedDiv.appendChild(hackedCollumn1);
hackedCollumn1.style.top = '140px';
hackedCollumn1.style.backgroundColor = 'rgb(0,0,0,125);';
hackedCollumn1.style.opacity = 0.6;

var hackedCollumn2 = document.createElement('div');
hackedCollumn2.className = 'UI-display-light';
hackedDiv.appendChild(hackedCollumn2);
hackedCollumn2.style.top = '180px';
hackedCollumn2.style.backgroundColor = 'rgb(0,0,0,125);';
hackedCollumn2.style.opacity = 0.6;

var hackedCollumn3 = document.createElement('div');
hackedCollumn3.className = 'UI-display-light';
hackedDiv.appendChild(hackedCollumn3);
hackedCollumn3.style.top = '220px';
hackedCollumn3.style.backgroundColor = 'rgb(0,0,0,125);';
hackedCollumn3.style.opacity = 0.6;

var hackedCollumn4 = document.createElement('div');
hackedCollumn4.className = 'UI-display-light';
hackedDiv.appendChild(hackedCollumn4);
hackedCollumn4.style.top = '260px';
hackedCollumn4.style.backgroundColor = 'rgb(0,0,0,125);';
hackedCollumn4.style.opacity = 0.6;

var monsterTracers = document.createElement('button');
monsterTracers.className = 'UI-button-light';
monsterTracers.style.position = 'static';
monsterTracers.style.top = '8px';
monsterTracers.innerHTML = 'Monster Tracers';
hackedCollumn1.appendChild(monsterTracers);

monsterTracers.style.color = '#ffffff';
monsterTracers.style.backgroundColor = '#000000';

var monsterTracersState = false;
monsterTracers.onclick = function(){
    monsterTracersState = !monsterTracersState;
    if(monsterTracersState){
        monsterTracers.style.color = '#000000';
        monsterTracers.style.backgroundColor = '#ffffff';
    }
    else{
        monsterTracers.style.color = '#ffffff';
        monsterTracers.style.backgroundColor = '#000000';
    }
};

var attackMonsters = document.createElement('button');
attackMonsters.className = 'UI-button-light';
attackMonsters.style.position = 'static';
attackMonsters.style.top = '8px';
attackMonsters.innerHTML = 'Attack Monsters';
hackedCollumn1.appendChild(attackMonsters);

attackMonsters.style.color = '#ffffff';
attackMonsters.style.backgroundColor = '#000000';

var attackMonstersState = false;
attackMonsters.onclick = function(){
    attackMonstersState = !attackMonstersState;
    if(attackMonstersState){
        attackMonsters.style.color = '#000000';
        attackMonsters.style.backgroundColor = '#ffffff';
        socket.emit('keyPress',{inputId:'attack',state:false});
    }
    else{
        attackMonsters.style.color = '#ffffff';
        attackMonsters.style.backgroundColor = '#000000';
        socket.emit('keyPress',{inputId:'attack',state:false});
    }
};

var playerTracers = document.createElement('button');
playerTracers.className = 'UI-button-light';
playerTracers.style.position = 'static';
playerTracers.style.top = '8px';
playerTracers.innerHTML = 'Player Tracers';
hackedCollumn2.appendChild(playerTracers);

playerTracers.style.color = '#ffffff';
playerTracers.style.backgroundColor = '#000000';

var playerTracersState = false;
playerTracers.onclick = function(){
    playerTracersState = !playerTracersState;
    if(playerTracersState){
        playerTracers.style.color = '#000000';
        playerTracers.style.backgroundColor = '#ffffff';
    }
    else{
        playerTracers.style.color = '#ffffff';
        playerTracers.style.backgroundColor = '#000000';
    }
};

var attackPlayers = document.createElement('button');
attackPlayers.className = 'UI-button-light';
attackPlayers.style.position = 'static';
attackPlayers.style.top = '8px';
attackPlayers.innerHTML = 'Attack Players';
hackedCollumn2.appendChild(attackPlayers);

attackPlayers.style.color = '#ffffff';
attackPlayers.style.backgroundColor = '#000000';

var attackPlayersState = false;
attackPlayers.onclick = function(){
    attackPlayersState = !attackPlayersState;
    if(attackPlayersState){
        attackPlayers.style.color = '#000000';
        attackPlayers.style.backgroundColor = '#ffffff';
        socket.emit('keyPress',{inputId:'attack',state:false});
    }
    else{
        attackPlayers.style.color = '#ffffff';
        attackPlayers.style.backgroundColor = '#000000';
        socket.emit('keyPress',{inputId:'attack',state:false});
    }
};

var autoRespawn = document.createElement('button');
autoRespawn.className = 'UI-button-light';
autoRespawn.style.position = 'static';
autoRespawn.style.top = '8px';
autoRespawn.innerHTML = 'Auto Respawn';
hackedCollumn2.appendChild(autoRespawn);

autoRespawn.style.color = '#ffffff';
autoRespawn.style.backgroundColor = '#000000';

var autoRespawnState = false;
var autoRespawning = false;
autoRespawn.onclick = function(){
    autoRespawnState = !autoRespawnState;
    if(autoRespawnState){
        autoRespawn.style.color = '#000000';
        autoRespawn.style.backgroundColor = '#ffffff';
    }
    else{
        autoRespawn.style.color = '#ffffff';
        autoRespawn.style.backgroundColor = '#000000';
    }
};

var npcTracers = document.createElement('button');
npcTracers.className = 'UI-button-light';
npcTracers.style.position = 'static';
npcTracers.style.top = '8px';
npcTracers.innerHTML = 'Npc Tracers';
hackedCollumn3.appendChild(npcTracers);

npcTracers.style.color = '#ffffff';
npcTracers.style.backgroundColor = '#000000';

var npcTracersState = false;
npcTracers.onclick = function(){
    npcTracersState = !npcTracersState;
    if(npcTracersState){
        npcTracers.style.color = '#000000';
        npcTracers.style.backgroundColor = '#ffffff';
    }
    else{
        npcTracers.style.color = '#ffffff';
        npcTracers.style.backgroundColor = '#000000';
    }
};

var freeCam = document.createElement('button');
freeCam.className = 'UI-button-light';
freeCam.style.position = 'static';
freeCam.style.top = '8px';
freeCam.innerHTML = 'FreeCam';
hackedCollumn4.appendChild(freeCam);

freeCam.style.color = '#ffffff';
freeCam.style.backgroundColor = '#000000';

var freeCamState = false;
var freeCamX = 0;
var freeCamY = 0;
var keys = [];
freeCam.onclick = function(){
    freeCamState = !freeCamState;
    if(freeCamState){
        freeCam.style.color = '#000000';
        freeCam.style.backgroundColor = '#ffffff';
        freeCamX = cameraX;
        freeCamY = cameraY;
    }
    else{
        freeCam.style.color = '#ffffff';
        freeCam.style.backgroundColor = '#000000';
        talking = false;
    }
};

var getDistance = function(pt1,pt2){
    return (pt1.x - pt2.x)**2 + (pt1.y - pt2.y)**2;
};

MGHC = function(){
    if(monsterTracersState){
        ctx.save();
        ctx.translate(cameraX,cameraY);
        for(var i in Monster.list){
            if(Monster.list[i].monsterType === 'skeleton'){
                ctx.strokeStyle = '#999955';
                ctx.lineWidth = 4;
            }
            if(Monster.list[i].monsterType === 'snake'){
                ctx.strokeStyle = '#cccc55';
                ctx.lineWidth = 4;
            }
            if(Monster.list[i].monsterType === 'skeletonking'){
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 8;
            }
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
    if(autoRespawnState && Player.list[selfId].hp < 1 && !autoRespawning){
        autoRespawning = true;
        var lastAttackMonstersState = attackMonstersState;
        attackMonstersState = false;
        attackMonsters.style.color = '#ffffff';
        attackMonsters.style.backgroundColor = '#000000';
        var lastAttackPlayersState = attackPlayersState;
        attackPlayersState = false;
        attackPlayers.style.color = '#ffffff';
        attackPlayers.style.backgroundColor = '#000000';
        setTimeout(function(){
            runRespawn();
            setTimeout(function(){
                attackMonstersState = lastAttackMonstersState;
                if(attackMonstersState){
                    attackMonsters.style.color = '#000000';
                    attackMonsters.style.backgroundColor = '#ffffff';
                }
                else{
                    attackMonsters.style.color = '#ffffff';
                    attackMonsters.style.backgroundColor = '#000000';
                }
                attackPlayersState = lastAttackPlayersState;
                if(attackPlayersState){
                    attackPlayers.style.color = '#000000';
                    attackPlayers.style.backgroundColor = '#ffffff';
                }
                else{
                    attackPlayers.style.color = '#ffffff';
                    attackPlayers.style.backgroundColor = '#000000';
                }
                autoRespawning = false;
            },500);
        },500);
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
            socket.emit('keyPress',{inputId:'attack',state:true});
            socket.emit('keyPress',{inputId:'direction',state:{x:closestMonster.x - Player.list[selfId].x,y:closestMonster.y - Player.list[selfId].y}});
        }
        else{
            socket.emit('keyPress',{inputId:'attack',state:false});
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
            if(i === selfId){

            }
            else if(closestPlayer === undefined){
                closestPlayer = Player.list[i];
            }
            else if(getDistance(Player.list[selfId],closestPlayer) > getDistance(Player.list[selfId],Player.list[i])){
                closestPlayer = Player.list[i];
            }
        }
        if(closestPlayer !== undefined){
            socket.emit('keyPress',{inputId:'attack',state:true});
            socket.emit('keyPress',{inputId:'direction',state:{x:closestPlayer.x - Player.list[selfId].x,y:closestPlayer.y - Player.list[selfId].y}});
        }
        else{
            socket.emit('keyPress',{inputId:'attack',state:false});
        }
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
            freeCam.style.color = '#000000';
            freeCam.style.backgroundColor = '#ffffff';
            freeCamX = cameraX;
            freeCamY = cameraY;
        }
        else{
            freeCam.style.color = '#ffffff';
            freeCam.style.backgroundColor = '#000000';
            talking = false;
        }
    }
};
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
    if(key === 'b' || key === 'B'){
        toggleSetting();
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