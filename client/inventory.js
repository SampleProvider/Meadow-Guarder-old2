
Inventory = function(socket,server){
    var self = {
        server:server,
        items:{},
        itemDescriptions:{},
        craftItems:{},
        craftDescriptions:{},
        draggingItem:{},
        draggingX:-1,
        draggingY:-1,
        maxSlots:20,
        hotbarSelectedItem:-1,
        updateStats:true,
    }
    self.getRarityColor = function(rarity){
        if(Math.floor(rarity) === 0){
            return '#666666';
        }
        if(Math.floor(rarity) === 1){
            return '#4082bf';
        }
        if(Math.floor(rarity) === 2){
            return '#99c247';
        }
        if(Math.floor(rarity) === 3){
            return '#e08e28';
        }
        if(Math.floor(rarity) === 4){
            return '#c24747';
        }
        if(Math.floor(rarity) === 5){
            return '#823295';
        }
        if(Math.floor(rarity) === 6){
            return '#ff0000';
        }
    }
    self.getTypeColor = function(type){
        if(type === 'Weapon'){
            return '#dd3333';
        }
        if(type === 'Helmet'){
            return '#dddd00';
        }
        if(type === 'Chestplate'){
            return '#dddd00';
        }
        if(type === 'Boots'){
            return '#dddd00';
        }
        if(type === 'Gloves'){
            return '#dddd00';
        }
        if(type === 'Shield'){
            return '#666666';
        }
        if(type === 'Bundle'){
            return '#77dd33';
        }
        if(type === 'Ring'){
            return '#dd00dd';
        }
        if(type === 'Necklace'){
            return '#dd00dd';
        }
        if(type === 'Amulet'){
            return '#dd00dd';
        }
        if(type === 'Material'){
            return '#33dddd';
        }
        if(type === 'Tool'){
            return '#33dd33';
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
            socket.emit('updateCraft');
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
            socket.emit('updateCraft');
            return index;
        }
        return false;
    }
    self.removeItem = function(item,amount){
        var itemsToRemove = [];
        for(var i in self.items){
            if(self.items[i].id === item){
                itemsToRemove.push(i);
            }
        }
        if(self.draggingItem.id === item){
            itemsToRemove.push(-1);
        }
        var amountFound = 0;
        for(var i in itemsToRemove){
            if(itemsToRemove[i] === -1){
                amountFound += self.draggingItem.amount;
            }
            else{
                amountFound += self.items[itemsToRemove[i]].amount;
            }
        }
        if(amountFound >= amount){
            amountFound = 0;
            for(var i in itemsToRemove){
                if(itemsToRemove[i] === -1){
                    if(amountFound + self.draggingItem.amount >= amount){
                        self.draggingItem.amount = self.draggingItem.amount - (amount - amountFound);
                        if(self.draggingItem.amount === 0){
                            self.draggingItem = {};
                            if(itemsToRemove[i] + '' === self.hotbarSelectedItem + ''){
                                self.updateStats = true;
                            }
                        }
                        self.refreshItem(itemsToRemove[i]);
                        socket.emit('updateCraft');
                        return true;
                    }
                    amountFound += self.draggingItem.amount;
                    self.draggingItem = {};
                    if(itemsToRemove[i] + '' === self.hotbarSelectedItem + ''){
                        self.updateStats = true;
                    }
                    self.refreshItem(itemsToRemove[i]);
                }
                else{
                    if(amountFound + self.items[itemsToRemove[i]].amount >= amount){
                        self.items[itemsToRemove[i]].amount = self.items[itemsToRemove[i]].amount - (amount - amountFound);
                        if(self.items[itemsToRemove[i]].amount === 0){
                            self.items[itemsToRemove[i]] = {};
                            if(itemsToRemove[i] + '' === self.hotbarSelectedItem + ''){
                                self.updateStats = true;
                            }
                        }
                        self.refreshItem(itemsToRemove[i]);
                        socket.emit('updateCraft');
                        return true;
                    }
                    amountFound += self.items[itemsToRemove[i]].amount;
                    self.items[itemsToRemove[i]] = {};
                    if(itemsToRemove[i] + '' === self.hotbarSelectedItem + ''){
                        self.updateStats = true;
                    }
                    self.refreshItem(itemsToRemove[i]);
                }
            }
        }
        else{
            return false;
        }
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
        if(self.draggingItem.id === item){
            amountFound += self.draggingItem.amount;
            if(amountFound >= amount){
                return true;
            }
        }
        return false;
    }
    self.isItem = function(index){
        if(self.items[index]){
            if(self.items[index].id){
                return true;
            }
        }
        return false;
    }
    self.isCraft = function(index){
        if(self.craftItems.items[index]){
            if(self.craftItems.items[index].id){
                return true;
            }
        }
        return false;
    }
    self.drawItem = function(slot,drawId,large){
        var slotCanvas = document.createElement("canvas");
        if(large){
            slotCanvas.className += 'slotCanvasLarge';
        }
        else{
            slotCanvas.className += 'slotCanvas';
        }
        var slotCanvasCtx = slotCanvas.getContext("2d");
        slotCanvasCtx.canvas.width = 48;
        slotCanvasCtx.canvas.height = 48;
        resetCanvas(slotCanvasCtx);
        var img_x = ((drawId - 1) % 26) * 24;
        var img_y = ~~((drawId - 1) / 26) * 24;
        slotCanvasCtx.drawImage(Img.items2,img_x,img_y,24,24,0,0,48,48);
        slot.appendChild(slotCanvas);
    }
    self.runDraggingItem = function(data){
        var index1 = data.index1;
        var index2 = data.index2;
        var item1 = self.items[index1];
        var item2 = self.items[index2];
        if(self.isItem(index1)){
            if(self.isItem(index2)){
                return;
            }
            else{
                if(!self.draggingItem.id){
                    if(data.click === 0){
                        self.draggingItem = {
                            id:item1.id,
                            amount:item1.amount,
                        };
                        self.items[index1] = {};
                        self.refreshItem(index1);
                    }
                    else if(data.click === 2){
                        self.draggingItem = {
                            id:item1.id,
                            amount:1,
                        };
                        self.items[index1].amount -= 1;
                        if(self.items[index1].amount === 0){
                            self.items[index1] = {};
                        }
                        self.refreshItem(index1);
                    }
                    return;
                }
                else{
                    return;
                }
            }
        }
        else{
            if(!self.draggingItem.id){
                return;
            }
            if(self.isItem(index2)){
                if(self.draggingItem.id === item2.id){
                    if(data.click === 0){
                        if(Item.list[item2.id].maxStack >= item2.amount + self.draggingItem.amount){
                            self.items[index2].amount += self.draggingItem.amount;
                            self.draggingItem = {};
                            self.refreshItem(index2);
                            return;
                        }
                        else{
                            self.items[index2].amount = Item.list[item2.id].maxStack;
                            self.draggingItem.amount -= Item.list[item2.id].maxStack - item2.amount;
                            self.refreshItem(index2);
                            return;
                        }
                    }
                    else if(data.click === 2){
                        if(Item.list[item2.id].maxStack >= item2.amount + 1){
                            self.items[index2].amount -= 1;
                            self.draggingItem.amount += 1;
                            self.refreshItem(index2);
                            return;
                        }
                        else{
                            var item = {
                                id:self.draggingItem.id,
                                amount:self.draggingItem.amount,
                            };
                            self.draggingItem = item2;
                            self.items[index2] = item;
                            self.refreshItem(index2);
                            return;
                        }
                    }
                }
                else{
                    if(index2 >= 0){
                        var item = {
                            id:self.draggingItem.id,
                            amount:self.draggingItem.amount,
                        };
                        self.draggingItem = item2;
                        self.items[index2] = item;
                        self.refreshItem(index2);
                    }
                    else{
                        if(Item.list[self.draggingItem.id].equip === index2 || (Item.list[self.draggingItem.id].equip === "accessory" && (index2 === "accessory1" || index2 === "accessory2" || index2 === "accessory3"))){
                            var item = {
                                id:self.draggingItem.id,
                                amount:self.draggingItem.amount,
                            };
                            self.draggingItem = item2;
                            self.items[index2] = item;
                            self.refreshItem(index2);
                        }
                    }
                    return;
                }
            }
            else if(index2 === 'drop'){
                if(self.draggingItem.id){
                    if(data.click === 0){
                        if(server){
                            new DroppedItem({
                                id:socket.id,
                                item:self.draggingItem.id,
                                amount:self.draggingItem.amount,
                                x:Player.list[socket.id].x,
                                y:Player.list[socket.id].y,
                                map:Player.list[socket.id].map,
                                allPlayers:true,
                            });
                        }
                        self.draggingItem = {};
                        socket.emit('updateCraft');
                    }
                    else if(data.click === 2){
                        if(server){
                            new DroppedItem({
                                id:socket.id,
                                item:self.draggingItem.id,
                                amount:1,
                                x:Player.list[socket.id].x,
                                y:Player.list[socket.id].y,
                                map:Player.list[socket.id].map,
                                allPlayers:true,
                            });
                        }
                        self.draggingItem.amount -= 1;
                        if(self.draggingItem.amount === 0){
                            self.draggingItem = {};
                        }
                        socket.emit('updateCraft');
                    }
                    return;
                }
            }
            else if(index2 === 'trash'){
                self.draggingItem = {};
                return;
            }
            else{
                if(index2 >= 0){
                    if(data.click === 0){
                        self.items[index2] = {
                            id:self.draggingItem.id,
                            amount:self.draggingItem.amount,
                        };
                        self.draggingItem = {};
                        self.refreshItem(index2);
                    }
                    else if(data.click === 2){
                        self.items[index2] = {
                            id:self.draggingItem.id,
                            amount:1,
                        };
                        self.draggingItem.amount -= 1;
                        if(self.draggingItem.amount === 0){
                            self.draggingItem = {};
                        }
                        self.refreshItem(index2);
                    }
                    return;
                }
                else{
                    if(Item.list[self.draggingItem.id].equip === index2 || (Item.list[self.draggingItem.id].equip === "accessory" && (index2 === "accessory1" || index2 === "accessory2" || index2 === "accessory3"))){
                        if(data.click === 0){
                            self.items[index2] = self.draggingItem;
                            self.draggingItem = {};
                            self.refreshItem(index2);
                        }
                        else if(data.click === 2){
                            self.items[index2] = {
                                id:self.draggingItem.id,
                                amount:1,
                            };
                            self.draggingItem.amount -= 1;
                            if(self.draggingItem.amount === 0){
                                self.draggingItem = {};
                            }
                            self.refreshItem(index2);
                        }
                        return;
                    }
                }
                return;
            }
        }
    }
    self.runDraggingItemClient = function(index,click){
        if(self.draggingItem.id){
            socket.emit('dragItem',{
                index1:-1,
                index2:index,
                click:click,
            });
            self.runDraggingItem({
                index1:-1,
                index2:index,
                click:click,
            });
            itemMenu.style.display = 'none';
            if(self.draggingItem.id){
                draggingItem.style.display = 'inline-block';
                draggingItem.innerHTML = '';
                self.drawItem(draggingItem,Item.list[self.draggingItem.id].drawId,true);
                draggingItem.style.left = (rawMouseX - 32) + 'px';
                draggingItem.style.top = (rawMouseY - 32) + 'px';
                if(self.draggingItem.amount !== 1){
                    var itemAmount = document.createElement('div');
                    itemAmount.innerHTML = self.draggingItem.amount;
                    itemAmount.className = 'UI-text-light itemAmount';
                    var itemAmountDiv = document.createElement('div');
                    itemAmountDiv.className = 'itemAmountLargeDiv';
                    itemAmountDiv.appendChild(itemAmount);
                    draggingItem.appendChild(itemAmountDiv);
                }
            }
            else{
                draggingItem.style.display = 'none';
            }
        }
        else{
            socket.emit('dragItem',{
                index1:index,
                index2:-1,
                click:click,
            });
            self.runDraggingItem({
                index1:index,
                index2:-1,
                click:click,
            });
            itemMenu.style.display = 'none';
            if(self.draggingItem.id){
                draggingItem.style.display = 'inline-block';
                draggingItem.innerHTML = '';
                self.drawItem(draggingItem,Item.list[self.draggingItem.id].drawId,true);
                draggingItem.style.left = (rawMouseX - 32) + 'px';
                draggingItem.style.top = (rawMouseY - 32) + 'px';
                if(self.draggingItem.amount !== 1){
                    var itemAmount = document.createElement('div');
                    itemAmount.innerHTML = self.draggingItem.amount;
                    itemAmount.className = 'UI-text-light itemAmount';
                    var itemAmountDiv = document.createElement('div');
                    itemAmountDiv.className = 'itemAmountLargeDiv';
                    itemAmountDiv.appendChild(itemAmount);
                    draggingItem.appendChild(itemAmountDiv);
                }
            }
            else{
                draggingItem.style.display = 'none';
            }
        }
    }
    self.getDescription = function(item){
        var description = '';
        if(item.type){
            description += '<span style="color: ' + self.getTypeColor(item.type) + '">' + item.type + '</span><br>';
        }
        if(item.equip !== 'consume' && item.equip !== 'hotbar' && item.equip !== 'none' && item.equip !== undefined){
            description += 'When Equipped:<br>';
        }
        if(item.defense){
            if(item.defense > 0){
                description += '<span style="color: #33ee33">+' + item.defense + ' defense.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.defense + ' defense.</span><br>';
            }
        }
        if(item.manaCost){
            description += 'Uses ' + item.manaCost + ' mana.<br>';
        }
        if(item.hp){
            if(item.hp > 0){
                description += '<span style="color: #33ee33">+' + item.hp + ' max health.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.hp + ' max health.</span><br>';
            }
        }
        if(item.hpRegen){
            if(item.hpRegen > 0){
                description += '<span style="color: #33ee33">+' + item.hpRegen + ' health regeneration.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.hpRegen + ' health regeneration.</span><br>';
            }
        }
        if(item.mana){
            if(item.mana > 0){
                description += '<span style="color: #33ee33">+' + item.mana + ' max mana.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.mana + ' max mana.</span><br>';
            }
        }
        if(item.manaRegen){
            if(item.manaRegen > 0){
                description += '<span style="color: #33ee33">+' + item.manaRegen + ' mana regeneration.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.manaRegen + ' mana regeneration.</span><br>';
            }
        }
        if(item.damage){
            if(item.damage > 0){
                description += '<span style="color: #33ee33">+' + item.damage + ' damage.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.damage + ' damage.</span><br>';
            }
        }
        if(item.meleeDamage){
            if(item.meleeDamage > 0){
                description += '<span style="color: #33ee33">+' + item.meleeDamage + ' melee damage.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.meleeDamage + ' melee damage.</span><br>';
            }
        }
        if(item.rangedDamage){
            if(item.rangedDamage > 0){
                description += '<span style="color: #33ee33">+' + item.rangedDamage + ' ranged damage.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.rangedDamage + ' ranged damage.</span><br>';
            }
        }
        if(item.magicDamage){
            if(item.magicDamage > 0){
                description += '<span style="color: #33ee33">+' + item.magicDamage + ' magic damage.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.magicDamage + ' magic damage.</span><br>';
            }
        }
        if(item.critChance){
            if(item.critChance > 0){
                description += '<span style="color: #33ee33">+' + item.critChance * 100 + '% critical strike chance.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.critChance * 100 + '% critical strike chance.</span><br>';
            }
        }
        if(item.critPower){
            if(item.critPower > 0){
                description += '<span style="color: #33ee33">+' + item.critPower * 100 + '% critical strike power.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.critPower * 100 + '% critical strike power.</span><br>';
            }
        }
        if(item.movementSpeed){
            if(item.movementSpeed > 0){
                description += '<span style="color: #33ee33">+' + item.movementSpeed + ' movement speed.</span><br>';
            }
            else{
                description += '<span style="color: #33ee33">' + item.movementSpeed + ' movement speed.</span><br>';
            }
        }
        if(item.equip === 'consume'){
            description += 'Right click to use.<br>';
        }
        if(item.description){
            description += item.description;
        }
        return description;
    }
    self.addItemClient = function(index){
        var slot = document.getElementById("inventorySlot" + index);
        if(slot){
            slot.innerHTML = "";
            slot.style.border = "1px solid #000000";
            slot.className += ' inventoryMenuSlot';
            slot.onmouseover = function(){};
            slot.onmouseout = function(){};
            self.itemDescriptions[index] = '';
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
                    self.hotbarSelectedItem = parseInt(index);
                    socket.emit('hotbarSelectedItem',self.hotbarSelectedItem);
                }
                hotbarSlot.onmouseover = function(){};
                hotbarSlot.onmouseout = function(){};
            }
            if(self.isItem(index)){
                var item = Item.list[self.items[index].id];
                self.drawItem(slot,item.drawId,false);
                var itemName = item.name;
                if(self.items[index].amount !== 1){
                    itemName += ' (' + self.items[index].amount + ')';
                    var itemAmount = document.createElement('div');
                    itemAmount.innerHTML = self.items[index].amount;
                    itemAmount.className = 'itemAmount';
                    var itemAmountDiv = document.createElement('div');
                    itemAmountDiv.className = 'itemAmountDiv';
                    itemAmountDiv.appendChild(itemAmount);
                    slot.appendChild(itemAmountDiv);
                }
                self.itemDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + self.getDescription(item) + '</div>';
                if(index >= 0 && index <= 9){
                    self.drawItem(hotbarSlot,item.drawId,false);
                    if(self.items[index].amount !== 1){
                        var itemAmount = document.createElement('div');
                        itemAmount.innerHTML = self.items[index].amount;
                        itemAmount.className = 'itemAmount';
                        var itemAmountDiv = document.createElement('div');
                        itemAmountDiv.className = 'itemAmountDiv';
                        itemAmountDiv.appendChild(itemAmount);
                        hotbarSlot.appendChild(itemAmountDiv);
                    }
                    hotbarSlot.onmouseover = function(){
                        updateInventoryPopupMenu('itemDescriptions',index);
                    }
                    hotbarSlot.onmouseout = function(){
                        updateInventoryPopupMenu('itemDescriptions',-1);
                    }
                }
                slot.onmouseover = function(){
                    updateInventoryPopupMenu('itemDescriptions',index);
                }
                slot.onmouseout = function(){
                    updateInventoryPopupMenu('itemDescriptions',-1);
                }
            }
            else{
                if(index >= 0){
                }
                else{
                    slot.innerHTML = '<image class="itemImage" src="/client/img/' + index + 'outline.png"</image>'
                }
            }
            slot.onclick = function(){
                self.runDraggingItemClient(index,0);
            }
            slot.oncontextmenu = function(){
                self.runDraggingItemClient(index,2);
            }
        }
    }
    self.addCraftClient = function(index){
        var slot = document.getElementById("craftSlot" + index);
        if(slot){
            slot.innerHTML = "";
            slot.style.border = "1px solid #000000";
            slot.onclick = function(){};
            slot.onmouseover = function(){};
            slot.onmouseout = function(){};
            slot.className += ' craftMenuSlot';
            if(self.isCraft(index)){
                var item = Item.list[self.craftItems.items[index].id];
                self.drawItem(slot,item.drawId,false);
                var itemName = item.name;
                if(self.craftItems.items[index].amount !== 1){
                    itemName += ' (' + self.craftItems.items[index].amount + ')';
                }
                var craftMaterials = '';
                var canCraft = true;
                for(var i in self.craftItems.materials[index]){
                    if(!self.hasItem(self.craftItems.materials[index][i].id,parseInt(self.craftItems.materials[index][i].amount,10))){
                        canCraft = false;
                        craftMaterials += "<br><span style='color: #ff5555'>" + self.craftItems.materials[index][i].amount + ' ' + Item.list[self.craftItems.materials[index][i].id].name + '</span>';
                    }
                    else{
                        craftMaterials += "<br>" + self.craftItems.materials[index][i].amount + ' ' + Item.list[self.craftItems.materials[index][i].id].name;
                    }
                }
                if(canCraft === false){
                    slot.style.backgroundColor = "#ff5555";
                }
                else{
                    slot.style.backgroundColor = "#725640";
                }
                var description = self.getDescription(item);
                if(description !== ''){
                    self.craftDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + '</div><br>Craft for:' + craftMaterials + '.';
                }
                else{
                    self.craftDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br>Craft for ' + craftMaterials + '.';
                }
                slot.onmouseover = function(){
                    updateInventoryPopupMenu('craftDescriptions',index);
                }
                slot.onmouseout = function(){
                    updateInventoryPopupMenu('craftDescriptions',-1);
                }
                slot.onclick = function(){
                    socket.emit('craftItem',index);
                    var canCraft = true;
                    for(var i in self.craftItems.materials[index]){
                        if(!self.hasItem(self.craftItems.materials[index][i].id,parseInt(self.craftItems.materials[index][i].amount,10))){
                            canCraft = false;
                        }
                    }
                    if(canCraft){
                        if(self.draggingItem.id){
                            if(self.draggingItem.id === self.craftItems.items[index].id){
                                if(self.draggingItem.amount + self.craftItems.items[index].amount <= Item.list[self.draggingItem.id].maxStack){
                                    self.draggingItem.amount += self.craftItems.items[index].amount;
                                }
                            }
                        }
                        else{
                            self.draggingItem = {
                                id:self.craftItems.items[index].id,
                                amount:self.craftItems.items[index].amount,
                            }
                        }
                        itemMenu.style.display = 'none';
                        if(self.draggingItem.id){
                            draggingItem.style.display = 'inline-block';
                            draggingItem.innerHTML = '';
                            self.drawItem(draggingItem,Item.list[self.draggingItem.id].drawId,true);
                            draggingItem.style.left = (rawMouseX - 32) + 'px';
                            draggingItem.style.top = (rawMouseY - 32) + 'px';
                            if(self.draggingItem.amount !== 1){
                                var itemAmount = document.createElement('div');
                                itemAmount.innerHTML = self.draggingItem.amount;
                                itemAmount.className = 'UI-text-light itemAmount';
                                var itemAmountDiv = document.createElement('div');
                                itemAmountDiv.className = 'itemAmountLargeDiv';
                                itemAmountDiv.appendChild(itemAmount);
                                draggingItem.appendChild(itemAmountDiv);
                            }
                        }
                        else{
                            draggingItem.style.display = 'none';
                        }
                    }
                }
            }
        }
    }
    self.updateCraftClient = function(index){
        var slot = document.getElementById("craftSlot" + index);
        if(slot){
            if(self.craftItems.items[index].id){
                var item = Item.list[self.craftItems.items[index].id];
                var itemName = item.name;
                if(self.craftItems.items[index].amount !== 1){
                    itemName += ' (' + self.craftItems.items[index].amount + ')';
                }
                var craftMaterials = '';
                var canCraft = true;
                for(var i in self.craftItems.materials[index]){
                    if(!self.hasItem(self.craftItems.materials[index][i].id,parseInt(self.craftItems.materials[index][i].amount,10))){
                        canCraft = false;
                        craftMaterials += "<br><span style='color: #ff5555'>" + self.craftItems.materials[index][i].amount + ' ' + Item.list[self.craftItems.materials[index][i].id].name + '</span>';
                    }
                    else{
                        craftMaterials += "<br>" + self.craftItems.materials[index][i].amount + ' ' + Item.list[self.craftItems.materials[index][i].id].name;
                    }
                }
                if(canCraft === false){
                    slot.style.backgroundColor = "#ff5555";
                }
                else{
                    slot.style.backgroundColor = "#725640";
                }
                var description = self.getDescription(item);
                if(description !== ''){
                    self.craftDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + '</div><br>Craft for:' + craftMaterials + '.';
                }
                else{
                    self.craftDescriptions[index] = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br>Craft for ' + craftMaterials + '.';
                }
            }
        }
    }
    self.refreshItem = function(index){
        if(self.server){
            if(index === self.hotbarSelectedItem || !index >= 0){
                self.updateStats = true;
            }
            socket.emit('updateItem',{items:self.items,index:index});
            return;
        }
        self.addItemClient(index);
    }
    self.refreshInventory = function(){
        if(self.server){
            self.updateStats = true;
            socket.emit('updateInventory',{items:self.items});
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
            addSlot('gloves');
            addSlot('shield');
            addSlot('bundle');
            addSlot('accessory1');
            addSlot('accessory2');
            addSlot('accessory3');
            addSlot('trash');
            inventorySlottrash.innerHTML = "<image class='itemImage' src='/client/websiteAssets/trash.png'></image>";
            inventorySlottrash.onclick = function(){
                self.runDraggingItemClient('trash',0);
            }
            inventorySlottrash.oncontextmenu = function(){
                self.runDraggingItemClient('trash',2);
            }
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
            if(self.items['gloves'] === undefined){
                self.items['gloves'] = {};
            }
            if(self.items['shield'] === undefined){
                self.items['shield'] = {};
            }
            if(self.items['bundle'] === undefined){
                self.items['bundle'] = {};
            }
            if(self.items['accessory1'] === undefined){
                self.items['accessory1'] = {};
            }
            if(self.items['accessory2'] === undefined){
                self.items['accessory2'] = {};
            }
            if(self.items['accessory3'] === undefined){
                self.items['accessory3'] = {};
            }
            delete self.items["ring"];
            self.refreshInventory();
        }
    }
    self.refreshCraft = function(){
        if(self.server){
            socket.emit('refreshCraft',self.craftItems);
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
        socket.on("dragItem",function(data){
            try{
                self.runDraggingItem(data);
            }
            catch(err){
                console.error(err);
            }
        });
        socket.on("hotbarSelectedItem",function(data){
            self.hotbarSelectedItem = data;
            self.updateStats = true;
        });
        socket.on("useItem",function(data){
            try{
                Player.list[socket.id].useItem(Item.list[self.items[data].id].event,data);
            }
            catch(err){
                console.error(err);
            }
        });
        socket.on("buyItem",function(data){
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
        socket.on("craftItem",function(data){
            try{
                for(var i in self.craftItems.materials[data]){
                    if(!self.hasItem(self.craftItems.materials[data][i].id,self.craftItems.materials[data][i].amount)){
                        // Player.list[socket.id].sendNotification('[!] You do not have the required materials to craft ' + Item.list[self.craftItems.items[data].id].name + ' x' + self.craftItems.items[data].amount + '.');
                        return;
                    }
                }
                if(self.draggingItem.id){
                    if(self.draggingItem.id === self.craftItems.items[data].id){
                        if(self.draggingItem.amount + self.craftItems.items[data].amount <= Item.list[self.draggingItem.id].maxStack){
                            self.draggingItem.amount += self.craftItems.items[data].amount;
                        }
                    }
                }
                else{
                    self.draggingItem = {
                        id:self.craftItems.items[data].id,
                        amount:self.craftItems.items[data].amount,
                    }
                }
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

Item = function(param){
	var self = {};
    for(var i in param){
        var parsedInput = param[i];
        parsedInput = parsedInput === '\r' ? '' : parsedInput;
        parsedInput = isNaN(parsedInput) === false && parsedInput !== '' ? parseFloat(parsedInput) : parsedInput;
        parsedInput = parsedInput === 'true' ? true : parsedInput;
        parsedInput = parsedInput === 'false' ? false : parsedInput;
        self[i] = parsedInput;
    }
	Item.list[self.id] = self;
	return self;
}
Item.list = {};

try{
    var csv = require('csv-parser');
    var fs = require('fs');
    var items = [];
    fs.createReadStream('./client/data/items.csv').pipe(csv()).on('data', (data) => items.push(data)).on('end', () => {
        for(var i in items){
            Item(items[i]);
        }
    });
}
catch(err){
    var getCSV = function(name,cb){
        var request = new XMLHttpRequest();
        request.open('GET',"/client/data/" + name + ".csv",true);
        request.onload = function(){
            if(this.status >= 200 && this.status < 400){
                parseCSV(this.response,cb);
            }
            else{
        
            }
        };
        request.onerror = function(){
            
        };
        request.send();
    }
    var parseCSV = function(string,cb){
        var array = [];
        var labels = [''];
        var inQuote = false;
        var row = -1;
        var col = 0; 
        for(var index = 0;index < string.length;index += 1){
            var currentCharacter = string[index];
            
            if(currentCharacter === '"'){
                inQuote = !inQuote;
                continue;
            }

            if(currentCharacter === ',' && inQuote === false){
                col += 1;
                if(row === -1){
                    labels.push('');
                }
                else{
                    array[row][labels[col]] = '';
                }
                continue;
            }

            if(currentCharacter === '\n'){
                row += 1;
                col = 0;
                array.push({});
                array[row][labels[col]] = '';
                continue;
            }

            if(row === -1){
                if(currentCharacter !== '\r'){
                    labels[col] += currentCharacter;
                }
            }
            else{
                array[row][labels[col]] += currentCharacter;
            }
        }
        cb(array);
    }
    getCSV('items',function(array){
        for(var i in array){
            new Item(array[i]);
        }
    });
}
