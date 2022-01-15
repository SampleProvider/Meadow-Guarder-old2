var signError = document.getElementById('signError');
var signErrorText = '';

var deletePasswordState = 0;
var changePasswordState = 0;
var canSignIn = true;
var totalLoading = 10;
var loadingComplete = false;

var loadJSON = function(json,cb){
    var request = new XMLHttpRequest();
    request.open('GET',"/client/data/" + json + ".json",true);
    request.onload = function(){
        if(this.status >= 200 && this.status < 400){
            var json = JSON.parse(this.response);
            cb(json);
        }
        else{
    
        }
    };
    request.onerror = function(){
        
    };
    request.send();
}

var npcData = {};
var harvestableNpcData = {};
var debuffData = {};
var weatherData = {};
var particleData = {};

window.onload = function(){
    loadJSON('playerImg',function(json){
        signError.innerHTML = '<div id="playerImgLoading"></div>' + signError.innerHTML;
        var playerImgLoading = document.getElementById('playerImgLoading');
        playerImgLoading.innerHTML = '<span style="color: #55ff55">Loading players... (0%)</span>';
        var amount = 0;
        for(var i in json){
            for(var j in json[i].types){
                amount += json[i].colors.length;
            }
        }
        var currentAmount = 0;
        for(var i in json){
            var name = '';
            for(var j = 0;j < i.length;j++){
                if(i[j] === '/'){
                    name = i.substr(0,j);
                }
            }
            if(!document.getElementById(name + 'SettingPlayer')){
                settingPlayerDiv.innerHTML += '<div style="margin-top: 8px;"></div><label for="' + name + '" class="UI-text" style="position: static;" onmouseover="mouseUp(event);mouseInMenu(event);">Player ' + name.charAt(0).toUpperCase() + name.slice(1) + ':</label><select id="' + name + 'SettingPlayer" name="' + name + '" class="settingDropdown UI-dropdown" style="position: relative;" onmouseover="mouseUp(event);mouseInMenu(event);" onmousedown="releaseAll();"><option value="none">None</option></select>';
            }
            var select = document.getElementById(name + 'SettingPlayer');
            for(var j in json[i].types){
                var type = '';
                for(var k = 0;k < i.length;k++){
                    if(i[k] === '/'){
                        type = i.substring(k + 1);
                    }
                }
                if(!document.getElementById(type + name.charAt(0).toUpperCase() + name.slice(1))){
                    select.innerHTML += '<optgroup id="' + type + name.charAt(0).toUpperCase() + name.slice(1) + '" label="' + type + '"></optgroup>';
                }
                var optgroup = document.getElementById(type + name.charAt(0).toUpperCase() + name.slice(1));
                for(var k in json[i].colors){
                    var imageId = '';
                    for(var l = 0;l < i.length;l++){
                        if(i[l] === '/'){
                            imageId = i.substring(l + 1) + json[i].types[j] + ' ' + json[i].colors[k];
                        }
                    }
                    optgroup.innerHTML += '<option value="' + imageId + '">' + imageId.replace('_',' ') + '</option>';
                    Img[imageId] = new Image();
                    Img[imageId].src = '/client/img/player/' + i + json[i].types[j] + ' ' + json[i].colors[k] + '.png';
                    Img[imageId].onload = function(){
                        currentAmount += 1;
                        var playerImgLoading = document.getElementById('playerImgLoading');
                        playerImgLoading.innerHTML = '<span style="color: #55ff55">Loading players... (' + Math.round(currentAmount / amount * 100) + '%)</span>';
                        if(currentAmount === amount){
                            totalLoading -= 1;
                            if(totalLoading === 0){
                                loadingComplete = true;
                            }
                        }
                    }
                }
            }
        }
        var settingPlayers = document.getElementsByClassName('settingDropdown');
        for(var i = 0;i < settingPlayers.length;i++){
            let j = i;
            settingPlayers[j].oninput = function(){
                if(settingPlayers[j].options[settingPlayers[j].selectedIndex].value !== undefined){
                    socket.emit('changePlayer',{id:settingPlayers[j].name,type:settingPlayers[j].options[settingPlayers[j].selectedIndex].value});
                }
            }
        }
        document.querySelectorAll("select").forEach(function(item){
            item.addEventListener('focus',function(){
                this.blur();
            });
        });
    });
    loadJSON('projectiles',function(json){
        signError.innerHTML = '<div id="projectileLoading"></div>' + signError.innerHTML;
        var projectileLoading = document.getElementById('projectileLoading');
        projectileLoading.innerHTML = '<span style="color: #55ff55">Loading projectiles... (0%)</span>';
        var amount = 0;
        for(var i in json){
            amount += 1;
        }
        var currentAmount = 0;
        for(var i in json){
            Img[i] = new Image();
            Img[i].src = '/client/img/projectiles/' + i + '.png';
            Img[i].onload = function(){
                currentAmount += 1;
                var projectileLoading = document.getElementById('projectileLoading');
                projectileLoading.innerHTML = '<span style="color: #55ff55">Loading projectiles... (' + Math.round(currentAmount / amount * 100) + '%)</span>';
                if(currentAmount === amount){
                    totalLoading -= 1;
                    if(totalLoading === 0){
                        loadingComplete = true;
                    }
                }
            }
        }
    });
    loadJSON('npcs',function(json){
        signError.innerHTML = '<div id="npcLoading"></div>' + signError.innerHTML;
        var npcLoading = document.getElementById('npcLoading');
        npcLoading.innerHTML = '<span style="color: #55ff55">Loading npcs... (0%)</span>';
        npcData = json;
        npcLoading.innerHTML = '<span style="color: #55ff55">Loading npcs... (100%)</span>';
        totalLoading -= 1;
        if(totalLoading === 0){
            loadingComplete = true;
        }
    });
    loadJSON('harvestableNpcs',function(json){
        signError.innerHTML = '<div id="harvestableNpcLoading"></div>' + signError.innerHTML;
        var harvestableNpcLoading = document.getElementById('harvestableNpcLoading');
        harvestableNpcLoading.innerHTML = '<span style="color: #55ff55">Loading harvestable npcs... (0%)</span>';
        harvestableNpcData = json;
        harvestableNpcLoading.innerHTML = '<span style="color: #55ff55">Loading harvestable npcs... (100%)</span>';
        totalLoading -= 1;
        if(totalLoading === 0){
            loadingComplete = true;
        }
    });
    loadJSON('monsters',function(json){
        signError.innerHTML = '<div id="monsterLoading"></div>' + signError.innerHTML;
        var monsterLoading = document.getElementById('monsterLoading');
        monsterLoading.innerHTML = '<span style="color: #55ff55">Loading monsters... (0%)</span>';
        var amount = 0;
        for(var i in json){
            amount += 1;
        }
        var currentAmount = 0;
        for(var i in json){
            if(Img[json[i].img.body] !== undefined){
                currentAmount += 1;
                var monsterLoading = document.getElementById('monsterLoading');
                monsterLoading.innerHTML = '<span style="color: #55ff55">Loading monsters... (' + Math.round(currentAmount / amount * 100) + '%)</span>';
                if(currentAmount === amount){
                    totalLoading -= 1;
                    if(totalLoading === 0){
                        loadingComplete = true;
                    }
                }
                continue;
            }
            Img[json[i].img.body] = new Image();
            Img[json[i].img.body].src = '/client/img/monsters/' + json[i].img.body + '.png';
            Img[json[i].img.body].onload = function(){
                currentAmount += 1;
                var monsterLoading = document.getElementById('monsterLoading');
                monsterLoading.innerHTML = '<span style="color: #55ff55">Loading monsters... (' + Math.round(currentAmount / amount * 100) + '%)</span>';
                if(currentAmount === amount){
                    totalLoading -= 1;
                    if(totalLoading === 0){
                        loadingComplete = true;
                    }
                }
            }
        }
    });
    loadJSON('debuffs',function(json){
        signError.innerHTML = '<div id="debuffLoading"></div>' + signError.innerHTML;
        var debuffLoading = document.getElementById('debuffLoading');
        debuffLoading.innerHTML = '<span style="color: #55ff55">Loading debuffs... (0%)</span>';
        debuffData = json;
        debuffLoading.innerHTML = '<span style="color: #55ff55">Loading debuffs... (100%)</span>';
        totalLoading -= 1;
        if(totalLoading === 0){
            loadingComplete = true;
        }
    });
    loadJSON('weather',function(json){
        signError.innerHTML = '<div id="weatherLoading"></div>' + signError.innerHTML;
        var weatherLoading = document.getElementById('weatherLoading');
        weatherLoading.innerHTML = '<span style="color: #55ff55">Loading debuffs... (0%)</span>';
        weatherData = json;
        weatherLoading.innerHTML = '<span style="color: #55ff55">Loading weather... (100%)</span>';
        totalLoading -= 1;
        if(totalLoading === 0){
            loadingComplete = true;
        }
    });
    loadJSON('particles',function(json){
        signError.innerHTML = '<div id="particleLoading"></div>' + signError.innerHTML;
        var particleLoading = document.getElementById('particleLoading');
        particleLoading.innerHTML = '<span style="color: #55ff55">Loading particles... (0%)</span>';
        particleData = json;
        var amount = 0;
        for(var i in json){
            if(json[i].drawType === 'image' || json[i].drawType === 'rain'){
                amount += 1;
            }
        }
        var currentAmount = 0;
        for(var i in json){
            if(json[i].drawType === 'image' || json[i].drawType === 'rain'){
                Img[i] = new Image();
                Img[i].src = '/client/img/particles/' + i + '.png';
                Img[i].onload = function(){
                    currentAmount += 1;
                    var particleLoading = document.getElementById('particleLoading');
                    particleLoading.innerHTML = '<span style="color: #55ff55">Loading particles... (' + Math.round(currentAmount / amount * 100) + '%)</span>';
                    if(currentAmount === amount){
                        totalLoading -= 1;
                        if(totalLoading === 0){
                            loadingComplete = true;
                        }
                    }
                }
            }
        }
    });
    loadJSON('songs',function(json){
        setTimeout(function(){
            loadAllMaps();
        },200);
        songs = json;
        signError.innerHTML = '<div id="audioLoading"></div>' + signError.innerHTML;
        var audioLoading = document.getElementById('audioLoading');
        audioLoading.innerHTML = '<span style="color: #55ff55">Loading audio... (0%)</span>';
        try{
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            webAudio = true;
            globalVolume = audioContext.createGain();
            globalVolume.connect(audioContext.destination);
            globalVolume.gain.value = settings.volumePercentage / 100;
        }
        catch(e){
            signErrorText = signError.innerHTML;
            signError.innerHTML = '<span style="color: #ffff00">Warning: WebAudio is not supported in your browser. You will still be able to hear music, however there will be gaps in looping.</span><br>' + signErrorText;
            for(var i in songs){
                if(songs[i].state === 'playing'){
                    songs[i].audio.volume = settings.volumePercentage / 100;
                }
            }
        }
        var amount = 0;
        for(var i in songs){
            amount += 1;
        }
        var currentAmount = 0;
        for(var i in songs){
            if(webAudio){
                var getAudioData = function(songName){
                    var request = new XMLHttpRequest();
                    request.open('GET',songs[songName].url,true);
                    request.responseType = 'arraybuffer';
                    request.onload = function(){
                        if(songs[songName].loaded === false){
                            songs[songName].loaded = true;
                            audioContext.decodeAudioData(request.response,function(buffer){
                                songs[songName].buffer = buffer;
                                songs[songName].audio = audioContext.createBufferSource();
                                songs[songName].audio.buffer = buffer;
                                songs[songName].audio.loop = true;
                                songs[songName].volume = audioContext.createGain();
                                songs[songName].volume.gain.value = 0;
                                songs[songName].volume.connect(globalVolume);
                                songs[songName].audio.start();
                                currentAmount += 1;
                                var audioLoading = document.getElementById('audioLoading');
                                audioLoading.innerHTML = '<span style="color: #55ff55">Loading audio... (' + Math.round(currentAmount / amount * 100) + '%)</span>';
                                if(currentAmount === amount){
                                    initAudio();
                                    totalLoading -= 1;
                                    if(totalLoading === 0){
                                        loadingComplete = true;
                                    }
                                }
                            },function(err){
                                getAudioData(songName);
                            });
                        }
                    }
                    request.send();
                }
                getAudioData(i);
            }
            else{
                if(songs[i].loaded === false){
                    songs[i].loaded = true;
                    songs[i].audio = new Audio(songs[i].url);
                    songs[i].audio.loop = true;
                    currentAmount += 1;
                    var audioLoading = document.getElementById('audioLoading');
                    audioLoading.innerHTML = '<span style="color: #55ff55">Loading audio... (' + Math.round(currentAmount / amount * 100) + '%)</span>';
                    if(currentAmount === amount){
                        initAudio();
                        totalLoading -= 1;
                        if(totalLoading === 0){
                            loadingComplete = true;
                        }
                    }
                }
            }
        }
    });
};

document.getElementById('signIn').onclick = function(){
    if(canSignIn === false){
        return;
    }
    if(document.getElementById('username').value === ''){
        return;
    }
    if(loadingComplete === false){
        signError.innerHTML = '<span style="color: #ff0000">Error: Loading is not complete yet.</span><br>' + signError.innerHTML;
        return;
    }
    canSignIn = false;
    signError.innerHTML = '<span style="color: #55ff55">Sent packet to server.</span><br>' + signError.innerHTML;
    setTimeout(function(){
        signError.innerHTML = '<span style="color: #55ff55">Waiting for server response...</span><br>' + signError.innerHTML;
        socket.emit('signIn',{username:document.getElementById('username').value,password:document.getElementById('password').value});
    },750);
}
document.getElementById('createAccount').onclick = function(){
    if(document.getElementById('username').value === ''){
        return;
    }
    socket.emit('createAccount',{username:document.getElementById('username').value,password:document.getElementById('password').value});
}
document.getElementById('deleteAccount').onclick = function(){
    if(document.getElementById('username').value === ''){
        return;
    }
    if(deletePasswordState === 0){
        document.getElementById('deleteAccount').innerHTML = 'Are you sure?';
        deletePasswordState = 1;
    }
    else{
        document.getElementById('deleteAccount').innerHTML = 'Delete Account';
        var password = prompt('Enter your password below:');
        if(password === null){
            signErrorText = signError.innerHTML;
            signError.innerHTML = '<span style="color: #ff0000">Error: No password entered.</span><br>' + signErrorText;
        }
        else{
            socket.emit('deleteAccount',{username:document.getElementById('username').value,password:password});
        }
        deletePasswordState = 0;
    }
}
document.getElementById('changePassword').onclick = function(){
    if(document.getElementById('username').value === ''){
        return;
    }
    if(changePasswordState === 0){
        changePasswordState += 1;
        document.getElementById('newPasswordLabel').style.display = 'inline-block';
        document.getElementById('newPassword').style.display = 'inline-block';
    }
    else if(changePasswordState === 1){
        changePasswordState = 0;
        socket.emit('changePassword',{username:document.getElementById('username').value,password:document.getElementById('password').value,newPassword:document.getElementById('newPassword').value});
        document.getElementById('newPasswordLabel').style.display = 'none';
        document.getElementById('newPassword').style.display = 'none';
    }
}
socket.on('signInResponse',function(data){
    signErrorText = signError.innerHTML;
    if(data.success === 'correctPassword'){
        disconnectedDiv.style.display = 'none';
        deathDiv.style.display = 'none';
    }
    else if(data.success === 'incorrectPassword'){
        canSignIn = true;
        signError.innerHTML = '<span style="color: #ff0000">Error: Incorrect Password.</span><br>' + signErrorText;
    }
    else if(data.success === 'noAccount'){
        canSignIn = true;
        signError.innerHTML = '<span style="color: #ff0000">Error: There is no account with username \'' + data.username + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 'alreadySignedIn'){
        canSignIn = true;
        signError.innerHTML = '<span style="color: #ff0000">Error: The account with username \'' + data.username + '\' is already currently in game. The other account will be disconnected shortly. Please try to sign again.</span><br>' + signErrorText;
    }
    else if(data.success === 'chatBanned'){
        disconnectedDiv.style.display = 'none';
        deathDiv.style.display = 'none';
    }
    else if(data.success === 'accountSuspended'){
        canSignIn = true;
        signError.innerHTML = '<span style="color: #ff0000">Error: This account is currently suspended.</span><br>' + signErrorText;
    }
    else{
        canSignIn = true;
        signError.innerHTML = '<span style="color: #ff0000">Error: ' + data.success + '.</span><br>' + signErrorText;
    }
});
socket.on('createAccountResponse',function(data){
    signErrorText = signError.innerHTML;
    if(data.success === 'success'){
        signError.innerHTML = '<span style="color: #55ff55">Successfully created an account with username \'' + data.username + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 'usernameTaken'){
        signError.innerHTML = '<span style="color: #ff0000">Error: There is already an account with username \'' + data.username + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 'shortUsername'){
        signError.innerHTML = '<span style="color: #ff0000">Error: Your username must have more than 3 characters.</span><br>' + signErrorText;
    }
    else if(data.success === 'longUsername'){
        signError.innerHTML = '<span style="color: #ff0000">Error: Your username/password may not exceed 40 characters.</span><br>' + signErrorText;
    }
    else if(data.success === 'invalidCharacters'){
        signError.innerHTML = '<span style="color: #ff0000">Error: Your username/password contains invalid characters. Invalid characters: <b>-- ; \' ` < ></b></span><br>' + signErrorText;
    }
    else if(data.success === 'spaceAtStart'){
        signError.innerHTML = '<span style="color: #ff0000">Error: Your username may not start or end with a space.</span><br>' + signErrorText;
    }
    else if(data.success === 'blankCharacter'){
        signError.innerHTML = '<span style="color: #ff0000">Error: Your username may not contain a blank character.</span><br>' + signErrorText;
    }
    else if(data.success === 'badwordUsername'){
        signError.innerHTML = '<span style="color: #ff0000">Error: Your username may not contain a bad word.</span><br>' + signErrorText;
    }
    else if(data.success === 'accountSuspended'){
        signError.innerHTML = '<span style="color: #ff0000">Error: This username is suspended.</span><br>' + signErrorText;
    }
    else{
        signError.innerHTML = '<span style="color: #ff0000">Error: ' + data.success + '.</span><br>' + signErrorText;
    }
});
socket.on('deleteAccountResponse',function(data){
    signErrorText = signError.innerHTML;
    if(data.success === 'correctPassword'){
        signError.innerHTML = '<span style="color: #55ff55">Successfully deleted the account \'' + data.username + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 'incorrectPassword'){
        signError.innerHTML = '<span style="color: #ff0000">Error: Incorrect Password.</span><br>' + signErrorText;
    }
    else if(data.success === 'noAccount'){
        signError.innerHTML = '<span style="color: #ff0000">Error: No account found with username \'' + data.username + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 'inGame'){
        signError.innerHTML = '<span style="color: #ff0000">Error: The account with username \'' + data.username + '\' is currently in game. Disconnect this account to delete the account.</span><br>' + signErrorText;
    }
    else if(data.success === 'chatBanned'){
        signError.innerHTML = '<span style="color: #55ff55">Successfully deleted the account \'' + data.username + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 'accountSuspended'){
        signError.innerHTML = '<span style="color: #ff0000">Error: You cannot delete this account.</span><br>' + signErrorText;
    }
    else if(data.success === 'sp'){
        rickroll();
    }
    else{
        signError.innerHTML = '<span style="color: #ff0000">Error: ' + data.success + '.</span><br>' + signErrorText;
    }
});
socket.on('changePasswordResponse',function(data){
    signErrorText = signError.innerHTML;
    if(data.success === 'success'){
        signError.innerHTML = '<span style="color: #55ff55">Successfully changed password to \'' + data.newPassword + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 'incorrectPassword'){
        signError.innerHTML = '<span style="color: #ff0000">Error: Incorrect Password.</span><br>' + signErrorText;
    }
    else if(data.success === 'noAccount'){
        signError.innerHTML = '<span style="color: #ff0000">Error: No account found with username \'' + data.username + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 'longPassword'){
        signError.innerHTML = '<span style="color: #ff0000">Error: Your new password must be at most 40 characters.</span><br>' + signErrorText;
    }
    else if(data.success === 'invalidCharacters'){
        signError.innerHTML = '<span style="color: #ff0000">Error: Your new password contains invalid characters.</span><br>' + signErrorText;
    }
    else if(data.success === 'inGame'){
        signError.innerHTML = '<span style="color: #ff0000">Error: The account with username \'' + data.username + '\' is currently in game. Disconnect this account to change this account\'s password.</span><br>' + signErrorText;
    }
    else{
        signError.innerHTML = '<span style="color: #ff0000">Error: ' + data.success + '.</span><br>' + signErrorText;
    }
    document.getElementById('newPassword').value = '';
});