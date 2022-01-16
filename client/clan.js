var playerClan = null;
var playerName = null;

var createClanState = 0;
var leaveClanState = 0;
var transferLeadershipState = 0;
var disbandClanState = 0;

var clanDescriptions = {};

updateClan = function(){
    if(playerClan === null){
        currentClanDisplay.innerHTML = 'Current Clan: <b class="clanRewardName">None</b>.';
        clanMembersDisplay.style.display = 'none';
        clanOptions.style.display = 'none';
        createClanButton.style.display = 'inline-block';
        clanRewardDiv.style.display = 'none';
    }
    else{
        clanStats.innerHTML = '<b class="clanRewardName">null</b>\'s stats:&nbsp;';
        var clanName = playerClan.name;
        if(clanName.replace){
            clanName = clanName.replace(/</gi,'&lt;');
            clanName = clanName.replace(/>/gi,'&gt;');
        }
        var clanNames = document.getElementsByClassName('clanRewardName');
        for(var i in clanNames){
            clanNames[i].innerHTML = playerClan.name;
        }
        clanMembersDisplay.style.display = 'inline-block';
        clanMembersDisplay.innerHTML = 'Clan Members: ';
        if(playerClan.members[playerName] === 'leader'){
            for(var i in playerClan.members){
                if(playerClan.members[i] === 'leader'){
                    clanMembersDisplay.innerHTML += '<br><b><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px; color: #ffff00;">' + i.replace(/ /gi,'&nbsp;') + ' (Leader)</div></b>';
                }
                else{
                    clanMembersDisplay.innerHTML += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + i.replace(/ /gi,'&nbsp;') + '<button class="UI-button" style="position: relative; margin-left: 8px; color: #ff0000;" onclick="kickMember(\'' + i + '\')">Kick Member</button></div>';
                }
            }
            disbandClanButton.style.display = 'inline-block';
            transferLeadershipButton.style.display = 'inline-block';
            leaveClanButton.style.display = 'none';
        }
        else{
            for(var i in playerClan.members){
                if(playerClan.members[i] === 'leader'){
                    clanMembersDisplay.innerHTML += '<br><b><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px; color: #ffff00;">' + i.replace(/ /gi,'&nbsp;') + ' (Leader)</div></b>';
                }
                else{
                    clanMembersDisplay.innerHTML += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + i.replace(/ /gi,'&nbsp;') + '</div>';
                }
            }
            disbandClanButton.style.display = 'none';
            transferLeadershipButton.style.display = 'none';
            leaveClanButton.style.display = 'inline-block';
        }
        clanOptions.style.display = 'inline-block';
        createClanButton.style.display = 'none';
        createClanForm.style.display = 'none';
        clanXpBarValue.style.width = Math.round(playerClan.xp / playerClan.xpMax * 150) + 'px';
        clanXpBarText.innerHTML = playerClan.xp + '/' + playerClan.xpMax;
        clanStats.innerHTML += '<br>Level ' + playerClan.level + '<br>';
        clanStats.innerHTML += inventory.getDescription(playerClan.boosts);
    }
}

createClanButton.onclick = function(){
    if(createClanState === 0){
        createClanForm.style.display = 'inline-block';
        createClanInput.value = '';
        createClanState = 1;
    }
    else{
        if(createClanInput.value !== ''){
            createClanForm.style.display = 'none';
            createClanState = 0;
            socket.emit('createClan',createClanInput.value);
            createClanInput.value = '';
        }
    }
}
invitePlayer = function(player){
    socket.emit('invitePlayer',player);
}
kickMember = function(player){
    socket.emit('kickMember',player);
}
transferLeadership = function(player){
    clanMembersDisplay.innerHTML = 'Clan Members: ';
    for(var i in playerClan.members){
        if(playerClan.members[i] === 'leader'){
            clanMembersDisplay.innerHTML += '<br><b><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px; color: #ffff00;">' + i.replace(/ /gi,'&nbsp;') + ' (Leader)</div></b>';
        }
        else{
            clanMembersDisplay.innerHTML += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + i.replace(/ /gi,'&nbsp;') + '<button class="UI-button" style="position: relative; margin-left: 8px; color: #ff0000;" onclick="kickMember(\'' + i + '\')">Kick Member</button></div>';
        }
    }
    socket.emit('transferLeadership',player);
}
leaveClanButton.onclick = function(){
    if(leaveClanState === 0){
        leaveClanButton.innerHTML = 'Are you sure?';
        leaveClanState = 1;
    }
    else{
        leaveClanButton.innerHTML = 'Leave Clan';
        leaveClanState = 0;
        socket.emit('leaveClan');
    }
}
transferLeadershipButton.onclick = function(){
    if(transferLeadershipState === 0){
        transferLeadershipButton.innerHTML = 'Are you sure?';
        transferLeadershipState = 1;
    }
    else{
        transferLeadershipButton.innerHTML = 'Transfer Leadership';
        transferLeadershipState = 0;
        clanMembersDisplay.innerHTML = 'Clan Members: ';
        for(var i in playerClan.members){
            if(playerClan.members[i] === 'leader'){
                clanMembersDisplay.innerHTML += '<br><b><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px; color: #ffff00;">' + i.replace(/ /gi,'&nbsp;') + ' (Leader)</div></b>';
            }
            else{
                clanMembersDisplay.innerHTML += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + i.replace(/ /gi,'&nbsp;') + '<button class="UI-button" style="position: relative; margin-left: 8px; color: #ff0000;" onclick="kickMember(\'' + i + '\')">Kick Member</button><button class="UI-button" style="position: relative; margin-left: 8px; color: #ff0000;" onclick="transferLeadership(\'' + i + '\')">Transfer Leadership</button></div>';
            }
        }
    }
}
disbandClanButton.onclick = function(){
    if(disbandClanState === 0){
        disbandClanButton.innerHTML = 'Are you sure?';
        disbandClanState = 1;
    }
    else{
        disbandClanButton.innerHTML = 'Disband Clan';
        disbandClanState = 0;
        socket.emit('disbandClan');
    }
}

socket.on('updateClan',function(data){
    playerClan = data;
    updateClan();
});

selectClanReward = function(reward){
    socket.emit('selectUpgrade',reward);
    clanRewardDiv.style.display = 'none';
}

socket.on('upgradeClan',function(data){
    clanRewardDiv.style.display = 'inline-block';
    var clanNames = document.getElementsByClassName('clanRewardName');
    for(var i in clanNames){
        clanNames[i].innerHTML = playerClan.name;
    }
    clanLevel.innerHTML = playerClan.level;
    clanReward1.style.display = 'none';
    clanReward2.style.display = 'none';
    clanReward3.style.display = 'none';
    clanReward4.style.display = 'none';
    drawClanReward = function(clanReward,canvas,index){
        clanReward.style.display = 'inline-block';
        var canvasCtx = canvas.getContext("2d");
        if(data[index].drawId === 155){
            canvasCtx.canvas.width = 28;
            canvasCtx.canvas.height = 28;
        }
        else{
            canvasCtx.canvas.width = 48;
            canvasCtx.canvas.height = 48;
        }
        resetCanvas(canvasCtx);
        var img_x = ((data[index].drawId - 1) % 26) * 24;
        var img_y = ~~((data[index].drawId - 1) / 26) * 24;
        canvasCtx.drawImage(Img.items2,img_x,img_y,24,24,0,0,48,48);
        clanDescriptions[index] = '<span style="color: ' + inventory.getRarityColor(data[index].rarity) + '">' + data[index].name + '</span><br><div style="font-size: 11px">' + inventory.getDescription(data[index]) + '</div>';
        clanReward.onmouseover = function(){
            updateClanPopupMenu(index);
        }
        clanReward.onmouseout = function(){
            updateClanPopupMenu(-1);
        }
        var rect = clanReward.getBoundingClientRect();
        if(rawMouseX >= rect.left && rawMouseX <= rect.right && rawMouseY >= rect.top && rawMouseY <= rect.bottom){
            inGame = false;
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
    }
    if(data.upgrade1){
        drawClanReward(clanReward1,clanReward1Canvas,'upgrade1');
    }
    if(data.upgrade2){
        drawClanReward(clanReward2,clanReward2Canvas,'upgrade2');
    }
    if(data.upgrade3){
        drawClanReward(clanReward3,clanReward3Canvas,'upgrade3');
    }
    if(data.upgrade4){
        drawClanReward(clanReward4,clanReward4Canvas,'upgrade4');
    }
});

socket.on('playerList',function(data){
    var html = 'Players Online:';
    for(var i in data){
        if(Player.list[selfId]){
            if(data[i].name === Player.list[selfId].name){
                if(data[i].region){
                    html += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + data[i].name.replace(/ /gi,'&nbsp;') + ' (' + data[i].region + ')</div>';
                }
                else{
                    html += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + data[i].name.replace(/ /gi,'&nbsp;') + '</div>';
                }
                continue;
            }
        }
        if(playerClan !== null){
            var inClan = false;
            for(var j in playerClan.members){
                if(data[i].name === j){
                    inClan = true;
                }
            }
            if(inClan){
                if(data[i].region){
                    html += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + data[i].name.replace(/ /gi,'&nbsp;') + ' (' + data[i].region + ')</div>';
                }
                else{
                    html += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + data[i].name.replace(/ /gi,'&nbsp;') + '</div>';
                }
            }
            else{
                if(playerClan.members[playerName] === 'leader'){
                    if(data[i].region){
                        html += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + data[i].name.replace(/ /gi,'&nbsp;') + ' (' + data[i].region + ')<button class="UI-button" style="position: relative; margin-left: 8px; color: #ffff00;" onclick="invitePlayer(\'' + data[i].name + '\')">Invite Player</button></div>';
                    }
                    else{
                        html += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + data[i].name.replace(/ /gi,'&nbsp;') + '<button class="UI-button" style="position: relative; margin-left: 8px; color: #ffff00;" onclick="invitePlayer(\'' + data[i].name + '\')">Invite Player</button></div>';
                    }
                }
                else{
                    if(data[i].region){
                        html += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + data[i].name.replace(/ /gi,'&nbsp;') + ' (' + data[i].region + ')</div>';
                    }
                    else{
                        html += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + data[i].name.replace(/ /gi,'&nbsp;') + '</div>';
                    }
                }
            }
        }
        else{
            if(data[i].region){
                html += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + data[i].name.replace(/ /gi,'&nbsp;') + ' (' + data[i].region + ')</div>';
            }
            else{
                html += '<br><div class="UI-display" style="position: relative; display: inline-block; margin-bottom: 4px;">' + data[i].name.replace(/ /gi,'&nbsp;') + '</div>';
            }
        }
    }
    if(html !== playersOnlineDisplay.innerHTML){
        playersOnlineDisplay.innerHTML = html;
    }
});