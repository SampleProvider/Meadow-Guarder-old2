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
    self.drawHp = function(){
        ctx.drawImage(Img.greenHealthBar,0,0,42,5,Math.round(self.x) - 63,Math.round(self.y) - self.height / 2 - 24,126,15);
        ctx.drawImage(Img.greenHealthBar,0,6,Math.round(42 * self.hp / self.hpMax),5,Math.round(self.x) - 63,Math.round(self.y) - self.height / 2 - 24,Math.round(126 * self.hp / self.hpMax),15);
    }
    return self;
}

var Player = function(initPack){
    var self = Entity(initPack);
    self.username = initPack.username;
    self.displayName = initPack.displayName;
    self.img = initPack.img;
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
    self.direction = initPack.direction;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.level = initPack.level;
    self.animation = initPack.animation;
    self.animationDirection = initPack.animationDirection;
    self.stats = initPack.stats;
    self.debuffs = initPack.debuffs;
    self.draw = function(){
        self.animation = Math.floor(self.animation);
        drawPlayer(Img.player,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4);
    }
    self.drawName = function(){
        ctx.font = "15px pixel";
        ctx.fillStyle = '#ff7700';
        ctx.textAlign = "center";
        ctx.fillText(self.displayName,Math.round(self.x),Math.round(self.y - 18 * 4 - 32));
    }
    self.drawHp = function(){
        self.drawName();
        ctx.drawImage(Img.greenHealthBar,0,0,42,5,Math.round(self.x) - 63,Math.round(self.y) - 18 * 4 - 24,126,15);
        ctx.drawImage(Img.greenHealthBar,0,6,Math.round(42 * self.hp / self.hpMax),5,Math.round(self.x) - 63,Math.round(self.y) - 18 * 4 - 24,Math.round(126 * self.hp / self.hpMax),15);
    }
    Player.list[self.id] = self;
    return self;
}
Player.list = {};
var Projectile = function(initPack){
    var self = Entity(initPack);
    self.direction = initPack.direction;
    self.projectileType = initPack.projectileType;
    self.update = function(){
        if(self.interpolationStage > 0){
            self.x += self.spdX;
            self.y += self.spdY;
        }
        self.interpolationStage -= 1;
    }
    self.draw = function(){
        // var x = self.x;
        // var y = self.y;
        // if(self.relativeToPlayer && Player.list[self.relativeToPlayer]){
        //     x += Player.list[self.relativeToPlayer].x;
        //     y += Player.list[self.relativeToPlayer].y;
        // }
        // if(projectileData[self.projectileType] && showParticles){
        //     if(projectileData[self.projectileType].light.a === 0){

        //     }
        //     else{
        //         var light = Object.create(projectileData[self.projectileType].light);
        //         for(var i in Projectile.list){
        //             var pX = Projectile.list[i].x;
        //             var pY = Projectile.list[i].y;
        //             if(Projectile.list[i].relativeToPlayer && Player.list[Projectile.list[i].relativeToPlayer]){
        //                 pX += Player.list[Projectile.list[i].relativeToPlayer].x;
        //                 pY += Player.list[Projectile.list[i].relativeToPlayer].y;
        //             }
        //             if(getDistance(x,y,pX,pY) < light.radius && i !== self.id){
        //                 light.r += (255 - light.r) / 15;
        //                 light.g += (255 - light.g) / 15;
        //                 light.b += (255 - light.b) / 15;
        //                 light.a *= 0.95;
        //                 light.radius *= 0.98;
        //             }
        //         }
        //         entityLightList[self.id] = {
        //             x:Math.round(x),
        //             y:Math.round(y),
        //             map:self.map,
        //             r:Math.min(light.r,255),
        //             g:Math.min(light.g,255),
        //             b:Math.min(light.b,255),
        //             a:Math.max(light.a,0.05),
        //             radius:Math.max(light.radius,40),
        //         }
        //     }
        // }
        // if(self.relativeToPlayer && Player.list[self.relativeToPlayer]){
        //     ctx0.translate(self.x + Player.list[self.relativeToPlayer].x,self.y + Player.list[self.relativeToPlayer].y);
        // }
        // else{
        ctx.translate(Math.round(self.x),Math.round(self.y));
        // }
        ctx.rotate(self.direction * Math.PI / 180);
        // if(projectileData[self.projectileType]){
            if(self.projectileType === 'arrow'){
                ctx.drawImage(Img[self.projectileType],0,0,28,8,-28 * 2,-8 * 2,28 * 4,8 * 4);
            }
        // }
        ctx.rotate(-self.direction * Math.PI / 180);
        // if(self.relativeToPlayer && Player.list[self.relativeToPlayer]){
        //     ctx0.translate(-self.x - Player.list[self.relativeToPlayer].x,-self.y - Player.list[self.relativeToPlayer].y);
        // }
        // else{
        ctx.translate(-Math.round(self.x),-Math.round(self.y));
        // }
    }
    Projectile.list[self.id] = self;
    return self;
}
Projectile.list = {};
var Monster = function(initPack){
    var self = Entity(initPack);
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
    self.direction = initPack.direction;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.stats = initPack.stats;
    self.animation = initPack.animation;
    self.animationDirection = initPack.animationDirection;
    self.draw = function(){
        self.animation = Math.floor(self.animation);
        drawPlayer(Img.skeleton,ctx,self.animationDirection,self.animation,Math.round(self.x),Math.round(self.y),4);
    }
    self.drawHp = function(){
        ctx.drawImage(Img.redHealthBar,0,0,42,5,Math.round(self.x) - 63,Math.round(self.y) - 18 * 4 - 24,126,15);
        ctx.drawImage(Img.redHealthBar,0,6,Math.round(42 * self.hp / self.hpMax),5,Math.round(self.x) - 63,Math.round(self.y) - 18 * 4 - 24,Math.round(126 * self.hp / self.hpMax),15);
    }
    Monster.list[self.id] = self;
    return self;
}
Monster.list = {};