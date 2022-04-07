
var pathfinding = require('pathfinding');


Entity = function(param){
    var self = {};
    self.id = globalId;
    globalId += 1;
    
    self.x = 0;
    self.y = 0;
    self.z = 0;
    self.width = 0;
    self.height = 0;
    self.direction = 0;
    self.spdX = 0;
    self.spdY = 0;
    self.map = 'test';
    self.region = '';

    self.toRemove = false;
    self.fadeIn = true;

    self.lastX = 0;
    self.lastY = 0;
    self.gridX = 0;
    self.gridY = 0;

    self.type = 'Entity';
    if(param){
        if(param.id){
            self.id = param.id;
        }
        if(param.x){
            self.x = param.x;
        }
        if(param.y){
            self.y = param.y;
        }
        if(param.spdX){
            self.spdX = param.spdX;
        }
        if(param.spdY){
            self.spdY = param.spdY;
        }
        if(param.width){
            self.width = param.width;
        }
        if(param.height){
            self.height = param.height;
        }
        if(param.direction){
            self.direction = param.direction;
        }
        if(param.map){
            self.map = param.map;
        }
        if(param.z){
            self.z = param.z;
        }
    }
    self.update = function(){
        self.updatePosition();
        self.updateGridPosition();
    }
    self.updatePosition = function(){
        self.lastX = self.x;
        self.lastY = self.y;
        self.x += self.spdX;
        self.y += self.spdY;
    }
    self.updateGridPosition = function(){
        self.gridX = app.floor(self.x / 64);
        self.gridY = app.floor(self.y / 64);
        self.x = app.floor(self.x);
        self.y = app.floor(self.y);
    }
	self.getDistance = function(entity){
		return Math.sqrt(Math.pow(self.x-entity.x,2) + Math.pow(self.y-entity.y,2));
    }
	self.getSquareDistance = function(entity){
		return Math.max(Math.abs(app.floor(self.x - entity.x)),Math.abs(app.floor(self.y - entity.y))) / 64;
    }
	self.getRhombusDistance = function(entity){
		return Math.abs(app.floor(self.x - entity.x)) + Math.abs(app.floor(self.y - entity.y));
    }
    self.isColliding = function(entity){
        if(entity.type === 'Projectile'){
            return entity.isColliding(self);
        }
        if(entity.map !== self.map){
            return false;
        }
        if(entity.x + entity.width / 2 <= self.x - self.width / 2){
            return false;
        }
        if(entity.x - entity.width / 2 >= self.x + self.width / 2){
            return false;
        }
        if(entity.y + entity.height / 2 <= self.y - self.height / 2){
            return false;
        }
        if(entity.y - entity.height / 2 >= self.y + self.height / 2){
            return false;
        }
        return true;
    }
    self.updateGridPosition();
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.z = self.z;
        pack.width = self.width;
        pack.height = self.height;
        pack.map = self.map;
        pack.direction = self.direction;
        pack.toRemove = self.toRemove;
        if(self.fadeIn === true){
            pack.fadeIn = true;
            self.fadeIn = false;
        }
        return pack;
    }
    return self;
}

Rig = function(param){
    var self = Entity(param);
    self.rig = {
        canMove:true,
        canCollide:true,
        dashing:false,
        collided:false,
        stepsLeft:0,
        detectCollisions:function(){
            var x = self.x;
            var y = self.y;
            var width = self.width;
            var height = self.height;
            self.width += Math.abs(self.x - self.lastX);
            self.height += Math.abs(self.y - self.lastY);
            self.x = (self.x + self.lastX) / 2;
            self.y = (self.y + self.lastY) / 2;
            for(var i = app.floor((self.x - self.width / 2) / 64);i <= app.floor((self.x + self.width / 2) / 64);i++){
                if(i * 64 === self.x + self.width / 2){
                    break;
                }
                for(var j = app.floor((self.y - self.height / 2) / 64);j <= app.floor((self.y + self.height / 2) / 64);j++){
                    if(j * 64 === (self.y + self.height / 2)){
                        break;
                    }
                    if(Collision.list[self.map]){
                        if(Collision.list[self.map][self.z]){
                            if(Collision.list[self.map][self.z][i]){
                                if(Collision.list[self.map][self.z][i][j]){
                                    var collision = Collision.list[self.map][self.z][i][j];
                                    for(var k in collision){
                                        if(self.isColliding(collision[k])){
                                            self.x = x;
                                            self.y = y;
                                            self.width = width;
                                            self.height = height;
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            self.x = x;
            self.y = y;
            self.width = width;
            self.height = height;
            return false;
        },
        getCollisions:function(){
            var collisions = [];
            var x = self.x;
            var y = self.y;
            var width = self.width;
            var height = self.height;
            self.width += Math.abs(self.x - self.lastX);
            self.height += Math.abs(self.y - self.lastY);
            self.x = (self.x + self.lastX) / 2;
            self.y = (self.y + self.lastY) / 2;
            for(var i = app.floor((self.x - self.width / 2 - 1) / 64);i <= app.floor((self.x + self.width / 2) / 64);i++){
                for(var j = app.floor((self.y - self.height / 2 - 1) / 64);j <= app.floor((self.y + self.height / 2) / 64);j++){
                    if(Collision.list[self.map]){
                        if(Collision.list[self.map][self.z]){
                            if(Collision.list[self.map][self.z][i]){
                                if(Collision.list[self.map][self.z][i][j]){
                                    var collision = Collision.list[self.map][self.z][i][j];
                                    for(var k in collision){
                                        collisions.push(collision[k]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            self.x = x;
            self.y = y;
            self.width = width;
            self.height = height;
            return collisions;
        },
        onCollide:function(x,y){

        },
        updateMove:function(speed){
            self.rig.stepsLeft = speed;
            var moveStartX = self.x;
            var moveStartY = self.y;
            self.rig.collided = false;
            if(self.rig.canMove){
                while(self.rig.stepsLeft > 0){
                    self.ai.updateMove();
                    var startStepsLeft = self.rig.stepsLeft;
                    if(self.rig.dashing){
                        self.rig.stepsLeft -= 1;
                    }
                    else{
                        if(self.spdX !== 0 && self.spdY !== 0){
                            var minSpeed = Math.min(Math.min(Math.abs(self.spdX),Math.abs(self.spdY)),self.rig.stepsLeft);
                            if(self.spdX > 0){
                                self.spdX = minSpeed;
                            }   
                            else if(self.spdX < 0){
                                self.spdX = -minSpeed;
                            }
                            if(self.spdY > 0){
                                self.spdY = minSpeed;
                            }
                            else if(self.spdY < 0){
                                self.spdY = -minSpeed;
                            }
                            self.rig.stepsLeft -= minSpeed;
                        }
                        else{
                            var maxSpeed = Math.min(Math.max(Math.abs(self.spdX),Math.abs(self.spdY)),self.rig.stepsLeft);
                            if(self.spdX > 0){
                                self.spdX = maxSpeed;
                            }   
                            else if(self.spdX < 0){
                                self.spdX = -maxSpeed;
                            }
                            if(self.spdY > 0){
                                self.spdY = maxSpeed;
                            }
                            else if(self.spdY < 0){
                                self.spdY = -maxSpeed;
                            }
                            self.rig.stepsLeft -= maxSpeed;
                        }
                    }
                    if(self.rig.stepsLeft === startStepsLeft){
                        break;
                    }
                    self.updatePosition();
                    self.updateGridPosition();
                    if(self.rig.detectCollisions()){
                        self.x = self.lastX;
                        self.y = self.lastY;
                        if(self.spdX > 0){
                            self.spdX = 1;
                        }
                        else if(self.spdX < 0){
                            self.spdX = -1;
                        }
                        else{
                            self.spdX = 0;
                        }
                        if(self.spdY > 0){
                            self.spdY = 1;
                        }
                        else if(self.spdY < 0){
                            self.spdY = -1;
                        }
                        else{
                            self.spdY = 0;
                        }
                        var stepsToTake = startStepsLeft - self.rig.stepsLeft;
                        while(stepsToTake > 0){
                            self.updatePosition();
                            self.updateGridPosition();
                            if(self.rig.detectCollisions()){
                                var collisions = self.rig.getCollisions();
                                var x1 = self.x;
                                self.x = self.lastX;
                                var colliding = false;
                                for(var i in collisions){
                                    if(self.isColliding(collisions[i])){
                                        colliding = true;
                                    }
                                }
                                if(colliding){
                                    self.x = x1;
                                    self.y = self.lastY;
                                    colliding = false;
                                    for(var i in collisions){
                                        if(self.isColliding(collisions[i])){
                                            colliding = true;
                                        }
                                    }
                                    if(colliding){
                                        self.x = self.lastX;
                                        self.rig.onCollide(true,true);
                                        stepsToTake = 0;
                                        self.rig.stepsLeft = 0;
                                    }
                                    else{
                                        self.rig.onCollide(false,true);
                                    }
                                }
                                else{
                                    self.rig.onCollide(true,false);
                                }
                            }
                            stepsToTake -= 1;
                        }
                    }
                }
            }
            self.spdX = self.x - moveStartX;
            self.spdY = self.y - moveStartY;
        },
    };
    self.ai = {
        path:[],
        trackPos:function(x,y){
            var trackSize = 16;
            var gridOffsetX = Math.floor(self.x / 64 - (self.width / 64 - 1) / 2) - trackSize;
            var gridOffsetY = Math.floor(self.y / 64 - (self.height / 64 - 1) / 2) - trackSize;
            var targetX = Math.floor(x / 64) - gridOffsetX;
            var targetY = Math.floor(y / 64) - gridOffsetY;
            var pathfinder = new pathfinding.BiAStarFinder({
                allowDiagonal:true,
                dontCrossCorners:true,
            });
            var grid = new pathfinding.Grid(trackSize * 2 + 1,trackSize * 2 + 1);
            for(var i = 0;i < size;i++){
                for(var j = 0;j < size;j++){
                    var setCollision = function(){
                        for(var k = -Math.round(self.width / 64) + 1;k < 1;k++){
                            for(var l = -Math.round(self.height / 64) + 1;l < 1;l++){
                                if(i + k >= 0 && i + k < size && j + l >= 0 && j + l < size){
                                    grid.setWalkableAt(i + k,j + l,false);
                                }
                            }
                        }
                    }
                    if(Collision.list[self.map]){
                        if(Collision.list[self.map][self.zindex]){
                            if(Collision.list[self.map][self.zindex][gridOffsetX + i]){
                                if(Collision.list[self.map][self.zindex][gridOffsetX + i][gridOffsetY + j]){
                                    setCollision();
                                }
                            }
                        }
                    }
                }
            }
            if(targetX < size && targetX > 0 && ty < size && ty > 0){
                var path = finder.findPath(nx,ny,targetX,ty,grid);
                if(path[0]){
                    self.trackingPath = PF.Util.compressPath(path);
                    for(var i in self.trackingPath){
                        self.trackingPath[i][0] += dx;
                        self.trackingPath[i][1] += dy;
                    }
                    self.trackingPath.shift();
                }
            }
        },
        updateMove:function(){

        },
    };
    return self;
}

Actor = function(param){
    var self = Rig(param);
    self.drawSize = param.drawSize !== undefined ? param.drawSize : 64;
    self.changeSize = function(){
        self.width = self.drawSize;
        self.height = self.drawSize;
    }
    self.changeSize();

    self.animation = {
        animate:param.animate !== undefined ? param.animate : true,
        animationStage:0,
        animationDirection:'down',
        updateAnimation:function(spdX,spdY){
            if(!self.animation.animate){
                return;
            }
            if(spdY >= 1){
                self.animation.animationDirection = 'down';
            }
            else if(spdY <= -1){
                self.animation.animationDirection = 'up';
            }
            else if(spdX >= 1){
                self.animation.animationDirection = 'right';
            }
            else if(spdX <= -1){
                self.animation.animationDirection = 'left';
            }
            else{
                if(self.direction <= 45){
                    self.animation.animationDirection = 'right';
                }
                else if(self.direction <= 135){
                    self.animation.animationDirection = 'up';
                }
                else if(self.direction <= 225){
                    self.animation.animationDirection = 'left';
                }
                else if(self.direction <= 315){
                    self.animation.animationDirection = 'down';
                }
                else{
                    self.animation.animationDirection = 'right';
                }
                self.animation.animationStage = -1;
            }
            if(self.canMove === false){
                self.animation.animationStage = -1;
            }
            if(self.animation.animationStage === -1){
                self.animation.animationStage = 0;
            }
            else{
                self.animation.animationStage += 0.5;
                if(self.animation.animationStage >= 4){
                    self.animation.animationStage = 0;
                }
            }
        },
    };

    self.image = {
        body:'Human',
        hat:'Hat_1 Red',
    };

    self.speed = 10;
    
    var getInitPack = self.getInitPack;
    self.getInitPack = function(){
        var pack = getInitPack();
        var animation = {};
        animation.animate = self.animation.animate;
        animation.animationStage = self.animation.animationStage;
        animation.animationDirection = self.animation.animationDirection;
        pack.animation = animation;
        pack.image = self.image;
        return pack;
    }

    return self;
}

Player = function(param){
    var self = Actor(param);

    self.id = param.username;
    self.socket = param.socket;

    self.keys = {
        up:false,
        down:false,
        left:false,
        right:false,
        leftClick:false,
        rightClick:false,
    };

    self.type = 'Player';

    self.update = function(){
        self.rig.updateMove(self.speed);
        self.animation.updateAnimation(self.spdX,self.spdY);
        self.updateAttacks();
    }

    self.updateAttacks = function(){
        if(self.keys.leftClick === true){
            new Projectile({
                x:self.x,
                y:self.y,
                width:10,
                height:10,
                direction:0,
                speed:10,
            });
        }
    }

    var aiUpdateMove = self.ai.updateMove;
    self.ai.updateMove = function(){
        if(self.keys.up){
            self.spdY = -1;
        }
        else if(self.keys.down){
            self.spdY = 1;
        }
        else{
            self.spdY = 0;
        }
        if(self.keys.left){
            self.spdX = -1;
        }
        else if(self.keys.right){
            self.spdX = 1;
        }
        else{
            self.spdX = 0;
        }
        aiUpdateMove();
    }

    self.socket.on('keyPress',function(data){
        if(self.keys[data] !== undefined){
            self.keys[data] = true;
        }
    });
    self.socket.on('keyRelease',function(data){
        if(self.keys[data] !== undefined){
            self.keys[data] = false;
        }
    });

    var getInitPack = self.getInitPack;
    self.getInitPack = function(){
        var pack = getInitPack();
        pack.type = self.type;
        return pack;
    }
    Player.list[self.id] = self;
    return self;
}
Player.list = [];

Monster = function(param){
    var self = Actor(param);

    self.type = 'Monster';

    self.update = function(){
        self.ai.updateTarget();
        self.rig.updateMove(self.speed);
        self.animation.updateAnimation(self.spdX,self.spdY);
    }

    self.ai.targetId = null;
    self.ai.targetType = null;

    self.ai.aggroRange = 8;

    self.ai.updateTarget = function(){
        if(self.ai.targetId !== null){
            var target = null;
            if(self.ai.targetType === 'Player'){
                if(Player.list[self.ai.targetId]){
                    target = Player.list[self.ai.targetId];
                }
            }
            else if(self.ai.targetType === 'Monster'){
                if(Monster.list[self.ai.targetId]){
                    target = Monster.list[self.ai.targetId];
                }
            }
            if(target === null){
                self.ai.targetId = null;
                self.ai.targetType = null;
                return;
            }
            else{

            }
        }
        else{
            for(var i in Player.list){
                if(self.getSquareDistance(Player.list[i]) < self.ai.aggroRange * 64){
                    self.ai.targetId = i;
                    self.ai.targetType = Player.list[i].type;
                    return;
                }
            }
        }
    }

    var getInitPack = self.getInitPack;
    self.getInitPack = function(){
        var pack = getInitPack();
        pack.type = self.type;
        return pack;
    }
    Monster.list[self.id] = self;
    return self;
}
Monster.list = [];

new Monster({
    x:-150,
    y:-150,
});

Projectile = function(param){
    var self = Entity(param);
    self.speed = param.speed;
    self.spdX = Math.cos(self.direction / 180 * Math.PI) * self.speed;
    self.spdY = Math.sin(self.direction / 180 * Math.PI) * self.speed;
    self.update = function(){
        self.updatePosition();
        self.updateGridPosition();
    }
    Projectile.list[self.id] = self;
    return self;
}
Projectile.list = {};