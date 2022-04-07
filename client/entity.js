var Entity = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.z = initPack.z;
    self.spdX = 0;
    self.spdY = 0;
    self.serverX = initPack.x;
    self.serverY = initPack.y;
    self.direction = initPack.direction;
    self.width = initPack.width;
    self.height = initPack.height;
    self.type = initPack.type;
    self.map = initPack.map;

    self.interpolationStage = 3;
    self.fade = 0;
    self.fadeState = 0;
    if(!initPack.fadeIn){
        self.fade = 1;
        self.fadeState = 1;
    }
    if(initPack.toRemove){
        return;
    }
    self.toRemove = false;
    self.tickUpdated = true;

    self.update = function(){
        if(self.interpolationStage === 1){
            self.x = self.serverX;
            self.y = self.serverY;
        }
        else if(self.interpolationStage > 0){
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
            self.x = app.floor(self.x);
            self.y = app.floor(self.y);
        }
        self.interpolationStage -= 1;
    }
	self.getSquareDistance = function(pt){
		return Math.max(Math.abs(~~(self.x - pt.x)),Math.abs(~~(self.y - pt.y))) / 64;
    }
    self.isColliding = function(x,y){
        if(x <= self.x - self.width / 2){
            return false;
        }
        if(x >= self.x + self.width / 2){
            return false;
        }
        if(y <= self.y - self.height / 2){
            return false;
        }
        if(y >= self.y + self.height / 2){
            return false;
        }
        return true;
    }
    return self;
}

var Actor = function(initPack){
    var self = Entity(initPack);
    self.animation = initPack.animation;
    self.image = initPack.image;
    self.renderImage = function(){
        try{
            self.render = new OffscreenCanvas(128,128);
            var gl = self.render.getContext('2d');
        }
        catch(err){
            self.render = document.createElement('canvas');
            var gl = self.render.getContext('2d');
            gl.canvas.width = 128;
            gl.canvas.height = 128;
        }
        app.resetCanvas(gl);
        for(var i in self.image){
            if(self.image[i] !== "none"){
                if(app.images[self.image[i]]){
                    gl.drawImage(app.images[self.image[i]],0,0,128,128);
                }
            }
        }
    }
    self.renderImage();
    self.draw = function(){
        app.ctx.fillStyle = '#ff0000';
        app.ctx.fillRect(self.x - self.width / 2,self.y - self.height / 2,self.width,self.height)
        var animationValue = 0;
        switch(self.animation.animationDirection){
            case "down":
                animationValue = 0;
                break;
            case "left":
                animationValue = 1;
                break;
            case "right":
                animationValue = 2;
                break;
            case "up":
                animationValue = 3;
                break;
        }
        app.ctx.drawImage(self.render,self.render.height / 4 * app.floor(self.animation.animationStage),self.render.width / 4 * animationValue,self.render.height / 4,self.render.width / 4,self.x - self.render.width / 2,self.y - self.render.height + self.height / 2,self.render.width,self.render.height);
    }
    return self;
}

var Player = function(initPack){
    var self = Actor(initPack);
    Player.list[self.id] = self;
    return self;
}
Player.list = {};

var Monster = function(initPack){
    var self = Actor(initPack);
    Monster.list[self.id] = self;
    return self;
}
Monster.list = {};

var Projectile = function(initPack){
    var self = Entity(initPack);
    self.draw = function(){
        app.ctx.save();
        app.ctx.translate(self.x,self.y);
        app.ctx.rotate(self.direction);
        app.ctx.fillRect(-self.width / 2,-self.height / 2,self.width,self.height);
        app.ctx.restore();
    }
    Projectile.list[self.id] = self;
    return self;
}
Projectile.list = {};