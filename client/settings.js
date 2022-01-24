var settings = {
    inventoryOpen:false,
    craftOpen:false,
    tradeOpen:false,
    dialogueOpen:false,
    settingOpen:false,
    shopOpen:false,
    bookOpen:false,
    particlesPercentage:100,
    darknessEffects:true,
    entityFadeOut:true,
    textSpeed:2,
    volumePercentage:100,
    renderDistance:2,
    chatBackground:false,
};

var setCookie = function(){
    for(var i in settings){
        if(i.includes('Open') === false){
            document.cookie = i + "=" + settings[i] + ";path=/";
        }
    }
}

var getCookie = function(){
    for(var i in settings){
        if(i.includes('Open') === false){
            var name = i + "=";
            var ca = document.cookie.split(';');
            for(var j = 0;j < ca.length;j++){
                var c = ca[j];
                while(c.charAt(0) === ' '){
                    c = c.substring(1);
                }
                if(c.indexOf(name) === 0){
                    settings[i] = c.substring(name.length,c.length);
                    if(i === 'particlesPercentage'){
                        settings[i] = parseInt(settings[i]);
                        particleSlider.value = settings[i];
                        particleHeader.innerHTML = 'Particles: ' + particleSlider.value + '%';
                    }
                    if(i === 'darknessEffects'){
                        if(settings[i] === 'true'){
                            settings[i] = true;
                            darknessEffectsButton.innerHTML = 'Darkness Effects: Enabled';
                        }
                        else{
                            settings[i] = false;
                            darknessEffectsButton.innerHTML = 'Darkness Effects: Disabled';
                            resetWeather();
                        }
                    }
                    if(i === 'entityFadeOut'){
                        if(settings[i] === 'true'){
                            settings[i] = true;
                            entityFadeOutButton.innerHTML = 'Entities Fade Out';
                        }
                        else{
                            settings[i] = false;
                            entityFadeOutButton.innerHTML = 'Entities Don\'t Fade Out';
                        }
                    }
                    if(i === 'textSpeed'){
                        settings[i] = parseInt(settings[i]);
                        textSpeedSlider.value = settings[i];
                        textSpeedHeader.innerHTML = 'Text Speed: ' + textSpeedSlider.value;
                    }
                    if(i === 'volumePercentage'){
                        settings[i] = parseInt(settings[i]);
                        volumePercentageSlider.value = settings[i];
                        volumePercentageHeader.innerHTML = 'Volume: ' + volumePercentageSlider.value + '%';
                    }
                    if(i === 'renderDistance'){
                        settings[i] = parseInt(settings[i]);
                        renderDistanceSlider.value = settings[i];
                        renderDistanceHeader.innerHTML = 'Render Distance: ' + renderDistanceSlider.value;
                        socket.emit('renderDistance',settings.renderDistance);
                    }
                    if(i === 'chatBackground'){
                        if(settings[i] === 'true'){
                            settings[i] = true;
                            chatBackgroundButton.innerHTML = 'Chat Background: Enabled';
                            chatDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                        }
                        else{
                            settings[i] = false;
                            chatBackgroundButton.innerHTML = 'Chat Background: Disabled';
                            chatDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                        }
                    }
                }
            }
        }
    }
}

getCookie();

inventoryButton.onclick = function(){
    toggleInventory();
}
inventoryExit.onclick = function(){
    closeInventory();
}
craftButton.onclick = function(){
    toggleCraft();
}
craftExit.onclick = function(){
    closeCraft();
}
settingButton.onclick = function(){
    toggleSetting();
}
settingExit.onclick = function(){
    closeSetting();
}
shopExit.onclick = function(){
    closeShop();
}
bookButton.onclick = function(){
    toggleBook();
}
openBookPage = function(page){
    var bookPages = document.getElementsByClassName('bookPageDiv');
    for(var i in bookPages){
        if(bookPages[i].style){
            bookPages[i].style.display = 'none';
        }
    }
    if(page === 'worldMap'){
        bookDiv.style.backgroundImage = 'url("/client/img/map.png")';
    }
    else{
        bookDiv.style.backgroundImage = 'url("/client/img/book.png")';
    }
    document.getElementById(page + 'Div').style.display = 'inline-block';
}
var mapPosition1 = 0;
var mapPosition2 = 0;
var mapPosition3 = 0;
var mapPosition4 = 0;
var mapDragging = false;
var inMap = false;
var mapSize = 75;
worldMap.style.backgroundSize = '75%';
worldMapContainer.onmousedown = function(e){
    mapDragging = true;
    e = e || window.event;
    e.preventDefault();
    mapPosition3 = e.clientX;
    mapPosition4 = e.clientY;
}
worldMapContainer.onmousemove = function(e){
    inMap = true;
    if(!mapDragging){
        return;
    }
    e = e || window.event;
    e.preventDefault();
    mapPosition1 = mapPosition3 - e.clientX;
    mapPosition2 = mapPosition4 - e.clientY;
    mapPosition3 = e.clientX;
    mapPosition4 = e.clientY;
    worldMap.style.top = (worldMap.offsetTop - mapPosition2) + "px";
    worldMap.style.left = (worldMap.offsetLeft - mapPosition1) + "px";
}
worldMapContainer.onmouseup = function(e){
    mapDragging = false;
}
worldMapContainer.onmouseout = function(e){
    inMap = false;
    if(!mapDragging){
        return;
    }
    mapDragging = false;
    e = e || window.event;
    e.preventDefault();
    mapPosition1 = mapPosition3 - e.clientX;
    mapPosition2 = mapPosition4 - e.clientY;
    mapPosition3 = e.clientX;
    mapPosition4 = e.clientY;
    worldMap.style.top = (worldMap.offsetTop - mapPosition2) + "px";
    worldMap.style.left = (worldMap.offsetLeft - mapPosition1) + "px";
}
switchToSetting = function(setting){
    var settingScreens = document.getElementsByClassName('settingsDiv');
    for(var i in settingScreens){
        if(settingScreens[i].style){
            settingScreens[i].style.display = 'none';
        }
    }
    var settingNavigationButtons = document.getElementsByClassName('settingNavigationButton');
    for(var i in settingNavigationButtons){
        if(settingNavigationButtons[i].style){
            settingNavigationButtons[i].style.backgroundColor = '#ffffff';
            settingNavigationButtons[i].style.border = '1px solid #000000';
        }
    }
    document.getElementById(setting).style.backgroundColor = '#00ff90';
    document.getElementById(setting).style.borderBottom = 'none';
    document.getElementById(setting + 'Div').style.display = 'inline-block';
}
switchToSetting('mainSettings');
particleSlider.oninput = function(){
    settings.particlesPercentage = parseInt(particleSlider.value);
    particleHeader.innerHTML = 'Particles: ' + particleSlider.value + '%';
    setCookie();
}
darknessEffectsButton.onclick = function(){
    settings.darknessEffects = !settings.darknessEffects;
    if(settings.darknessEffects === true){
        darknessEffectsButton.innerHTML = 'Darkness Effects: Enabled';
        if(Player.list[selfId]){
            if(Player.list[selfId].map === 'World'){
                setWeather(currentWeather);
            }
        }
    }
    else{
        darknessEffectsButton.innerHTML = 'Darkness Effects: Disabled';
        resetWeather();
    }
    setCookie();
}
entityFadeOutButton.onclick = function(){
    settings.entityFadeOut = !settings.entityFadeOut;
    if(settings.entityFadeOut === true){
        entityFadeOutButton.innerHTML = 'Entities Fade Out';
    }
    else{
        entityFadeOutButton.innerHTML = 'Entities Don\'t Fade Out';
    }
    setCookie();
}
textSpeedSlider.oninput = function(){
    settings.textSpeed = parseInt(textSpeedSlider.value);
    textSpeedHeader.innerHTML = 'Text Speed: ' + textSpeedSlider.value;
    setCookie();
}
volumePercentageSlider.oninput = function(){
    var oldVolumePercentage = settings.volumePercentage;
    settings.volumePercentage = parseInt(volumePercentageSlider.value);
    volumePercentageHeader.innerHTML = 'Volume: ' + volumePercentageSlider.value + '%';
    setCookie();
    if(webAudio){
        globalVolume.gain.value = settings.volumePercentage / 100;
    }
    else{
        for(var i in songs){
            if(songs[i].state === 'playing'){
                songs[i].audio.volume = songs[i].audio.volume / oldVolumePercentage * settings.volumePercentage;
            }
        }
    }
}
renderDistanceSlider.oninput = function(){
    settings.renderDistance = parseInt(renderDistanceSlider.value);
    renderDistanceHeader.innerHTML = 'Render Distance: ' + renderDistanceSlider.value;
    socket.emit('renderDistance',settings.renderDistance);
    setCookie();
    renderMap(Player.list[selfId].map);
}
chatBackgroundButton.onclick = function(){
    settings.chatBackground = !settings.chatBackground;
    if(settings.chatBackground === true){
        chatBackgroundButton.innerHTML = 'Chat Background: Enabled';
        chatDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    }
    else{
        chatBackgroundButton.innerHTML = 'Chat Background: Disabled';
        chatDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    }
    setCookie();
}

openInventory = function(){
    settings.inventoryOpen = true;
    inventoryDiv.style.display = 'inline-block';
}
closeInventory = function(){
    settings.inventoryOpen = false;
    inventoryDiv.style.display = 'none';
    var rect = inventoryDiv.getBoundingClientRect();
    if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
        itemMenu.style.display = 'none';
    }
}
toggleInventory = function(){
    settings.inventoryOpen = !settings.inventoryOpen;
    if(settings.inventoryOpen){
        inventoryDiv.style.display = 'inline-block';
    }
    else{
        inventoryDiv.style.display = 'none';
        var rect = inventoryDiv.getBoundingClientRect();
        if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
            itemMenu.style.display = 'none';
        }
    }
}
openCraft = function(){
    settings.craftOpen = true;
    craftDiv.style.display = 'inline-block';
}
closeCraft = function(){
    settings.craftOpen = false;
    craftDiv.style.display = 'none';
    var rect = craftDiv.getBoundingClientRect();
    if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
        itemMenu.style.display = 'none';
    }
}
toggleCraft = function(){
    settings.craftOpen = !settings.craftOpen;
    if(settings.craftOpen){
        craftDiv.style.display = 'inline-block';
    }
    else{
        craftDiv.style.display = 'none';
        var rect = craftDiv.getBoundingClientRect();
        if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
            itemMenu.style.display = 'none';
        }
    }
}
openTrade = function(){
    settings.tradeOpen = true;
    tradeDiv.style.display = 'inline-block';
}
closeTrade = function(){
    settings.tradeOpen = false;
    tradeDiv.style.display = 'none';
    var rect = tradeDiv.getBoundingClientRect();
    if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
        itemMenu.style.display = 'none';
    }
}
openDialogue = function(){
    settings.dialogueOpen = true;
    dialogueDiv.style.display = 'inline-block';
    closeInventory();
    closeCraft();
}
closeDialogue = function(){
    settings.dialogueOpen = false;
    dialogueDiv.style.display = 'none';
}
openSetting = function(){
    settings.settingOpen = true;
    settingDiv.style.display = 'inline-block';
}
closeSetting = function(){
    settings.settingOpen = false;
    settingDiv.style.display = 'none';
}
toggleSetting = function(){
    settings.settingOpen = !settings.settingOpen;
    if(settings.settingOpen){
        settingDiv.style.display = 'inline-block';
    }
    else{
        settingDiv.style.display = 'none';
    }
}
openShop = function(){
    openInventory();
    settings.shopOpen = true;
    shopDiv.style.display = 'inline-block';
}
closeShop = function(){
    settings.shopOpen = false;
    shopDiv.style.display = 'none';
}
openBook = function(){
    settings.bookOpen = true;
    bookDiv.style.display = 'inline-block';
}
closeBook = function(){
    settings.bookOpen = false;
    bookDiv.style.display = 'none';
}
toggleBook = function(){
    settings.bookOpen = !settings.bookOpen;
    if(settings.bookOpen){
        bookDiv.style.display = 'inline-block';
    }
    else{
        bookDiv.style.display = 'none';
    }
}