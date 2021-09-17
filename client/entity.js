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
    self.fade = 0;
    self.fadeState = 0;
    self.stats = initPack.stats;
    self.team = initPack.team;
    self.showHealthBar = initPack.showHealthBar;

    self.render = renderPlayer(self.img);

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
        self.drawName();
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
            ctx.drawImage(Img.healthbar,0,4,16,4,Math.round(self.x) - 32,Math.round(self.y) - yDistance * 4 - 20,64,16);
            ctx.drawImage(Img.healthbar,0,0,Math.round(14 * self.hp / self.hpMax) + 1,4,Math.round(self.x) - 32,Math.round(self.y) - yDistance * 4 - 20,Math.round(56 * self.hp / self.hpMax) + 4,16);
        }
        else{
            ctx.drawImage(Img.healthbar,0,20,16,4,Math.round(self.x) - 32,Math.round(self.y) - yDistance * 4 - 20,64,16);
            ctx.drawImage(Img.healthbar,0,16,Math.round(14 * self.hp / self.hpMax) + 1,4,Math.round(self.x) - 32,Math.round(self.y) - yDistance * 4 - 20,Math.round(56 * self.hp / self.hpMax) + 4,16);
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
                self.toRemove = true;
                return;
            }
        }
        if(Img[self.currentItem]){
            ctx.save();
            ctx.translate(self.x,self.y);
            ctx.rotate((self.direction - 225) / 180 * Math.PI);
            ctx.drawImage(Img[self.currentItem],-Img[self.currentItem].width * 4,-Img[self.currentItem].height * 4,Img[self.currentItem].width * 4,Img[self.currentItem].height * 4);
            ctx.restore();
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
    self.relativeToParent = initPack.relativeToParent;
    self.parentType = initPack.parentType;
    self.animations = initPack.animations;
    self.animation = initPack.animation;
    self.fade = 0;
    self.fadeState = 0;
    if(self.relativeToParent !== false){
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
            ctx.globalAlpha = self.fade;
            self.fade -= 0.05;
            if(self.fade <= 0){
                ctx.globalAlpha = 1;
                self.toRemove = true;
                return;
            }
        }
        self.animation = Math.floor(self.animation);
        increaseProjectileByParent(self);
        ctx.save();
        ctx.translate(Math.round(self.x),Math.round(self.y));
        ctx.rotate(self.direction * Math.PI / 180);
        ctx.drawImage(Img[self.projectileType],self.animation * self.width / 4,0,self.width / 4,self.height / 4,-self.width / 2,-self.height / 2,self.width,self.height);
        ctx.restore();
        decreaseProjectileByParent(self);
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
                self.toRemove = true;
                return;
            }
        }
        self.animation = Math.floor(self.animation);
        drawPlayer(Img[self.monsterType],ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4,self.drawSize);
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
                self.toRemove = true;
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
    self.fade = 0;
    self.fadeState = 0;
    self.harvestHp = 0;
    self.harvestHpMax = 0;
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
                self.toRemove = true;
                return;
            }
        }
        if(self.img !== 'none'){
            if(Img[self.img + '0']){
                ctx.drawImage(Img[self.img + '0'],self.x - self.width / 2,self.y - self.height / 2,self.width,self.height);
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
                ctx.drawImage(Img[self.img + '1'],self.x - self.width / 2,self.y - self.height / 2 - self.height,self.width,self.height);
            }
        }
        ctx.drawImage(Img.healthbar,0,12,16,4,Math.round(self.x) - 32,Math.round(self.y) - self.height / 2 - self.height - 4,64,16);
        ctx.drawImage(Img.healthbar,0,8,Math.round(14 * self.harvestHp / self.harvestHpMax) + 1,4,Math.round(self.x) - 32,Math.round(self.y) - self.height / 2 - self.height - 4,Math.round(56 * self.harvestHp / self.harvestHpMax) + 4,16);
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
    self.parent = initPack.parent;
    self.allPlayers = initPack.allPlayers;
    self.draw = function(){
        if(self.parent === selfId || self.allPlayers){
            if(Player.list[selfId].x + mouseX > self.x - 36 && Player.list[selfId].x + mouseX < self.x + 36 && Player.list[selfId].y + mouseY > self.y - 36 && Player.list[selfId].y + mouseY < self.y + 36 && selected === false){
                ctx.drawImage(Img[self.item + 'select'],self.x - 36,self.y - 36,72,72);
                selected = true;
            }
            else{
                ctx.drawImage(Img[self.item],self.x - 36,self.y - 36,72,72);
            }
        }
    }
    DroppedItem.list[self.id] = self;
    return self;
}
DroppedItem.list = {};