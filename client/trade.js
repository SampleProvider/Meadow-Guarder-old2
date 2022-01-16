socket.on('openTrade',function(pack){
    openTrade();
    openInventory();
    canDragTradeItems = true;
    traderAccepted.innerHTML = 'Pending Accept';
    traderAccepted.style.color = '#eeee33';
    acceptTrade.style.display = 'inline-block';
    acceptTrade.innerHTML = 'Accept Trade';
    declineTrade.style.display = 'inline-block';
    traderLabel.innerHTML = pack + '\'s Items';
    for(var i = 0;i < 18;i++){
        inventory.items['trade' + i] = {};
    }
    inventory.refreshInventory();
});
socket.on('updateTrade',function(pack){
    if(pack.index >= 0 && pack.index <= 8){
        inventory.items['trade' + (9 + pack.index)] = {
            id:pack.id,
            amount:pack.amount,
        };
        inventory.refreshItem('trade' + (9 + pack.index));
    }
});
socket.on('closeTrade',function(pack){
    closeTrade();
});
socket.on('traderAccepted',function(pack){
    if(pack.final === false){
        traderAccepted.innerHTML = 'Trader Accepted';
        traderAccepted.style.color = '#33ee33';
    }
    else{
        traderAccepted.innerHTML = 'Trader Final Accepted';
        traderAccepted.style.color = '#33ee33';
    }
});
socket.on('finalAccept',function(data){
    traderAccepted.innerHTML = 'Pending Final Accept';
    traderAccepted.style.color = '#eeee33';
    acceptTrade.style.display = 'inline-block';
    acceptTrade.innerHTML = 'Final Accept';
    declineTrade.style.display = 'inline-block';
});

var canDragTradeItems = true;

acceptTrade.onclick = function(){
    acceptTrade.style.display = 'none';
    socket.emit('acceptTrade');
    canDragTradeItems = false;
    for(var i in crafts){
        inventory.updateCraftClient(i);
    }
}

declineTrade.onclick = function(){
    acceptTrade.style.display = 'none';
    declineTrade.style.display = 'none';
    socket.emit('declineTrade');
    canDragTradeItems = false;
    for(var i in crafts){
        inventory.updateCraftClient(i);
    }
}