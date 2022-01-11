var Entity = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.spdX = 0;
    self.spdY = 0;
    self.direction = initPack.direction;
    self.width = initPack.width;
    self.height = initPack.height;
    self.type = initPack.type;
    self.map = initPack.map;
    self.interpolationStage = 3;
    self.fade = 0;
    self.fadeState = 0;
    if(!initPack.new){
        self.fade = 1;
        self.fadeState = 1;
    }
    if(initPack.toRemove){
        self.fade = 0;
        self.fadeState = 2;
    }
    self.toRemove = false;
    self.updated = true;
    self.update = function(){
        if(self.interpolationStage > 0){
            if(self.spdX >= 0.25 && self.spdX <= 0.5){
                self.x += 0.6;
                self.spdX = 0;
            }
            else if(self.spdX <= -0.25 && self.spdX >= -0.5){
                self.x -= 0.6;
                self.spdX = 0;
            }
            else{
                self.x += self.spdX;
            }
            if(self.spdY >= 0.25 && self.spdY <= 0.5){
                self.y += 0.6;
                self.spdY = 0;
            }
            else if(self.spdY <= -0.25 && self.spdY >= -0.5){
                self.y -= 0.6;
                self.spdY = 0;
            }
            else{
                self.y += self.spdY;
            }
            self.x = Math.round(self.x);
            self.y = Math.round(self.y);
        }
        self.interpolationStage -= 1;
    }
	self.getSquareDistance = function(pt){
		return Math.max(Math.abs(Math.floor(self.x - pt.x)),Math.abs(Math.floor(self.y - pt.y))) / 64;
    }
    self.isColliding = function(pt){
        if(pt.x + pt.width / 2 <= self.x - self.width / 2){
            return false;
        }
        if(pt.x - pt.width / 2 >= self.x + self.width / 2){
            return false;
        }
        if(pt.y + pt.height / 2 <= self.y - self.height / 2){
            return false;
        }
        if(pt.y - pt.height / 2 >= self.y + self.height / 2){
            return false;
        }
        return true;
    }
    return self;
}

var Actor = function(initPack){
    var self = Entity(initPack);
    self.img = initPack.img;
    self.name = initPack.name;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.drawSize = initPack.drawSize;
    self.animation = initPack.animation;
    self.animationDirection = initPack.animationDirection;
    self.canAttack = initPack.canAttack;
    self.stats = initPack.stats;
    self.team = initPack.team;
    self.showHealthBar = initPack.showHealthBar;
    self.debuffs = initPack.debuffs;

    self.render = renderPlayer(self.img,self.drawSize);

    self.drawName = function(){
        ctx.font = "15px pixel";
        ctx.fillStyle = '#00ff90';
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        if(self.drawSize === 'small'){
            var yDistance = 8;
        }
        else if(self.drawSize === 'medium'){
            var yDistance = 16;
        }
        else{
            var yDistance = 16;
        }
        if(self.showHealthBar === false){
            ctx.fillText(self.name,Math.round(self.x),Math.round(self.y - yDistance * 4 - 4));
        }
        else{
            ctx.fillText(self.name,Math.round(self.x),Math.round(self.y - yDistance * 4 - 32));
        }
    }
    self.drawHp = function(){
        if(self.x - self.width * 2 > -cameraX + WIDTH || self.x + self.width * 2 < -cameraX || self.y - self.height > -cameraY + HEIGHT || self.y + self.height * 2 < -cameraY){
            return;
        }
        for(var i in self.debuffs){
            for(var j in debuffData[i].particles){
                console.log(j)
                Particle.create(self.x + Math.random() * self.width - self.width / 2,self.y + Math.random() * self.height - self.height / 2,self.map,j,debuffData[i].particles[j],1);
            }
        }
        if(self.fadeState !== 1){
            if(self.fade <= 0){
                return;
            }
            ctx.globalAlpha = self.fade;
        }
        if(self.name !== ''){
            self.drawName();
        }
        if(self.showHealthBar === false){
            return;
        }
        if(self.drawSize === 'small'){
            var yDistance = 8;
        }
        else if(self.drawSize === 'medium'){
            var yDistance = 16;
        }
        else{
            var yDistance = 16;
        }
        if(self.team === Player.list[selfId].team){
            ctx.drawImage(Img.healthbar,0,4,16,4,Math.round(self.x - 32),Math.round(self.y - yDistance * 4 - 20),64,16);
            ctx.drawImage(Img.healthbar,1,1,Math.round(14 * self.hp / self.hpMax),2,Math.round(self.x - 28),Math.round(self.y - yDistance * 4 - 16),Math.round(14 * self.hp / self.hpMax) * 4,8);
        }
        else{
            ctx.drawImage(Img.healthbar,0,20,16,4,Math.round(self.x - 32),Math.round(self.y - yDistance * 4 - 20),64,16);
            ctx.drawImage(Img.healthbar,1,17,Math.round(14 * self.hp / self.hpMax),2,Math.round(self.x - 28),Math.round(self.y - yDistance * 4 - 16),Math.round(14 * self.hp / self.hpMax) * 4,8);
        }
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    return self;
}

var Player = function(initPack){
    var self = Actor(initPack);
    self.level = initPack.level;
    self.currentItem = initPack.currentItem;
    self.worldRegion = initPack.worldRegion;
    if(self.id === selfId){
        if(self.worldRegion !== worldRegion){
            worldRegion = self.worldRegion;
            playRegionSong(worldRegion);
        }
    }
    self.draw = function(){
        if(self.x - self.width * 2 > -cameraX + WIDTH || self.x + self.width * 2 < -cameraX || self.y - self.height > -cameraY + HEIGHT || self.y + self.height * 2 < -cameraY){
            return;
        }
        if(self.fadeState === 0){
            if(settings.entityFadeOut === false){
                self.fadeState = 1;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade += 0.1;
                if(self.fade >= 1){
                    self.fade = 1;
                    self.fadeState = 1;
                }
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            if(settings.entityFadeOut === false){
                delete Player.list[self.id];
                return;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade -= 0.05;
                if(self.fade <= 0){
                    ctx.globalAlpha = 1;
                    delete Player.list[self.id];
                    return;
                }
            }
        }
        if(Item.list[self.currentItem]){
            if(Item.list[self.currentItem].equip === 'shield'){
                if(self.direction >= 195 && self.direction <= 345){
                    ctx.save();
                    ctx.translate(self.x,self.y);
                    ctx.rotate((self.direction - 90) / 180 * Math.PI);
                    var drawId = Item.list[self.currentItem].drawId;
                    var imgX = ((drawId - 1) % 26) * 24;
                    var imgY = ~~((drawId - 1) / 26) * 24;
                    ctx.drawImage(Img.items2,imgX,imgY,24,24,-48,-12,96,96);
                    ctx.restore();
                }
            }
            else if(Item.list[self.currentItem].displayItem === true){
                ctx.save();
                ctx.translate(self.x,self.y);
                ctx.rotate((self.direction - 225) / 180 * Math.PI);
                var drawId = Item.list[self.currentItem].drawId;
                var imgX = ((drawId - 1) % 26) * 24;
                var imgY = ~~((drawId - 1) / 26) * 24;
                ctx.drawImage(Img.items2,imgX,imgY,24,24,-96,-96,96,96);
                ctx.restore();
            }
        }
        self.animation = Math.floor(self.animation);
        drawPlayer(self.render,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4,self.drawSize);
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    self.drawLayer1 = function(){
        if(self.x - self.width * 2 > -cameraX + WIDTH || self.x + self.width * 2 < -cameraX || self.y - self.height * 2 > -cameraY + HEIGHT || self.y + self.height * 2 < -cameraY){
            return;
        }
        if(self.direction < 210 || self.direction > 330){

        }
        else{
            return;
        }
        if(self.fadeState !== 1){
            ctx.globalAlpha = self.fade;
        }
        if(self.direction < 195 || self.direction > 345){
            if(Item.list[self.currentItem]){
                if(Item.list[self.currentItem].equip === 'shield'){
                    ctx.save();
                    ctx.translate(self.x,self.y);
                    ctx.rotate((self.direction - 90) / 180 * Math.PI);
                    var drawId = Item.list[self.currentItem].drawId;
                    var imgX = ((drawId - 1) % 26) * 24;
                    var imgY = ~~((drawId - 1) / 26) * 24;
                    ctx.drawImage(Img.items2,imgX,imgY,24,24,-48,-12,96,96);
                    ctx.restore();
                }
            }
        }
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    Player.list[self.id] = self;
    return self;
}
Player.list = {};
var Projectile = function(initPack){
    var self = Entity(initPack);
    self.spdDirection = 0;
    self.projectileType = initPack.projectileType;
    self.parent = initPack.parent;
    self.parentType = initPack.parentType;
    self.relativeToParent = initPack.relativeToParent;
    self.collisionType = initPack.collisionType;
    self.animations = initPack.animations;
    self.animation = initPack.animation;
    if(self.relativeToParent){
        self.fade = 1;
        self.fadeState = 1;
    }
    else{
        self.fade = 0.5;
    }

    if(Item.list[self.projectileType]){
        self.render = new OffscreenCanvas(24,24);
        var renderCtx = self.render.getContext("2d");
        resetCanvas(renderCtx);
        var drawId = Item.list[self.projectileType].drawId;
        var imgX = ((drawId - 1) % 26) * 24;
        var imgY = ~~((drawId - 1) / 26) * 24;
        renderCtx.drawImage(Img.items2,imgX,imgY,24,24,0,0,24,24);
    }

    self.update = function(){
        if(self.interpolationStage > 0){
            self.x += self.spdX;
            self.y += self.spdY;
            self.direction += self.spdDirection;
        }
        if(self.fadeState === 2){
            self.x += self.spdX;
            self.y += self.spdY;
            self.spdX = self.spdX * 0.5;
            self.spdY = self.spdY * 0.5;
        }
        self.interpolationStage -= 1;
    }
    self.draw = function(){
        if(self.x - self.width * 2 - self.height * 2 > -cameraX + WIDTH || self.x + self.width * 2 + self.height * 2 < -cameraX || self.y - self.width * 2 - self.height * 2 > -cameraY + HEIGHT || self.y + self.width * 2 + self.height * 2 < -cameraY){
            return;
        }
        if(self.fadeState === 0){
            if(settings.entityFadeOut === false){
                self.fadeState = 1;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade += 0.1;
                if(self.fade >= 1){
                    self.fade = 1;
                    self.fadeState = 1;
                }
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            if(settings.entityFadeOut === false){
                delete Projectile.list[self.id];
                return;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade -= 0.05;
                if(self.fade <= 0){
                    ctx.globalAlpha = 1;
                    delete Projectile.list[self.id];
                    return;
                }
            }
        }
        self.animation = Math.floor(self.animation);
        if(Img[self.projectileType]){
            ctx.save();
            ctx.translate(Math.round(self.x),Math.round(self.y));
            ctx.rotate(self.direction * Math.PI / 180);
            ctx.drawImage(Img[self.projectileType],self.animation * self.width / 4,0,self.width / 4,self.height / 4,-self.width / 2,-self.height / 2,self.width,self.height);
            ctx.restore();
        }
        else if(Item.list[self.projectileType]){
            ctx.save();
            ctx.translate(Math.round(self.x),Math.round(self.y));
            ctx.rotate(self.direction * Math.PI / 180);
            ctx.drawImage(self.render,self.animation * self.width / 4,0,self.width / 4,self.height / 4,-self.width / 2,-self.height / 2,self.width,self.height);
            ctx.restore();
        }
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    Projectile.list[self.id] = self;
    return self;
}
Projectile.list = {};
var Monster = function(initPack){
    var self = Actor(initPack);
    self.monsterType = initPack.monsterType;
    if(self.monsterType === 'teneyedone'){
        startBossSong('tenEyedOne');
    }
    self.draw = function(){
        if(self.x - self.width * 2 > -cameraX + WIDTH || self.x + self.width * 2 < -cameraX || self.y - self.height > -cameraY + HEIGHT || self.y + self.height * 2 < -cameraY){
            return;
        }
        if(self.fadeState === 0){
            if(settings.entityFadeOut === false){
                self.fadeState = 1;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade += 0.1;
                if(self.fade >= 1){
                    self.fade = 1;
                    self.fadeState = 1;
                }
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            if(settings.entityFadeOut === false){
                if(self.monsterType === 'teneyedone'){
                    stopBossSong('tenEyedOne');
                }
                delete Monster.list[self.id];
                return;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade -= 0.05;
                if(self.fade <= 0){
                    ctx.globalAlpha = 1;
                    if(self.monsterType === 'teneyedone'){
                        stopBossSong('tenEyedOne');
                    }
                    delete Monster.list[self.id];
                    return;
                }
            }
        }
        self.animation = Math.floor(self.animation);
        drawPlayer(self.render,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4,self.drawSize);
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    Monster.list[self.id] = self;
    return self;
}
Monster.list = {};
var Npc = function(initPack){
    var self = Actor(initPack);
    self.draw = function(){
        if(self.x - self.width * 2 > -cameraX + WIDTH || self.x + self.width * 2 < -cameraX || self.y - self.height > -cameraY + HEIGHT || self.y + self.height * 2 < -cameraY){
            return;
        }
        if(self.fadeState === 0){
            if(settings.entityFadeOut === false){
                self.fadeState = 1;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade += 0.1;
                if(self.fade >= 1){
                    self.fade = 1;
                    self.fadeState = 1;
                }
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            if(settings.entityFadeOut === false){
                delete Npc.list[self.id];
                return;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade -= 0.05;
                if(self.fade <= 0){
                    ctx.globalAlpha = 1;
                    delete Npc.list[self.id];
                    return;
                }
            }
        }
        self.animation = Math.floor(self.animation);
        drawPlayer(self.render,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4,self.drawSize);
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    Npc.list[self.id] = self;
    return self;
}
Npc.list = {};

var HarvestableNpc = function(initPack){
    var self = Entity(initPack);
    self.img = initPack.img;
    self.harvestHp = 0;
    self.harvestHpMax = 0;
    self.drawLayer0 = function(){
        if(self.img === 'none'){
            return;
        }
        if(self.x - self.width * 2 > -cameraX + WIDTH || self.x + self.width * 2 < -cameraX || self.y - self.height > -cameraY + HEIGHT || self.y + self.height * 2 < -cameraY){
            return;
        }
        if(self.fadeState === 0){
            if(settings.entityFadeOut === false){
                self.fadeState = 1;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade += 0.1;
                if(self.fade >= 1){
                    self.fade = 1;
                    self.fadeState = 1;
                }
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            if(settings.entityFadeOut === false){
                delete HarvestableNpc.list[self.id];
                return;
            }
            else{
                ctx.globalAlpha = self.fade;
                self.fade -= 0.05;
                if(self.fade <= 0){
                    ctx.globalAlpha = 1;
                    delete HarvestableNpc.list[self.id];
                    return;
                }
            }
        }
        ctx.drawImage(tileset,harvestableNpcData[self.img].imgX + harvestableNpcData[self.img].offsetX / 4 - self.width / 8,harvestableNpcData[self.img].imgY + harvestableNpcData[self.img].offsetY / 4 - self.height / 8 + harvestableNpcData[self.img].aboveHeight / 4,self.width / 4,self.height / 4 - harvestableNpcData[self.img].aboveHeight / 4,self.x - self.width / 2,self.y - self.height / 2 + harvestableNpcData[self.img].aboveHeight,self.width,self.height - harvestableNpcData[self.img].aboveHeight);
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    self.drawLayer1 = function(){
        if(self.img === 'none'){
            return;
        }
        if(self.x - self.width * 2 > -cameraX + WIDTH || self.x + self.width * 2 < -cameraX || self.y - self.height > -cameraY + HEIGHT || self.y + self.height * 2 < -cameraY){
            return;
        }
        if(harvestableNpcData[self.img].aboveHeight === 0){
            return;
        }
        if(settings.entityFadeOut === true){
            if(self.fadeState === 0){
                ctx.globalAlpha = self.fade;
            }
            else if(self.fadeState === 1){

            }
            else{
                ctx.globalAlpha = self.fade;
            }
        }
        ctx.drawImage(tileset,harvestableNpcData[self.img].imgX + harvestableNpcData[self.img].offsetX / 4 - self.width / 8,harvestableNpcData[self.img].imgY + harvestableNpcData[self.img].offsetY / 4 - self.height / 8,self.width / 4,harvestableNpcData[self.img].aboveHeight / 4,self.x - self.width / 2,self.y - self.height / 2,self.width,harvestableNpcData[self.img].aboveHeight);
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    self.drawHp = function(){
        if(self.x - self.width * 2 > -cameraX + WIDTH || self.x + self.width * 2 < -cameraX || self.y - self.height > -cameraY + HEIGHT || self.y + self.height * 2 < -cameraY){
            return;
        }
        if(self.fadeState === 0){
            ctx.globalAlpha = self.fade;
        }
        else if(self.fadeState === 1){

        }
        else{
            ctx.globalAlpha = self.fade;
        }
        ctx.drawImage(Img.healthbar,0,12,16,4,Math.round(self.x - 32),Math.round(self.y) - self.height / 2 - 20,64,16);
        ctx.drawImage(Img.healthbar,1,9,Math.round(14 * self.harvestHp / self.harvestHpMax),2,Math.round(self.x - 28),Math.round(self.y) - self.height / 2 - 16,Math.round(14 * self.harvestHp / self.harvestHpMax) * 4,8);
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    if(self.img !== 'none'){
        HarvestableNpc.list[self.id] = self;
    }
    return self;
}
HarvestableNpc.list = {};

var selectedDroppedItem = null;

var DroppedItem = function(initPack){
    var self = Entity(initPack);
    self.item = initPack.item;
    if(!Item.list[self.item]){
        return;
    }
    self.amount = initPack.amount;
    self.parent = initPack.parent;
    self.allPlayers = initPack.allPlayers;
    if(self.parent + '' !== selfId + '' && self.allPlayers === false){
        return
    }
    self.render = new OffscreenCanvas(48,48);
    self.renderSelect = new OffscreenCanvas(48,48);
    var renderCtx = self.render.getContext("2d");
    var renderSelectCtx = self.renderSelect.getContext("2d");
    resetCanvas(renderCtx);
    resetCanvas(renderSelectCtx);
    var drawId = Item.list[self.item].drawId;
    var imgX = ((drawId - 1) % 26) * 24;
    var imgY = ~~((drawId - 1) / 26) * 24;
    if(drawId === 155){
        renderCtx.drawImage(Img.items2,imgX,imgY,14,14,0,0,48,48);
        renderSelectCtx.drawImage(Img.items2select,imgX,imgY,14,14,0,0,48,48);
    }
    else{
        renderCtx.drawImage(Img.items2,imgX,imgY,24,24,0,0,48,48);
        renderSelectCtx.drawImage(Img.items2select,imgX,imgY,24,24,0,0,48,48);
    }
    self.draw = function(){
        if(self.x - self.width * 2 > -cameraX + WIDTH || self.x + self.width * 2 < -cameraX || self.y - self.height * 2 > -cameraY + HEIGHT || self.y + self.height * 2 < -cameraY){
            return;
        }
        if(self.isColliding({x:mouseX + Player.list[selfId].x,y:mouseY + Player.list[selfId].y,width:0,height:0}) && inGame === true && selectedDroppedItem === null){
            ctx.drawImage(self.renderSelect,self.x - 24,self.y - 24);
            itemMenu.innerHTML = getEntityDescription(self);
            itemMenu.style.display = 'inline-block';
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
            selectedDroppedItem = self.id;
        }
        else{
            ctx.drawImage(self.render,self.x - 24,self.y - 24);
        }
        if(self.amount !== 1){
            ctx.font = "13px pixel";
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            ctx.fillText(self.amount,Math.round(self.x + 24),Math.round(self.y + 24));
        }
    }
    DroppedItem.list[self.id] = self;
    return self;
}
DroppedItem.list = {};

var Particle = function(initPack){
    var self = Object.create(particleData[initPack.particleType]);
    self.id = Math.random();
    self.x = initPack.x;
    self.y = initPack.y;
    self.map = initPack.map;
    self.particleType = initPack.particleType;
    if(self.positionType === 'random'){
        self.x += self.positionValue * (Math.random() * 2 - 1);
        self.y += self.positionValue * (Math.random() * 2 - 1);
    }
    if(self.movementType === 'shower'){
        self.spdX = Math.random() * 6 - 3;
        self.spdY = Math.random() * -4;
    }
    if(self.movementType === 'rise'){
        self.spdX = Math.random() * 6 - 3;
        self.spdY = -self.movementSpeed;
        self.timer = self.movementTimer;
    }
    if(self.movementType === 'fall'){
        self.spdX = Math.random() * 6 - 3;
        self.spdY = self.movementSpeed;
        self.timer = self.movementTimer;
        self.y -= self.spdY * (self.timer - self.movementTimerBuffer);
    }
    if(self.rotationType === 'random'){
        self.direction = Math.random() * 360;
        self.spdDirection = self.rotationValue * (Math.random() * 2 - 1);
    }
    if(self.drawType === 'text'){
        ctx.font = self.drawSize + "px pixel";
        var metrics = ctx.measureText(initPack.value);
        self.width = metrics.width;
        self.height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    }
    self.update = function(){
        self.x += self.spdX;
        self.y += self.spdY;
        self.x = Math.round(self.x);
        self.y = Math.round(self.y);
        if(self.movementType === 'shower'){
            self.spdY += 0.1;
            self.spdX *= 0.99;
        }
        if(self.timer !== undefined){
            self.timer -= 1;
            if(self.timer <= 0){
                self.toRemove = true;
            }
            else if(self.timer <= self.movementTimerBuffer){
                self.spdX = 0;
                self.spdY = 0;
            }
        }
        if(self.direction !== undefined){
            self.direction += self.spdDirection;
            self.direction = Math.round(self.direction);
        }
        if(self.opacity !== undefined){
            self.opacity += self.spdOpacity;
            if(self.opacity <= 0){
                self.toRemove = true;
            }
        }
        if(self.map !== Player.list[selfId].map){
            self.toRemove = true;
        }
    }
    self.draw = function(){
        if(self.x - self.width * 2 > -cameraX + WIDTH || self.x + self.width * 2 < -cameraX || self.y - self.height * 2 > -cameraY + HEIGHT || self.y + self.height * 2 < -cameraY){
            return;
        }
        if(self.drawType === 'image'){
            if(self.opacity !== undefined){
                if(self.opacity >= 0 && self.opacity < 1){
                    ctx.globalAlpha = self.opacity;
                }
            }
            if(self.direction){
                ctx.save();
                ctx.translate(self.x,self.y);
                ctx.rotate(self.direction * Math.PI / 180);
                ctx.drawImage(Img[self.particleType],-Img[self.particleType].width / 2 * self.drawScale,-Img[self.particleType].height / 2 * self.drawScale,Img[self.particleType].width * self.drawScale,Img[self.particleType].height * self.drawScale);
                ctx.restore();
            }
            else{
                ctx.drawImage(Img[self.particleType],self.x - Img[self.particleType].width / 2 * self.drawScale,self.y - Img[self.particleType].height / 2 * self.drawScale,Img[self.particleType].width * self.drawScale,Img[self.particleType].height * self.drawScale);
            }
            if(self.opacity !== undefined){
                if(self.opacity >= 0 && self.opacity < 1){
                    ctx.globalAlpha = 1;
                }
            }
        }
        if(self.drawType === 'text'){
            if(self.direction !== undefined){
                ctx.save();
                ctx.translate(self.x,self.y);
                ctx.rotate(self.direction * Math.PI / 180);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = self.drawSize + "px pixel";
                ctx.fillStyle = 'rgba(' + self.drawColor + ',' + self.opacity + ')';
                ctx.fillText(initPack.value,0,0);
                ctx.restore();
            }
            else{
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = self.drawSize + "px pixel";
                ctx.fillStyle = 'rgba(' + self.drawColor + ',' + self.opacity + ')';
                ctx.fillText(initPack.value,self.x,self.y);
            }
        }
        if(self.drawType === 'rain'){
            if(self.timer <= 3){
                ctx.drawImage(Img[self.particleType],14,0,Img[self.particleType].width / 3,Img[self.particleType].height,self.x - Img[self.particleType].width * 2 / 3,self.y - Img[self.particleType].height * 2,Img[self.particleType].width * 4 / 3,Img[self.particleType].height * 4);
            }
            else if(self.timer <= 6){
                ctx.drawImage(Img[self.particleType],7,0,Img[self.particleType].width / 3,Img[self.particleType].height,self.x - Img[self.particleType].width * 2 / 3,self.y - Img[self.particleType].height * 2,Img[self.particleType].width * 4 / 3,Img[self.particleType].height * 4);
            }
            else{
                ctx.drawImage(Img[self.particleType],0,0,Img[self.particleType].width / 3,Img[self.particleType].height,self.x - Img[self.particleType].width * 2 / 3,self.y - Img[self.particleType].height * 2,Img[self.particleType].width * 4 / 3,Img[self.particleType].height * 4);
            }
        }
    }
    Particle.list[self.id] = self;
}
Particle.list = {};

Particle.create = function(x,y,map,particleType,number,value){
    if(!tabVisible){
        return;
    }
    var newNumber = Math.ceil(number * settings.particlesPercentage / 100);
    for(var i = 0;i < newNumber;i++){
        new Particle({
            x:x,
            y:y,
            map:map,
            value:value,
            particleType:particleType,
        });
    }
}