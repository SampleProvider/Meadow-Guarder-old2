var settings = {
    inventoryOpen:false,
};

document.getElementById('inventoryButton').onclick = function(){
    settings.inventoryOpen = !settings.inventoryOpen;
    if(settings.inventoryOpen){
        document.getElementById('inventoryBackground').style.display = 'inline-block';
        document.getElementById('inventoryDiv').style.display = 'inline-block';
    }
    else{
        document.getElementById('inventoryBackground').style.display = 'none';
        document.getElementById('inventoryDiv').style.display = 'none';
    }
}
openInventory = function(){
    settings.inventoryOpen = true;
    document.getElementById('inventoryBackground').style.display = 'inline-block';
    document.getElementById('inventoryDiv').style.display = 'inline-block';
}
closeInventory = function(){
    settings.inventoryOpen = false;
    document.getElementById('inventoryBackground').style.display = 'none';
    document.getElementById('inventoryDiv').style.display = 'none';
}
toggleInventory = function(){
    settings.inventoryOpen = !settings.inventoryOpen;
    if(settings.inventoryOpen){
        document.getElementById('inventoryBackground').style.display = 'inline-block';
        document.getElementById('inventoryDiv').style.display = 'inline-block';
    }
    else{
        document.getElementById('inventoryBackground').style.display = 'none';
        document.getElementById('inventoryDiv').style.display = 'none';
    }
}