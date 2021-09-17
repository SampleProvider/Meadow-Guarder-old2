var settings = {
    inventoryOpen:false,
    craftOpen:false,
    settingOpen:false,
};

inventoryButton.onclick = function(){
    toggleInventory();
}
craftButton.onclick = function(){
    toggleCraft();
}
settingButton.onclick = function(){
    toggleSetting();
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
        var itemMenu = itemMenu;
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
            var itemMenu = itemMenu;
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
        var itemMenu = itemMenu;
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
            var itemMenu = itemMenu;
            itemMenu.style.display = 'none';
        }
    }
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
