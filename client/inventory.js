Inventory = function(socket,server){
    var self = {
        socket:socket,
        server:server,
        items:{},
        itemDescriptions:{},
        craftItems:{},
        craftDescriptions:{},
        draggingItem:-1,
        draggingX:-1,
        draggingY:-1,
        maxSlots:20,
        hotbarSelectedItem:-1,
        updateStats:true,
    }
    self.getRarityColor = function(rarity){
        if(rarity === 0){
            return '#ffffff';
        }
        if(rarity === 1){
            return '#55ff55';
        }
        if(rarity === 2){
            return '#5555ff';
        }
        if(rarity === 3){
            return '#ff9900';
        }
    }
    self.addItem = function(id,amount){
        if(!Item.list[id]){
            return false;
        }
        var hasSpace = 0;
        var index = -1;
        for(var i in self.items){
            if(self.items[i] === null || self.items[i] === undefined){
                self.items[i] = {};
            }
            if(i >= 0){
                if(hasSpace < 1 && self.items[i].id === undefined){
                    hasSpace = 1;
                    index = i;
                }
                if(hasSpace < 2 && self.items[i].id === id && Item.list[id].maxStack > self.items[i].amount && amount !== undefined){
                    hasSpace = 2;
                    index = i;
                }
            }
        }
        if(hasSpace === 1){
            if(amount > Item.list[id].maxStack){
                self.items[index] = {id:id,amount:Item.list[id].maxStack || 1};
                self.addItem(id,amount - Item.list[id].maxStack,enchantments);
            }
            else{
                self.items[index] = {id:id,amount:amount || 1};
            }
            if(index + '' === self.hotbarSelectedItem + ''){
                self.updateStats = true;
            }
            self.refreshItem(index);
            self.socket.emit('updateCraft');
            return index;
        }
        else if(hasSpace === 2){
            if(amount + self.items[index].amount > Item.list[id].maxStack){
                self.items[index] = {id:id,amount:Item.list[id].maxStack};
                self.addItem(id,amount + self.items[index].amount - Item.list[id].maxStack);
            }
            else{
                self.items[index] = {id:id,amount:amount + self.items[index].amount};
            }
            self.refreshItem(index);
            self.socket.emit('updateCraft');
            return index;
        }
        return false;
    }
    self.removeItem = function(item,amount){
        var amountFound = 0;
        for(var i in self.items){
            if(self.items[i].id === item){
                if(amountFound + self.items[i].amount >= amount){
                    self.items[i].amount = self.items[i].amount - (amount - amountFound);
                    if(self.items[i].amount === 0){
                        self.items[i] = {};
                        if(i + '' === self.hotbarSelectedItem + ''){
                            self.updateStats = true;
                        }
                    }
                    self.refreshItem(i);
                    self.socket.emit('updateCraft');
                    return true;
                }
                amountFound += self.items[i].amount;
                self.items[i] = {};
                if(i + '' === self.hotbarSelectedItem + ''){
                    self.updateStats = true;
                }
                self.refreshItem(i);
            }
        }
        self.socket.emit('updateCraft');
        return false;
    }
    self.hasItem = function(item,amount){
        var amountFound = 0;
        for(var i in self.items){
            if(self.items[i].id === item){
                amountFound += self.items[i].amount;
                if(amountFound >= amount){
                    return true;
                }
            }
        }
        return false;
    }
    self.addItemClient = function(index){
        var slot = document.getElementById("inventorySlot" + index);
        if(slot){
            slot.innerHTML = "";
            slot.style.border = "1px solid #000000";
            slot.onmousedown = function(){};
            slot.className += ' inventoryMenuSlot';
            if(index >= 0 && index <= 9){
                var hotbarSlot = document.getElementById("hotbarSlot" + index);
                hotbarSlot.innerHTML = "";
                if(index === self.hotbarSelectedItem){
                    var hotbarSlots = document.getElementsByClassName('hotbarSlot');
                    for(var i = 0;i < hotbarSlots.length;i++){
                        hotbarSlots[i].style.border = '1px solid #000000';
                        hotbarSlots[i].className = 'hotbarSlot hotbarSlotNormal';
                    }
                    hotbarSlot.style.border = '1px solid #ffff00';
                    hotbarSlot.className = 'hotbarSlot hotbarSlotSelected';
                }
                hotbarSlot.onclick = function(){
                    var hotbarSlots = document.getElementsByClassName('hotbarSlot');
                    for(var i = 0;i < hotbarSlots.length;i++){
                        hotbarSlots[i].style.border = '1px solid #000000';
                        hotbarSlots[i].className = 'hotbarSlot hotbarSlotNormal';
                    }
                    hotbarSlot.style.border = '1px solid #ffff00';
                    hotbarSlot.className = 'hotbarSlot hotbarSlotSelected';
                    self.hotbarSelectedItem = index;
                    socket.emit('hotbarSelectedItem',self.hotbarSelectedItem);
                }
            }
            if(self.items[index].id){
                var item = Item.list[self.items[index].id];
                slot.innerHTML = "<image id='itemImage" + index + "' class='itemImage' src='/client/img/items/" + self.items[index].id + ".png'></image>";
                var description = '';
                if(item.equip !== 'consume' && item.equip !== 'hotbar' && item.equip !== undefined){
                    description += 'When Equipped:<br>';
                }
                if(item.damage){
                    if(item.damageType){
                        description += '<span style="color: #33ee33">+' + item.damage + ' ' + item.damageType + ' damage.</span><br>';
                    }
                    if(item.critChance){
                        description += '<span style="color: #33ee33">+' + item.critChance * 100 + '% critical strike chance.</span><br>';
                    }
                }
                if(item.defense){
                    description += '<span style="color: #33ee33">+' + item.defense + ' defense.</span><br>';
                }
                if(item.manaCost){
                    description += 'Uses ' + item.manaCost + ' mana.<br>';
                }
                if(item.extraHp){
                    description += '<span style="color: #33ee33">+' + item.extraHp + ' max health.</span><br>';
                }
                if(item.extraMana){
                    description += '<span style="color: #33ee33">+' + item.extraMana + ' max mana.</span><br>';
                }
                if(item.extraHpRegen){
                    description += '<span style="color: #33ee33">+' + item.extraHpRegen + ' health regeneration.</span><br>';
                }
                if(item.extraManaRegen){
                    description += '<span style="color: #33ee33">+' + item.extraManaRegen + ' mana regeneration.</span><br>';
                }
                if(item.extraDamage){
                    description += '<span style="color: #33ee33">+' + item.extraDamage + ' damage.</span><br>';
                }
                if(item.extraMovementSpeed){
                    description += '<span style="color: #33ee33">+' + item.extraMovementSpeed + ' movement speed.</span><br>';
                }
                var image = document.getElementById('itemImage' + index);
                if(item.equip === 'consume'){
                    description += 'Right click to use.<br>';
                }
                var itemName = item.name;
                if(self.items[index].amount !== 1){
                    itemName += ' (' + self.items[index].amount + ')';
                }
                if(item.description){
                    self.itemDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + item.description + '</div>';
                }
                else{
                    self.itemDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + '</div>';
                }
                if(index >= 0 && index <= 9){
                    hotbarSlot.innerHTML = "<image id='hotbarItemImage" + index + "' class='itemImage hotbarItemImage' src='/client/img/items/" + self.items[index].id + ".png'></image>";
                    var hotbarItemImage = document.getElementById('hotbarItemImage' + index);
                    hotbarItemImage.draggable = false;
                    hotbarItemImage.onclick = function(){
                        var hotbarSlots = document.getElementsByClassName('hotbarSlot');
                        for(var i = 0;i < hotbarSlots.length;i++){
                            hotbarSlots[i].style.border = '1px solid #000000';
                            hotbarSlots[i].className = 'hotbarSlot hotbarSlotNormal';
                        }
                        hotbarSlot.style.border = '1px solid #ffff00';
                        hotbarSlot.className = 'hotbarSlot hotbarSlotSelected';
                        self.hotbarSelectedItem = index;
                        socket.emit('hotbarSelectedItem',self.hotbarSelectedItem);
                    }
                }
                image.draggable = false;
                slot.onclick = function(e){
                    if(e.button === 0){
                        self.draggingItem = index;
                        var rect = image.getBoundingClientRect();
                        self.draggingX = rawMouseX - rect.left;
                        self.draggingY = rawMouseY - rect.top;
                        itemMenu.style.display = 'none';
                        slot.innerHTML = "";
                        draggingItem.innerHTML = "<image class='itemImage' draggable=false src='/client/img/items/" + self.items[index].id + ".png'></image>";
                        draggingItem.style.left = rect.left + 'px';
                        draggingItem.style.top = rect.top + 'px';
                    }
                    else if(e.button === 2){
                        if(item.equip === 'consume'){
                            socket.emit('useItem',index);
                        }
                        else if(self.items[item.equip] !== undefined){
                            socket.emit('dragItem',{
                                index1:index,
                                index2:item.equip,
                            });
                            itemMenu.style.display = 'none';
                        }
                        else{
                            
                        }
                    }
                }
            }
        }
    }
    self.addCraftClient = function(index){
        var slot = document.getElementById("craftSlot" + index);
        if(slot){
            slot.innerHTML = "";
            slot.style.border = "1px solid #000000";
            slot.onmousedown = function(){};
            slot.className += ' craftMenuSlot';
            if(self.craftItems.items[index].id){
                var item = Item.list[self.craftItems.items[index].id];
                slot.innerHTML = "<image id='craftImage" + index + "' class='itemImage' src='/client/img/items/" + self.craftItems.items[index].id + ".png'></image>";
                var description = '';
                if(item.equip !== 'consume' && item.equip !== 'hotbar' && item.equip !== undefined){
                    description += 'When Equipped:<br>';
                }
                if(item.damage){
                    if(item.damageType){
                        description += '<span style="color: #33ee33">+' + item.damage + ' ' + item.damageType + ' damage.</span><br>';
                    }
                    if(item.critChance){
                        description += '<span style="color: #33ee33">+' + item.critChance * 100 + '% critical strike chance.</span><br>';
                    }
                }
                if(item.defense){
                    description += '<span style="color: #33ee33">+' + item.defense + ' defense.</span><br>';
                }
                if(item.manaCost){
                    description += 'Uses ' + item.manaCost + ' mana.<br>';
                }
                if(item.extraHp){
                    description += '<span style="color: #33ee33">+' + item.extraHp + ' max health.</span><br>';
                }
                if(item.extraMana){
                    description += '<span style="color: #33ee33">+' + item.extraMana + ' max mana.</span><br>';
                }
                if(item.extraHpRegen){
                    description += '<span style="color: #33ee33">+' + item.extraHpRegen + ' health regeneration.</span><br>';
                }
                if(item.extraManaRegen){
                    description += '<span style="color: #33ee33">+' + item.extraManaRegen + ' mana regeneration.</span><br>';
                }
                if(item.extraDamage){
                    description += '<span style="color: #33ee33">+' + item.extraDamage + ' damage.</span><br>';
                }
                if(item.extraMovementSpeed){
                    description += '<span style="color: #33ee33">+' + item.extraMovementSpeed + ' movement speed.</span><br>';
                }
                var image = document.getElementById('craftImage' + index);
                var itemName = item.name;
                if(self.craftItems.items[index].amount !== 1){
                    itemName += ' (' + self.craftItems.items[index].amount + ')';
                }
                var craftMaterials = '';
                var canCraft = true;
                for(var i in self.craftItems.materials[index]){
                    if(!self.hasItem(self.craftItems.materials[index][i].id,parseInt(self.craftItems.materials[index][i].amount,10))){
                        canCraft = false;
                        craftMaterials += " <span style='color: #ff5555'>" + self.craftItems.materials[index][i].amount + '</span><image class="divImage" src="/client/img/items/' + self.craftItems.materials[index][i].id + '.png"></image>';
                    }
                    else{
                        craftMaterials += " " + self.craftItems.materials[index][i].amount + '<image class="divImage" src="/client/img/items/' + self.craftItems.materials[index][i].id + '.png"></image>';
                    }
                }
                if(canCraft === false){
                    slot.style.backgroundColor = "#ff5555";
                }
                else{
                    slot.style.backgroundColor = "#725640";
                }
                if(item.description){
                    self.craftDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + item.description + '</div><br>Craft for ' + craftMaterials + '.';
                }
                else if(description !== ''){
                    self.craftDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + '</div><br>Craft for ' + craftMaterials + '.';
                }
                else{
                    self.craftDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br>Craft for ' + craftMaterials + '.';
                }
                image.draggable = false;
                slot.onmousedown = function(){
                    socket.emit('craftItem',index);
                }
            }
        }
    }
    self.updateCraftClient = function(index){
        var slot = document.getElementById("craftSlot" + index);
        if(slot){
            if(self.craftItems.items[index].id){
                var item = Item.list[self.craftItems.items[index].id];
                var description = '';
                if(item.equip !== 'consume' && item.equip !== 'hotbar' && item.equip !== undefined){
                    description += 'When Equipped:<br>';
                }
                if(item.damage){
                    if(item.damageType){
                        description += '<span style="color: #33ee33">+' + item.damage + ' ' + item.damageType + ' damage.</span><br>';
                    }
                    if(item.critChance){
                        description += '<span style="color: #33ee33">+' + item.critChance * 100 + '% critical strike chance.</span><br>';
                    }
                }
                if(item.defense){
                    description += '<span style="color: #33ee33">+' + item.defense + ' defense.</span><br>';
                }
                if(item.manaCost){
                    description += 'Uses ' + item.manaCost + ' mana.<br>';
                }
                if(item.extraHp){
                    description += '<span style="color: #33ee33">+' + item.extraHp + ' max health.</span><br>';
                }
                if(item.extraMana){
                    description += '<span style="color: #33ee33">+' + item.extraMana + ' max mana.</span><br>';
                }
                if(item.extraHpRegen){
                    description += '<span style="color: #33ee33">+' + item.extraHpRegen + ' health regeneration.</span><br>';
                }
                if(item.extraManaRegen){
                    description += '<span style="color: #33ee33">+' + item.extraManaRegen + ' mana regeneration.</span><br>';
                }
                if(item.extraDamage){
                    description += '<span style="color: #33ee33">+' + item.extraDamage + ' damage.</span><br>';
                }
                if(item.extraMovementSpeed){
                    description += '<span style="color: #33ee33">+' + item.extraMovementSpeed + ' movement speed.</span><br>';
                }
                var image = document.getElementById('craftImage' + index);
                var itemName = item.name;
                if(self.craftItems.items[index].amount !== 1){
                    itemName += ' (' + self.craftItems.items[index].amount + ')';
                }
                var craftMaterials = '';
                var canCraft = true;
                for(var i in self.craftItems.materials[index]){
                    if(!self.hasItem(self.craftItems.materials[index][i].id,parseInt(self.craftItems.materials[index][i].amount,10))){
                        canCraft = false;
                        craftMaterials += " <span style='color: #ff5555'>" + self.craftItems.materials[index][i].amount + '</span><image class="divImage" src="/client/img/items/' + self.craftItems.materials[index][i].id + '.png"></image>';
                    }
                    else{
                        craftMaterials += " " + self.craftItems.materials[index][i].amount + '<image class="divImage" src="/client/img/items/' + self.craftItems.materials[index][i].id + '.png"></image>';
                    }
                }
                if(canCraft === false){
                    slot.style.backgroundColor = "#ff5555";
                }
                else{
                    slot.style.backgroundColor = "#725640";
                }
                if(item.description){
                    self.craftDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + item.description + '</div><br>Craft for ' + craftMaterials + '.';
                }
                else if(description !== ''){
                    self.craftDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + '</div><br>Craft for ' + craftMaterials + '.';
                }
                else{
                    self.craftDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br>Craft for ' + craftMaterials + '.';
                }
            }
        }
    }
    self.refreshItem = function(index){
        if(self.server){
            if(self.socket !== undefined){
                self.socket.emit('updateItem',{items:self.items,index:index});
            }
            return;
        }
        self.addItemClient(index);
    }
    self.refreshInventory = function(){
        if(self.server){
            if(self.socket !== undefined){
                self.socket.emit('updateInventory',{items:self.items});
            }
            return;
        }
        for(var i in self.items){
            self.addItemClient(i);
        }
        for(var i in self.craftItems.items){
            self.updateCraftClient(i);
        }
    }
    self.refreshMenu = function(){
        if(server === false){
            var inventoryItems = document.getElementById("inventoryItems");
            inventoryItems.innerHTML = "";
            for(var i = 0;i < self.maxSlots;i++){
                if(i % 10 === 0){
                    var row = document.createElement('div');
                    row.className = 'inventoryRow';
                    inventoryItems.appendChild(row);
                }
                var div = document.createElement('div');
                div.id = 'inventorySlot' + i;
                div.className = 'inventorySlot';
                row.appendChild(div);
            }
            var hotbarItems = document.getElementById("hotbarItems");
            hotbarItems.innerHTML = "";
            for(var i = 0;i < 10;i++){
                if(i % 10 === 0){
                    var row = document.createElement('div');
                    row.className = 'hotbarRow';
                    hotbarItems.appendChild(row);
                }
                var div = document.createElement('div');
                div.id = 'hotbarSlot' + i;
                div.className = 'hotbarSlot hotbarSlotNormal';
                row.appendChild(div);
            }
            try{
                var draggingItem = document.getElementById('draggingItem');
                draggingItem.remove();
            }
            catch(err){

            }
            var div = document.createElement('div');
            div.id = 'draggingItem';
            div.draggable = false;
            gameDiv.appendChild(div);
            var addSlot = function(i){
                var div = document.createElement('div');
                div.id = 'inventorySlot' + i;
                div.className = 'inventorySlot';
                inventoryItems.appendChild(div);
            }
            addSlot('helmet');
            addSlot('chestplate');
            addSlot('boots');
            addSlot('ring');
            addSlot('shield');
        }
        else{
            socket.emit('refreshMenu',self.maxSlots);
            for(var i = 0;i < self.maxSlots;i++){
                if(!self.items[i]){
                    self.items[i] = {};
                }
            }
            if(self.items['helmet'] === undefined){
                self.items['helmet'] = {};
            }
            if(self.items['chestplate'] === undefined){
                self.items['chestplate'] = {};
            }
            if(self.items['boots'] === undefined){
                self.items['boots'] = {};
            }
            if(self.items['ring'] === undefined){
                self.items['ring'] = {};
            }
            if(self.items['shield'] === undefined){
                self.items['shield'] = {};
            }
            self.refreshInventory();
        }
    }
    self.refreshCraft = function(){
        if(self.server){
            if(self.socket !== undefined){
                self.socket.emit('refreshCraft',self.craftItems);
            }
            return;
        }
        var craftItems = document.getElementById("craftItems");
        craftItems.innerHTML = "";
        var row = document.createElement('div');
        for(var i = 0;i < self.craftItems.items.length;i++){
            if(i % 10 === 0){
                var row = document.createElement('div');
                row.className = 'inventoryRow';
                craftItems.appendChild(row);
            }
            var div = document.createElement('div');
            div.id = 'craftSlot' + i;
            div.className = 'inventorySlot';
            row.appendChild(div);
        }
        for(var i in self.craftItems.items){
            self.addCraftClient(i);
        }
    }
    self.refreshMenu();
    if(self.server){
        self.craftItems = require('./data/crafts.json');
        self.refreshCraft();
    }
    if(self.server && self.socket){
        self.socket.on("dragItem",function(data){
            try{
                if(data.index2 === 'drop'){
                    var index1 = data.index1;
                    var item1 = self.items[index1];
                    new DroppedItem({
                        id:socket.id,
                        item:item1.id,
                        amount:item1.amount,
                        x:Player.list[socket.id].x,
                        y:Player.list[socket.id].y,
                        map:Player.list[socket.id].map,
                        allPlayers:true,
                    });
                    self.items[index1] = {};
                    if(index1 + '' === self.hotbarSelectedItem + '' || index2 + '' === self.hotbarSelectedItem + ''){
                        self.updateStats = true;
                    }
                    self.refreshItem(index1);
                    self.socket.emit('updateCraft');
                }
                else{
                    var index1 = data.index1;
                    var index2 = data.index2;
                    var item1 = self.items[index1];
                    var item2 = self.items[index2];
                    if(item1.id && item2.id){
                        if(item1.id === item2.id && index1 !== index2){
                            if(item1.amount + item2.amount <= Item.list[item1.id].maxStack){
                                var amount = item1.amount + item2.amount;
                                self.items[index1] = {};
                                self.items[index2] = item1;
                                self.items[index2].amount = amount;
                                self.refreshItem(index1);
                                self.refreshItem(index2);
                                return;
                            }
                            else if(Item.list[item1.id].maxStack !== item1.amount && Item.list[item1.id].maxStack !== item2.amount){
                                var maxStack = Item.list[item1.id].maxStack;
                                var id = item1.id;
                                var amount = item1.amount + item2.amount - Item.list[item1.id].maxStack;
                                self.items[index1] = {};
                                self.items[index2] = item1;
                                self.items[index2].amount = maxStack;
                                self.addItem(id,amount);
                                self.refreshItem(index1);
                                self.refreshItem(index2);
                                return;
                            }
                        }
                    }
                    if(index1 >= 0 && index2 >= 0){
                        self.items[index1] = item2;
                        self.items[index2] = item1;
                    }
                    else if(index1 >= 0){
                        if(!item1.id){
                            self.items[index1] = item2;
                            self.items[index2] = item1;
                            self.updateStats = true;
                        }
                        else if(Item.list[item1.id].equip === index2){
                            self.items[index1] = item2;
                            self.items[index2] = item1;
                            self.updateStats = true;
                        }
                    }
                    else if(index2 >= 0){
                        if(!item2.id){
                            self.items[index1] = item2;
                            self.items[index2] = item1;
                            self.updateStats = true;
                        }
                        else if(Item.list[item2.id].equip === index1){
                            self.items[index1] = item2;
                            self.items[index2] = item1;
                            self.updateStats = true;
                        }
                    }
                    if(index1 + '' === self.hotbarSelectedItem + '' || index2 + '' === self.hotbarSelectedItem + ''){
                        self.updateStats = true;
                    }
                    self.refreshItem(index1);
                    self.refreshItem(index2);
                }
            }
            catch(err){
                console.error(err);
            }
        });
        self.socket.on("hotbarSelectedItem",function(data){
            self.hotbarSelectedItem = data;
            self.updateStats = true;
        });
        self.socket.on("useItem",function(data){
            try{
                Player.list[socket.id].useItem(Item.list[self.items[data].id].event,data);
            }
            catch(err){
                console.error(err);
            }
        });
        self.socket.on("buyItem",function(data){
            try{
                if(self.shopItems.prices[data] > Player.list[socket.id].coins){
                    Player.list[socket.id].sendNotification('[!] You do not have enough money to buy ' + Item.list[self.shopItems.items[data].id].name + ' x' + self.shopItems.items[data].amount + '.');
                    return;
                }
                self.addItem(self.shopItems.items[data].id,self.shopItems.items[data].amount,JSON.parse(JSON.stringify(self.shopItems.items[data].enchantments)));
                Player.list[socket.id].coins -= self.shopItems.prices[data];
                Player.list[socket.id].sendNotification('You successfully bought ' + Item.list[self.shopItems.items[data].id].name + ' x' + self.shopItems.items[data].amount + '.');
            }
            catch(err){
                console.error(err);
            }
        });
        self.socket.on("craftItem",function(data){
            try{
                for(var i in self.craftItems.materials[data]){
                    if(!self.hasItem(self.craftItems.materials[data][i].id,self.craftItems.materials[data][i].amount)){
                        // Player.list[socket.id].sendNotification('[!] You do not have the required materials to craft ' + Item.list[self.craftItems.items[data].id].name + ' x' + self.craftItems.items[data].amount + '.');
                        return;
                    }
                }
                self.addItem(self.craftItems.items[data].id,self.craftItems.items[data].amount,self.craftItems.items[data].enchantments);
                for(var i in self.craftItems.materials[data]){
                    self.removeItem(self.craftItems.materials[data][i].id,self.craftItems.materials[data][i].amount);
                }
                // Player.list[socket.id].sendNotification('You successfully crafted ' + Item.list[self.craftItems.items[data].id].name + ' x' + self.craftItems.items[data].amount + '.');
            }
            catch(err){
                console.error(err);
            }
        });
    }
    return self;
}

Item = function(id,param){
	var self = {
		id:id,
    }
    for(var i in param){
        self[i] = param[i];
    }
	Item.list[self.id] = self;
	return self;
}
Item.list = {};

try{
    var items = require('./data/item.json');
    for(var i in items){
        Item(i,items[i]);
    }
}
catch(err){
    var request = new XMLHttpRequest();
    request.open('GET',"/client/data/item.json",true);

    request.onload = function(){
        if(this.status >= 200 && this.status < 400){
            var items = JSON.parse(this.response);
            for(var i in items){
                Item(i,items[i]);
            }
        }
        else{
            
        }
    };
    request.onerror = function(){
        
    };
    request.send();
}

try{
    
}
catch(err){
}