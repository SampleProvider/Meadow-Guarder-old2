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
        if(self.drawSize === 'small'){
            var yDistance = 8;
        }
        else if(self.drawSize === 'medium'){
            var yDistance = 17;
        }
        else{
            var yDistance = 16;
        }
        ctx.drawImage(Img.greenHealthBar,0,0,42,5,Math.round(self.x) - 63,Math.round(self.y) - yDistance * 4 - 24,126,15);
        ctx.drawImage(Img.greenHealthBar,0,6,Math.round(42 * self.hp / self.hpMax),5,Math.round(self.x) - 63,Math.round(self.y) - yDistance * 4 - 24,Math.round(126 * self.hp / self.hpMax),15);
        if(self.fadeState !== 1){
            ctx.globalAlpha = 1;
        }
    }
    return self;
}

var Player = function(initPack){
    var self = Actor(initPack);
    // self.renderedImg = {
    //     body:renderPlayer(Img.playerBody,self.img.body),
    //     shirt:renderPlayer(Img.playerShirt,self.img.shirt),
    //     pants:renderPlayer(Img.playerPants,self.img.pants),
    //     hair:renderPlayer(Img.playerHair[self.img.hairType],self.img.hair),
    // }
    // self.render = document.createElement('canvas');
    // var renderCtx = self.render.getContext('2d');
    // renderCtx.canvas.width = 72 * 4;
    // renderCtx.canvas.height = 152 * 4;
    // renderCtx.drawImage(self.renderedImg.body,0,0);
    // renderCtx.drawImage(self.renderedImg.shirt,0,0);
    // renderCtx.drawImage(self.renderedImg.pants,0,0);
    // renderCtx.drawImage(self.renderedImg.hair,0,0);
    self.level = initPack.level;
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
        if(inventory.items[inventory.hotbarSelectedItem]){
            if(inventory.items[inventory.hotbarSelectedItem].id){
                if(Item.list[inventory.items[inventory.hotbarSelectedItem].id].damage){
                    ctx.save();
                    ctx.translate(self.x,self.y);
                    ctx.rotate((self.direction - 225) / 180 * Math.PI);
                    ctx.drawImage(Img[inventory.items[inventory.hotbarSelectedItem].id],-Img[inventory.items[inventory.hotbarSelectedItem].id].width * 4,-Img[inventory.items[inventory.hotbarSelectedItem].id].height * 4,Img[inventory.items[inventory.hotbarSelectedItem].id].width * 4,Img[inventory.items[inventory.hotbarSelectedItem].id].height * 4);
                    ctx.restore();
                }
            }
        }
        self.animation = Math.floor(self.animation);
        drawPlayer(Img.player,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4,self.drawSize);
        //drawPlayer(Img.sword,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4,'large');
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
    self.update = function(){
        if(self.interpolationStage > 0){
            self.x += self.spdX;
            self.y += self.spdY;
        }
        self.interpolationStage -= 1;
    }
    self.draw = function(){
        self.animation = Math.floor(self.animation);
        increaseProjectileByParent(self);
        ctx.save();
        ctx.translate(Math.round(self.x),Math.round(self.y));
        ctx.rotate(self.direction * Math.PI / 180);
        ctx.drawImage(Img[self.projectileType],self.animation * self.width / 4,0,self.width / 4,self.height / 4,-self.width / 2,-self.height / 2,self.width,self.height);
        ctx.restore();
        decreaseProjectileByParent(self);
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
    self.drawHp = function(){
        if(self.fadeState !== 1){
            if(self.fade <= 0){
                return;
            }
            ctx.globalAlpha = self.fade;
        }
        self.drawName();
        if(self.drawSize === 'small'){
            var yDistance = 8;
        }
        else if(self.drawSize === 'medium'){
            var yDistance = 17;
        }
        else{
            var yDistance = 16;
        }
        ctx.drawImage(Img.redHealthBar,0,0,42,5,Math.round(self.x) - 63,Math.round(self.y) - yDistance * 4 - 24,126,15);
        ctx.drawImage(Img.redHealthBar,0,6,Math.round(42 * self.hp / self.hpMax),5,Math.round(self.x) - 63,Math.round(self.y) - yDistance * 4 - 24,Math.round(126 * self.hp / self.hpMax),15);
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

var DroppedItem = function(initPack){
    var self = Entity(initPack);
    self.item = initPack.item;
    self.parent = initPack.parent;
    self.allPlayers = initPack.allPlayers;
    self.draw = function(){
        if(self.parent === selfId || self.allPlayers){
            ctx.drawImage(Img[self.item],self.x - 36,self.y - 36,72,72);
        }
    }
    DroppedItem.list[self.id] = self;
    return self;
}
DroppedItem.list = {};