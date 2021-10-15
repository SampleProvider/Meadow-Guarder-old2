var Entity = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.spdX = 0;
    self.spdY = 0;
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
            self.x += self.spdX;
            self.y += self.spdY;
            self.x = Math.round(self.x);
            self.y = Math.round(self.y);
        }
        self.interpolationStage -= 1;
    }
    return self;
}

var Actor = function(initPack){
    var self = Entity(initPack);
    self.img = initPack.img;
    self.name = initPack.name;
    self.direction = initPack.direction;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.drawSize = initPack.drawSize;
    self.animation = initPack.animation;
    self.animationDirection = initPack.animationDirection;
    self.stats = initPack.stats;
    self.team = initPack.team;
    self.showHealthBar = initPack.showHealthBar;

    self.render = renderPlayer(self.img,self.drawSize);

    self.drawName = function(){
        ctx.font = "15px pixel";
        ctx.fillStyle = '#ff7700';
        ctx.textAlign = "center";
        if(self.drawSize === 'small'){
            var yDistance = 8;
        }
        else if(self.drawSize === 'medium'){
            var yDistance = 17;
        }
        else{
            var yDistance = 16;
        }
        ctx.fillText(self.name,Math.round(self.x),Math.round(self.y - yDistance * 4 - 32));
    }
    self.drawHp = function(){
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
    self.debuffs = initPack.debuffs;
    self.draw = function(){
        if(self.fadeState === 0){
            ctx.globalAlpha = self.fade;
            self.fade += 0.05;
            if(self.fade >= 1){
                self.fade = 1;
                self.fadeState = 1;
            }
        }
        else if(self.fadeState === 1){

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
        if(Item.list[self.currentItem]){
            if(Item.list[self.currentItem].displayItem){
                ctx.save();
                ctx.translate(self.x,self.y);
                ctx.rotate((self.direction - 225) / 180 * Math.PI);
                var drawId = Item.list[self.currentItem].drawId;
                var img_x = ((drawId - 1) % 26) * 24;
                var img_y = ~~((drawId - 1) / 26) * 24;
                ctx.drawImage(Img.items2,img_x,img_y,24,24,-96,-96,96,96);
                ctx.restore();
            }
        }
        self.animation = Math.floor(self.animation);
        drawPlayer(self.render,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4,self.drawSize);
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
    self.direction = initPack.direction;
    self.projectileType = initPack.projectileType;
    self.canCollide = initPack.canCollide;
    self.parent = initPack.parent;
    self.parentType = initPack.parentType;
    self.relativeToParent = initPack.relativeToParent;
    self.animations = initPack.animations;
    self.animation = initPack.animation;
    if(self.relativeToParent){
        self.fade = 1;
        self.fadeState = 1;
    }
    self.update = function(){
        if(self.interpolationStage > 0){
            self.x += self.spdX;
            self.y += self.spdY;
        }
        self.interpolationStage -= 1;
    }
    self.draw = function(){
        if(self.fadeState === 0){
            ctx.globalAlpha = self.fade;
            self.fade += 0.05;
            if(self.fade >= 1){
                self.fade = 1;
                self.fadeState = 1;
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            if(self.relativeToParent){
                delete Projectile.list[self.id];
                return;
            }
            ctx.globalAlpha = self.fade;
            self.fade -= 0.05;
            if(self.fade <= 0){
                ctx.globalAlpha = 1;
                delete Projectile.list[self.id];
                return;
            }
        }
        self.animation = Math.floor(self.animation);
        ctx.save();
        ctx.translate(Math.round(self.x),Math.round(self.y));
        ctx.rotate(self.direction * Math.PI / 180);
        ctx.drawImage(Img[self.projectileType],self.animation * self.width / 4,0,self.width / 4,self.height / 4,-self.width / 2,-self.height / 2,self.width,self.height);
        ctx.restore();
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
    self.draw = function(){
        if(self.fadeState === 0){
            ctx.globalAlpha = self.fade;
            self.fade += 0.05;
            if(self.fade >= 1){
                self.fade = 1;
                self.fadeState = 1;
            }
        }
        else if(self.fadeState === 1){

        }
        else{
            ctx.globalAlpha = self.fade;
            self.hp = 0;
            self.fade -= 0.05;
            if(self.fade <= 0){
                ctx.globalAlpha = 1;
                delete Monster.list[self.id];
                return;
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
        if(self.fadeState === 0){
            ctx.globalAlpha = self.fade;
            self.fade += 0.05;
            if(self.fade >= 1){
                self.fade = 1;
                self.fadeState = 1;
            }
        }
        else if(self.fadeState === 1){

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
        self.animation = Math.floor(self.animation);
        drawPlayer(Img.player,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4,self.drawSize);
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
    if(self.img === 'none'){
        self.fade = 0;
        self.fadeState = 2;
    }
    self.drawLayer0 = function(){
        if(self.fadeState === 0){
            ctx.globalAlpha = self.fade;
            self.fade += 0.05;
            if(self.fade >= 1){
                self.fade = 1;
                self.fadeState = 1;
            }
        }
        else if(self.fadeState === 1){

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
        if(self.img !== 'none'){
            if(Img[self.img + '0']){
                ctx.drawImage(Img[self.img + '0'],self.x - self.width / 2,self.y,self.width,self.height / 2);
            }
        }
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    self.drawLayer1 = function(){
        if(self.fadeState === 0){
            ctx.globalAlpha = self.fade;
        }
        else if(self.fadeState === 1){

        }
        else{
            ctx.globalAlpha = self.fade;
        }
        if(self.img !== 'none'){
            if(Img[self.img + '1']){
                ctx.drawImage(Img[self.img + '1'],self.x - self.width / 2,self.y - self.height / 2,self.width,self.height / 2);
            }
        }
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    self.drawHp = function(){
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
    HarvestableNpc.list[self.id] = self;
    return self;
}
HarvestableNpc.list = {};

var selected = false;

var DroppedItem = function(initPack){
    var self = Entity(initPack);
    self.item = initPack.item;
    self.amount = initPack.amount;
    self.parent = initPack.parent;
    self.allPlayers = initPack.allPlayers;
    self.render = new OffscreenCanvas(48,48);
    self.renderSelect = new OffscreenCanvas(48,48);
    var renderCtx = self.render.getContext("2d");
    var renderSelectCtx = self.renderSelect.getContext("2d");
    resetCanvas(renderCtx);
    resetCanvas(renderSelectCtx);
    var drawId = Item.list[self.item].drawId;
    var img_x = ((drawId - 1) % 26) * 24;
    var img_y = ~~((drawId - 1) / 26) * 24;
    renderCtx.drawImage(Img.items2,img_x,img_y,24,24,0,0,48,48);
    renderSelectCtx.drawImage(Img.items2select,img_x,img_y,24,24,0,0,48,48);
    self.draw = function(){
        if(self.parent === selfId || self.allPlayers){
            if(Player.list[selfId].x + mouseX > self.x - 24 && Player.list[selfId].x + mouseX < self.x + 24 && Player.list[selfId].y + mouseY > self.y - 24 && Player.list[selfId].y + mouseY < self.y + 24 && selected === false){
                ctx.drawImage(self.renderSelect,self.x - 24,self.y - 24);
                selected = true;
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
    }
    DroppedItem.list[self.id] = self;
    return self;
}
DroppedItem.list = {};