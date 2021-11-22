var settings = {
    inventoryOpen:false,
    craftOpen:false,
    tradeOpen:false,
    dialogueOpen:false,
    settingOpen:false,
    playerListOpen:false,
    shopOpen:false,
};

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
playerListExit.onclick = function(){
    closePlayerList();
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