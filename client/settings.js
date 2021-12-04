var settings = {
    inventoryOpen:false,
    craftOpen:false,
    tradeOpen:false,
    dialogueOpen:false,
    settingOpen:false,
    playerListOpen:false,
    shopOpen:false,
    particlesPercentage:100,
    entityFadeOut:true,
    textSpeed:2,
    volumePercentage:100,
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
playerListExit.onclick = function(){
    closePlayerList();
}
particleSlider.oninput = function(){
    settings.particlesPercentage = parseInt(particleSlider.value);
    particleHeader.innerHTML = 'Particles: ' + particleSlider.value + '%';
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
    for(var i in songs){
        if(songs[i].state === 'playing'){
            songs[i].audio.volume = settings.volumePercentage / 100;
        }
    }
}
openInventory = function(){
    settings.inventoryOpen = true;
    inventoryBackground.style.display = 'inline-block';
    inventoryDiv.style.display = 'inline-block';
}
closeInventory = function(){
    settings.inventoryOpen = false;
    inventoryBackground.style.display = 'none';
    inventoryDiv.style.display = 'none';
    var rect = inventoryBackground.getBoundingClientRect();
    if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
        itemMenu.style.display = 'none';
    }
}
toggleInventory = function(){
    settings.inventoryOpen = !settings.inventoryOpen;
    if(settings.inventoryOpen){
        inventoryBackground.style.display = 'inline-block';
        inventoryDiv.style.display = 'inline-block';
    }
    else{
        inventoryBackground.style.display = 'none';
        inventoryDiv.style.display = 'none';
        var rect = inventoryBackground.getBoundingClientRect();
        if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
            itemMenu.style.display = 'none';
        }
    }
}
openCraft = function(){
    settings.craftOpen = true;
    craftBackground.style.display = 'inline-block';
    craftDiv.style.display = 'inline-block';
}
closeCraft = function(){
    settings.craftOpen = false;
    craftBackground.style.display = 'none';
    craftDiv.style.display = 'none';
    var rect = craftBackground.getBoundingClientRect();
    if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
        itemMenu.style.display = 'none';
    }
}
toggleCraft = function(){
    settings.craftOpen = !settings.craftOpen;
    if(settings.craftOpen){
        craftBackground.style.display = 'inline-block';
        craftDiv.style.display = 'inline-block';
    }
    else{
        craftBackground.style.display = 'none';
        craftDiv.style.display = 'none';
        var rect = craftBackground.getBoundingClientRect();
        if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
            itemMenu.style.display = 'none';
        }
    }
}
openTrade = function(){
    settings.tradeOpen = true;
    tradeBackground.style.display = 'inline-block';
    tradeDiv.style.display = 'inline-block';
}
closeTrade = function(){
    settings.tradeOpen = false;
    tradeBackground.style.display = 'none';
    tradeDiv.style.display = 'none';
    var rect = tradeBackground.getBoundingClientRect();
    if(rawMouseX > rect.left && rawMouseX < rect.right && rawMouseY > rect.top && rawMouseY < rect.bottom){
        itemMenu.style.display = 'none';
    }
}
openDialogue = function(){
    settings.dialogueOpen = true;
    dialogueBackground.style.display = 'inline-block';
    dialogueDiv.style.display = 'inline-block';
    closeInventory();
    closeCraft();
}
closeDialogue = function(){
    settings.dialogueOpen = false;
    dialogueBackground.style.display = 'none';
    dialogueDiv.style.display = 'none';
}
openSetting = function(){
    settings.settingOpen = true;
    settingBackground.style.display = 'inline-block';
    settingDiv.style.display = 'inline-block';
}
closeSetting = function(){
    settings.settingOpen = false;
    settingBackground.style.display = 'none';
    settingDiv.style.display = 'none';
}
toggleSetting = function(){
    settings.settingOpen = !settings.settingOpen;
    if(settings.settingOpen){
        settingBackground.style.display = 'inline-block';
        settingDiv.style.display = 'inline-block';
    }
    else{
        settingBackground.style.display = 'none';
        settingDiv.style.display = 'none';
    }
}
openShop = function(){
    openInventory();
    settings.shopOpen = true;
    shopBackground.style.display = 'inline-block';
    shopDiv.style.display = 'inline-block';
}
closeShop = function(){
    settings.shopOpen = false;
    shopBackground.style.display = 'none';
    shopDiv.style.display = 'none';
}
openPlayerList = function(){
    settings.playerListOpen = true;
    playerListBackground.style.display = 'inline-block';
    playerListDiv.style.display = 'inline-block';
}
closePlayerList = function(){
    settings.playerListOpen = false;
    playerListBackground.style.display = 'none';
    playerListDiv.style.display = 'none';
}
togglePlayerList = function(){
    settings.playerListOpen = !settings.playerListOpen;
    if(settings.playerListOpen){
        playerListBackground.style.display = 'inline-block';
        playerListDiv.style.display = 'inline-block';
    }
    else{
        playerListBackground.style.display = 'none';
        playerListDiv.style.display = 'none';
    }
}