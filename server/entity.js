
var PF = require('pathfinding');
const { setFlagsFromString } = require('v8');

addToChat = function(style,message,debug){
    var d = new Date();
    var m = '' + d.getMinutes();
    var h = d.getHours() + 24;
    if(SERVER !== 'localhost'){
        h -= 4;
    }
    h = h % 24;
    h = '' + h;
    if(m.length === 1){
        m = '' + 0 + m;
    }
    if(m === '0'){
        m = '00';
    }
    console.error("[" + h + ":" + m + "] " + message);
    // for(var i in Player.list){
    //     SOCKET_LIST[i].emit('addToChat',{
    //         style:style,
    //         message:message,
    //         debug:debug,
    //     });
    // }
}

var playerMap = {};

tiles = [];

var monsterData = require('./../client/data/monsters.json');
var projectileData = require('./../client/data/projectiles.json');

spawnMonster = function(spawner,spawnId){
    var monster = new Monster({
        spawnId:spawnId,
        x:spawner.x,
        y:spawner.y,
        map:spawner.map,
        monsterType:spawner.spawnId,
        onDeath:function(pt){
            if(pt.spawnId){
                Spawner.list[pt.spawnId].spawned = false;
            }
            for(var i in Projectile.list){
                if(Projectile.list[i].parent === pt.id){
                    Projectile.list[i].toRemove = true;
                }
            }
        },
    });
    spawner.spawned = true;
}

Entity = function(param){
    var self = {};
    self.id = Math.random();
    self.x = 0;
    self.y = 0;
    self.width = 0;
    self.heigth = 0;
    self.direction = 0;
    self.spdX = 0;
    self.spdY = 0;
    self.map = 'World';
    self.toRemove = false;
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
    }
    self.update = function(){
        self.updatePosition();
    }
    self.updatePosition = function(){
        self.x += Math.round(self.spdX);
        self.y += Math.round(self.spdY);
    }
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
    }
    self.isColliding = function(pt){
        if(pt.map !== self.map){
            return false;
        }
        if(self.type !== 'Projectile' && pt.type !== 'Projectile'){
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
        if(self.type !== 'Projectile'){
            var vertices = [
                {x:self.x + self.width / 2,y:self.y + self.height / 2},
                {x:self.x + self.width / 2,y:self.y - self.height / 2},
                {x:self.x - self.width / 2,y:self.y + self.height / 2},
                {x:self.x - self.width / 2,y:self.y - self.height / 2},
            ];
        }
        else{
            var vertices = [
                {x:(self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
                {x:(self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (-self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (-self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
                {x:(-self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(-self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
                {x:(-self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (-self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(-self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (-self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
            ];
        }

        var axis = { 
           x:1,
           y:0,
        }
        var axis2 = {
            x:0,
            y:1,
        }

        var vectorDotProduct = function(pt1,pt2){
            return (pt1.x * pt2.x) + (pt1.y * pt2.y);
        }

        var p1min = vectorDotProduct(axis,vertices[0]);
        var p1max = p1min;

        for (var i = 1;i < vertices.length;i++){
            var dot = vertices[i];
            p1min = Math.min(p1min,vectorDotProduct(axis,dot));
            p1max = Math.max(p1max,vectorDotProduct(axis,dot));
        }

        if(pt.type !== 'Projectile'){
            var vertices2 = [
                {x:pt.x + pt.width / 2,y:pt.y + pt.height / 2},
                {x:pt.x + pt.width / 2,y:pt.y - pt.height / 2},
                {x:pt.x - pt.width / 2,y:pt.y + pt.height / 2},
                {x:pt.x - pt.width / 2,y:pt.y - pt.height / 2},
            ];
        }
        else{
            var vertices2 = [
                {x:(pt.width / 2) * Math.cos(pt.direction / 180 * Math.PI) - (pt.height / 2) * Math.sin(pt.direction / 180 * Math.PI) + pt.x,y:(pt.width / 2) * Math.sin(pt.direction / 180 * Math.PI) + (pt.height / 2) * Math.cos(pt.direction / 180 * Math.PI) + pt.y},
                {x:(pt.width / 2) * Math.cos(pt.direction / 180 * Math.PI) - (-pt.height / 2) * Math.sin(pt.direction / 180 * Math.PI) + pt.x,y:(pt.width / 2) * Math.sin(pt.direction / 180 * Math.PI) + (-pt.height / 2) * Math.cos(pt.direction / 180 * Math.PI) + pt.y},
                {x:(-pt.width / 2) * Math.cos(pt.direction / 180 * Math.PI) - (pt.height / 2) * Math.sin(pt.direction / 180 * Math.PI) + pt.x,y:(-pt.width / 2) * Math.sin(pt.direction / 180 * Math.PI) + (pt.height / 2) * Math.cos(pt.direction / 180 * Math.PI) + pt.y},
                {x:(-pt.width / 2) * Math.cos(pt.direction / 180 * Math.PI) - (-pt.height / 2) * Math.sin(pt.direction / 180 * Math.PI) + pt.x,y:(-pt.width / 2) * Math.sin(pt.direction / 180 * Math.PI) + (-pt.height / 2) * Math.cos(pt.direction / 180 * Math.PI) + pt.y},
            ];
            axis3 = {
                x:Math.sin(pt.direction / 180 * Math.PI),
                y:-Math.cos(pt.direction / 180 * Math.PI),
            }
            axis4 = {
                x:Math.sin((pt.direction - 90) / 180 * Math.PI),
                y:-Math.cos((pt.direction - 90) / 180 * Math.PI),
            }
        }

        var p2min = vectorDotProduct(axis,vertices2[0]);
        var p2max = p2min;
        for (var i = 1;i < vertices2.length;i++){
            var dot = vertices2[i];
            p2min = Math.min(p2min,vectorDotProduct(axis,dot));
            p2max = Math.max(p2max,vectorDotProduct(axis,dot));
        }

        if(p1min >= p2max){
            return false;
        }
        if(p2min >= p1max){
            return false;
        }

        var p1min = vectorDotProduct(axis2,vertices[0]);
        var p1max = p1min;

        for (var i = 1;i < vertices.length;i++){
            var dot = vertices[i];
            p1min = Math.min(p1min,vectorDotProduct(axis2,dot));
            p1max = Math.max(p1max,vectorDotProduct(axis2,dot));
        }
        var p2min = vectorDotProduct(axis2,vertices2[0]);
        var p2max = p2min;
        for (var i = 1;i < vertices2.length;i++){
            var dot = vertices2[i];
            p2min = Math.min(p2min,vectorDotProduct(axis2,dot));
            p2max = Math.max(p2max,vectorDotProduct(axis2,dot));
        }

        if(p1min >= p2max){
            return false;
        }
        if(p2min >= p1max){
            return false;
        }
        
        if(axis3 === undefined){
            return true;
        }

        var p1min = vectorDotProduct(axis3,vertices[0]);
        var p1max = p1min;

        for (var i = 1;i < vertices.length;i++){
            var dot = vertices[i];
            p1min = Math.min(p1min,vectorDotProduct(axis3,dot));
            p1max = Math.max(p1max,vectorDotProduct(axis3,dot));
        }
        var p2min = vectorDotProduct(axis3,vertices2[0]);
        var p2max = p2min;
        for (var i = 1;i < vertices2.length;i++){
            var dot = vertices2[i];
            p2min = Math.min(p2min,vectorDotProduct(axis3,dot));
            p2max = Math.max(p2max,vectorDotProduct(axis3,dot));
        }

        if(p1min >= p2max){
            return false;
        }
        if(p2min >= p1max){
            return false;
        }

        var p1min = vectorDotProduct(axis4,vertices[0]);
        var p1max = p1min;

        for (var i = 1;i < vertices.length;i++){
            var dot = vertices[i];
            p1min = Math.min(p1min,vectorDotProduct(axis4,dot));
            p1max = Math.max(p1max,vectorDotProduct(axis4,dot));
        }
        var p2min = vectorDotProduct(axis4,vertices2[0]);
        var p2max = p2min;
        for (var i = 1;i < vertices2.length;i++){
            var dot = vertices2[i];
            p2min = Math.min(p2min,vectorDotProduct(axis4,dot));
            p2max = Math.max(p2max,vectorDotProduct(axis4,dot));
        }

        if(p1min >= p2max){
            return false;
        }
        if(p2min >= p1max){
            return false;
        }
        return true;
    }
    return self;
}

require('./collision');

Actor = function(param){
    var self = Entity(param);
    self.hp = 0;
    self.hpMax = 0;
    self.stats = {
        damage:1,
        defense:0,
        heal:0,
    };

    self.animate = true;
    self.animation = 0;
    self.animationDirection = "down";

    self.invincible = false;
    self.mapChange = 11;
    self.transporter = null;
    self.canMove = true;

    self.trackingEntity = null;
    self.trackingPos = {x:null,y:null};
    self.trackingPath = [];
    self.trackDistance = 0;
    self.trackCircleDirection = 1;
    self.trackTime = 100;

    self.drawSize = 'medium';

    self.name = 'null';

    self.maxSpeed = 10;
    self.moveSpeed = 10;

    self.randomPos = {
        walking:false,
        waypoint:false,
        currentWaypoint:null,
        waypointAttemptTime:0,
        x:0,
        y:0,
        directionX:0,
        directionY:0,
        timeX:0,
        timeY:0,
        walkTimeX:100,
        walkTimeY:100,
        waitTimeX:60,
        waitTimeY:60,
    };

    self.justCollided = false;

    if(param.onDeath){
        self.onDeath = param.onDeath;
    }
    else{
        self.onDeath = function(pt){
            for(var i in Projectile.list){
                if(Projectile.list[i].parent === pt.id){
                    Projectile.list[i].toRemove = true;
                }
            }
        }
    }
    self.updateMove = function(){
        self.lastX = self.x;
        self.lastY = self.y;
        if(self.trackingEntity){
            self.spdX = 0;
            self.spdY = 0;
            if(self.getDistance(self.trackingEntity) > self.trackDistance * 1.2){
                var size = 33;
                var dx = Math.floor(self.x / 64) - size / 2 + 0.5;
                var dy = Math.floor(self.y / 64) - size / 2 + 0.5;
                var trackX = Math.floor(self.trackingEntity.x / 64) - dx;
                var trackY = Math.floor(self.trackingEntity.y / 64) - dy;
                self.trackTime += 1;
                if(trackX !== self.trackingPos.x || trackY !== self.trackingPos.y){
                    if(self.trackTime > 50 + 50 * Math.random()){
                        self.trackTime = 0;
                        self.trackingPos.x = trackX;
                        self.trackingPos.y = trackY;
                        var finder = new PF.BiAStarFinder({
                            allowDiagonal:true,
                            dontCrossCorners:true,
                        });
                        var grid = new PF.Grid(size,size);
                        for(var i = 0;i < size;i++){
                            for(var j = 0;j < size;j++){
                                var x = dx * 64 + i * 64;
                                var y = dy * 64 + j * 64;
                                if(Collision.list[self.map + ':' + x + ':' + y + ':']){
                                    grid.setWalkableAt(i,j,false);
                                }
                            }
                        }
                        var nx = Math.floor(self.x / 64) - dx;
                        var ny = Math.floor(self.y / 64) - dy;
                        if(nx < size && nx > 0 && ny < size && ny > 0 && trackX < size && trackX > 0 && trackY < size && trackY > 0){
                            var path = finder.findPath(nx,ny,trackX,trackY,grid);
                            if(path[0]){
                                self.trackingPath = PF.Util.compressPath(path);
                                for(var i in self.trackingPath){
                                    self.trackingPath[i][0] += dx;
                                    self.trackingPath[i][1] += dy;
                                }
                                self.trackingPath.shift();
                            }
                        }
                    }
                }
                if(self.trackingPath[0]){
                    if(self.x / 64 < self.trackingPath[0][0] + 0.5){
                        self.spdX = 1;
                    }
                    if(self.x / 64 > self.trackingPath[0][0] + 0.5){
                        self.spdX = -1;
                    }
                    if(self.y / 64 < self.trackingPath[0][1] + 0.5){
                        self.spdY = 1;
                    }
                    if(self.y / 64 > self.trackingPath[0][1] + 0.5){
                        self.spdY = -1;
                    }
                    if(64 * Math.abs(self.x / 64 - self.trackingPath[0][0] - 0.5) < 2 && 64 * Math.abs(self.y / 64 - self.trackingPath[0][1] - 0.5) < 2){
                        self.trackingPath.shift();
                    }
                }
            }
            else if(self.trackDistance !== 0){
                var angle = Math.atan2(self.y - self.trackingEntity.y,self.x - self.trackingEntity.x);
                self.spdX = -Math.sin(angle);
                self.spdY = Math.cos(angle);
                if(self.justCollided === true){
                    self.trackCircleDirection *= -1;
                }
                self.spdX *= self.trackCircleDirection;
                self.spdY *= self.trackCircleDirection;
                self.spdX += Math.cos(angle) * (self.trackDistance - self.getDistance(self.trackingEntity)) / self.trackDistance * 2;
                self.spdY += Math.sin(angle) * (self.trackDistance - self.getDistance(self.trackingEntity)) / self.trackDistance * 2;
                if(self.randomPos.walking){
                    if(self.randomPos.waypoint){
                        if(self.randomPos.currentWaypoint){
                            self.randomPos.currentWaypoint = null;
                            self.trackingEntity = undefined;
                            self.randomPos.waypointAttemptTime = 0;
                            self.spdX = 0;
                            self.spdY = 0;
                        }
                    }
                }
            }
        }
        if(self.randomPos.walking){
            if(self.randomPos.waypoint){
                if(self.randomPos.currentWaypoint){
                    if(self.randomPos.waypointAttemptTime > 1200){
                        self.randomPos.currentWaypoint = undefined;
                        self.trackingEntity = undefined;
                        self.randomPos.waypointAttemptTime = 0;
                        self.spdX = 0;
                        self.spdY = 0;
                    }
                    else if(self.randomPos.currentWaypoint.map !== self.map){
                        self.randomPos.currentWaypoint = undefined;
                        self.trackingEntity = undefined;
                        self.randomPos.waypointAttemptTime = 0;
                        self.spdX = 0;
                        self.spdY = 0;
                    }
                }
                else{
                    if(self.randomPos.waypointAttemptTime > 60 + Math.random() * 60){
                        var waypoints = [];
                        for(var i in WayPoint.list){
                            if(WayPoint.list[i].info.id === self.id && WayPoint.list[i].map === self.map && WayPoint.list[i].x > self.x - 14 * 64 && WayPoint.list[i].x < self.x + 14 * 64 && WayPoint.list[i].y > self.y - 14 * 64 && WayPoint.list[i].y < self.y + 14 * 64){
                                waypoints.push(WayPoint.list[i]);
                            }
                        }
                        self.randomPos.currentWaypoint = waypoints[Math.floor(Math.random() * waypoints.length)];
                        self.trackEntity(self.randomPos.currentWaypoint,0);
                    }
                }
                self.randomPos.waypointAttemptTime += 1;
            }
            else if(self.trackingEntity === undefined){
                if(self.spdX === 0 && self.randomPos.timeX > self.randomPos.walkTimeX){
                    self.spdX = Math.round(Math.random() * 2 - 1);
                    self.randomPos.timeX = 0;
                    self.randomPos.waitTimeX = 30 * Math.random() + 30;
                }
                else if(self.spdX !== 0 && self.randomPos.timeX > self.randomPos.waitTimeX){
                    self.spdX = 0;
                    self.randomPos.timeX = 0;
                    self.randomPos.walkTimeX = 50 * Math.random() + 50;
                }
                if(self.spdY === 0 && self.randomPos.timeY > self.randomPos.walkTimeY){
                    self.spdY = Math.round(Math.random() * 2 - 1);
                    self.randomPos.timeY = 0;
                    self.randomPos.waitTimeY = 30 * Math.random() + 30;
                }
                else if(self.spdY !== 0 && self.randomPos.timeY > self.randomPos.waitTimeY){
                    self.spdY = 0;
                    self.randomPos.timeY = 0;
                    self.randomPos.walkTimeY = 50 * Math.random() + 50;
                }
                self.randomPos.timeX += 1;
                self.randomPos.timeY += 1;
                if(Math.abs(self.x - self.randomPos.x) > 256){
                    self.spdX = -1 * Math.abs(self.x - self.randomPos.x) / (self.x - self.randomPos.x);
                }
                if(Math.abs(self.y - self.randomPos.y) > 256){
                    self.spdY = -1 * Math.abs(self.y - self.randomPos.y) / (self.y - self.randomPos.y);
                }
            }
        }
        // if(self.pushPt !== undefined && self.invincible === false){
        //     var pushPower = self.pushPt.pushPower * (Math.random() + 1);
        //     if(pushPower !== 0){
        //         self.moveSpeed = pushPower * 5 * (1 - self.pushResist);
        //         self.spdX += self.pushPt.spdX / 6 * (1 - self.pushResist);
        //         self.spdY += self.pushPt.spdY / 6 * (1 - self.pushResist);
        //         if(self.x > self.pushPt.x){
        //             self.spdX += 1 * (1 - self.pushResist);
        //         }
        //         else if(self.x < self.pushPt.x){
        //             self.spdX += -1 * (1 - self.pushResist);
        //         }
        //         else{
        //             self.spdX += 0;
        //         }
        //         if(self.y > self.pushPt.y){
        //             self.spdY += 1 * (1 - self.pushResist);
        //         }
        //         else if(self.y < self.pushPt.y){
        //             self.spdY += -1 * (1 - self.pushResist);
        //         }
        //         else{
        //             self.spdY += 0;
        //         }
        //         if(self.pushResist === 1){
        //             self.moveSpeed = self.maxSpeed;
        //         }
        //     }
        //     if(pushPower === 0){
        //         self.dazed = 0;
        //     }
        // }
        self.justCollided = false;
    }
    self.trackEntity = function(pt,distance){
        self.trackingEntity = pt;
        self.trackingPath = [];
        self.trackDistance = distance;
        self.trackingPos = {x:undefined,y:undefined};
        self.trackCircleDirection = 1;
    }
    self.randomWalk = function(walking,waypoint){
        self.randomPos.walking = walking;
        self.randomPos.waypoint = waypoint;
        self.randomPos.x = self.x;
        self.randomPos.y = self.y;
    }
    self.updateAnimation = function(){
        if(!self.animate){
            return;
        }
        if(self.spdY >= 0.1){
            self.animationDirection = "down";
        }
        else if(self.spdY <= -0.1){
            self.animationDirection = "up";
        }
        else if(self.spdX >= 0.1){
            self.animationDirection = "right";
        }
        else if(self.spdX <= -0.1){
            self.animationDirection = "left";
        }
        else{
            self.animation = -1;
        }
        if(self.animation === -1){
            self.animation = 0;
        }
        else{
            self.animation += 0.5;
            if(self.animation >= 4){
                self.animation = 0;
            }
        }
    }
    self.updateCollisions = function(){
        for(var i = -1;i < 2;i++){
            for(var j = -1;j < 2;j++){
                if(Transporter.list[self.map + ":" + Math.round((self.x - 64) / 64 + i) * 64 + ":" + Math.round((self.y - 64) / 64 + j) * 64 + ":"] && self.canMove){
                    var direction = Transporter.list[self.map + ":" + Math.round((self.x - 64) / 64 + i) * 64 + ":" + Math.round((self.y - 64) / 64 + j) * 64 + ":"].teleportdirection;
                    if(direction === "up" && self.spdY < 0){
                        self.doTransport(Transporter.list[self.map + ":" + Math.round((self.x - 64) / 64 + i) * 64 + ":" + Math.round((self.y - 64) / 64 + j) * 64 + ":"]);
                    }
                    if(direction === "down" && self.spdY > 0){
                        self.doTransport(Transporter.list[self.map + ":" + Math.round((self.x - 64) / 64 + i) * 64 + ":" + Math.round((self.y - 64) / 64 + j) * 64 + ":"]);
                    }
                    if(direction === "left" && self.spdX < 0){
                        self.doTransport(Transporter.list[self.map + ":" + Math.round((self.x - 64) / 64 + i) * 64 + ":" + Math.round((self.y - 64) / 64 + j) * 64 + ":"]);
                    }
                    if(direction === "right" && self.spdX > 0){
                        self.doTransport(Transporter.list[self.map + ":" + Math.round((self.x - 64) / 64 + i) * 64 + ":" + Math.round((self.y - 64) / 64 + j) * 64 + ":"]);
                    }
                }
            }
        }
        if(self.canCollide === false){
            return;
        }
        for(var i = -1;i < 2;i++){
            for(var j = -1;j < 2;j++){
                if(Collision.list[self.map + ':' + (Math.round((self.x + i * 64) / 64) * 64) + ':' + (Math.round((self.y + j * 64) / 64) * 64) + ':'] !== undefined){
                    for(var k in Collision.list[self.map + ':' + (Math.round((self.x + i * 64) / 64) * 64) + ':' + (Math.round((self.y + j * 64) / 64) * 64) + ':']){
                        if(Collision.list[self.map + ':' + (Math.round((self.x + i * 64) / 64) * 64) + ':' + (Math.round((self.y + j * 64) / 64) * 64) + ':'] !== undefined){
                            self.doCollision(Collision.list[self.map + ':' + (Math.round((self.x + i * 64) / 64) * 64) + ':' + (Math.round((self.y + j * 64) / 64) * 64) + ':'][k]);
                        }
                    }
                }
            }
        }
    }
    self.doCollision = function(collision){
        if(!collision){
            return;
        }
        if(self.isColliding(collision)){
            self.justCollided = true;
            var x1 = self.lastX + self.spdX;
            self.x = self.lastX;
            if(self.isColliding(collision)){
                self.x = x1;
                self.y = self.lastY;
                if(self.isColliding(collision)){
                    self.x = self.lastX;
                    self.y = self.lastY;
                }
                else{
                    var colliding = false;
                    for(var i in Collision.list[collision.map + ':' + (Math.round((collision.x) / 64) * 64) + ':' + (Math.round((collision.y) / 64) * 64) + ':']){
                        if(Collision.list[collision.map + ':' + (Math.round((collision.x) / 64) * 64) + ':' + (Math.round((collision.y) / 64) * 64) + ':'][i] !== undefined){
                            if(self.isColliding(Collision.list[collision.map + ':' + (Math.round((collision.x) / 64) * 64) + ':' + (Math.round((collision.y) / 64) * 64) + ':'][i])){
                                colliding = true;
                            }
                        }
                    }
                    if(colliding){
                        self.x = self.lastX;
                        self.y = self.lastY;
                    }
                }
            }
            else{
                var colliding = false;
                for(var i in Collision.list[collision.map + ':' + (Math.round((collision.x) / 64) * 64) + ':' + (Math.round((collision.y) / 64) * 64) + ':']){
                    if(Collision.list[collision.map + ':' + (Math.round((collision.x) / 64) * 64) + ':' + (Math.round((collision.y) / 64) * 64) + ':'][i] !== undefined){
                        if(self.isColliding(Collision.list[collision.map + ':' + (Math.round((collision.x) / 64) * 64) + ':' + (Math.round((collision.y) / 64) * 64) + ':'][i])){
                            colliding = true;
                        }
                    }
                }
                if(colliding){
                    self.x = x1;
                    self.y = self.lastY;
                    if(self.isColliding(collision)){
                        self.x = self.lastX;
                        self.y = self.lastY;
                    }
                    else{
                        var colliding = false;
                        for(var i in Collision.list[collision.map + ':' + (Math.round((collision.x) / 64) * 64) + ':' + (Math.round((collision.y) / 64) * 64) + ':']){
                            if(Collision.list[collision.map + ':' + (Math.round((collision.x) / 64) * 64) + ':' + (Math.round((collision.y) / 64) * 64) + ':'][i] !== undefined){
                                if(self.isColliding(Collision.list[collision.map + ':' + (Math.round((collision.x) / 64) * 64) + ':' + (Math.round((collision.y) / 64) * 64) + ':'][i])){
                                    colliding = true;
                                }
                            }
                        }
                        if(colliding){
                            self.x = self.lastX;
                            self.y = self.lastY;
                        }
                    }
                }
            }
        }
    }
    self.teleport = function(x,y,map){
        if(playerMap[map] === undefined){
            return;
        }
        if(self.mapChange > 10){
            self.invincible = true;
            self.mapChange = -1;
            self.transporter = {
                teleport:map,
                teleportx:x,
                teleporty:y,
            };
        }
    }
    self.doTransport = function(transporter){
        if(self.toRemove){
            return;
        }
        if(self.hp < 1){
            return;
        }
        if(self.isColliding(transporter)){
            self.teleport(transporter.teleportx,transporter.teleporty,transporter.teleport);
        }
    }
    self.onHit = function(pt){

    }
    self.onDamage = function(pt){
        var hp = self.hp;
        self.hp -= Math.max(Math.floor(pt.stats.damage - self.stats.defense),0);
        if(self.hp < 1 && hp > 0){
            self.onDeath(self);
            if(self.type === 'Player'){
                SOCKET_LIST[self.id].emit('death');
            }
            else{
                self.toRemove = true;
            }
        }
        self.onHit(pt);
        if(pt.type === 'Projectile'){
            pt.onHit(self);
        }
    }
    self.shootProjectile = function(projectileType,param){
        var direction = param.direction / 180 * Math.PI || self.direction / 180 * Math.PI;
        var stats = Object.create(self.stats);
        if(param.stats){
            for(var i in param.stats){
                if(stats[i]){
                    stats[i] *= param.stats[i];
                }
            }
        }
        var projectile = new Projectile({
            parent:param.id || self.id,
            x:param.x || self.x + Math.cos(direction) * (param.distance + projectileData[projectileType].width * 2) || self.x + Math.cos(direction) * projectileData[projectileType].width * 2,
            y:param.x || self.y + Math.sin(direction) * (param.distance + projectileData[projectileType].width * 2) || self.y + Math.sin(direction) * projectileData[projectileType].width * 2,
            spdX:Math.cos(direction) * param.speed || Math.cos(direction) * 10,
            spdY:Math.sin(direction) * param.speed || Math.sin(direction) * 10,
            direction:self.direction || param.direction,
            map:self.map,
            stats:stats,
            projectileType:projectileType || 'arrow',
        });
    }
    self.changeSize = function(){
        if(self.drawSize === 'small'){
            self.width = 56;
            self.height = 64;
        }
        else if(self.drawSize === 'medium'){
            self.width = 56;
            self.height = 52;
        }
        else{
            self.width = 112;
            self.height = 112;
        }
    }
    self.updateHp = function(){
        self.hp += self.stats.heal / 20;
        self.hp = Math.min(self.hpMax,self.hp);
    }
    return self;
}

Player = function(param,socket){
    var self = Actor(param);
    self.id = param.id;
    self.keyPress = {
        left:false,
        right:false,
        up:false,
        down:false,
        attack:false,
        second:false,
        heal:false,
    }
    self.keyMap = {
        up:'w',
        down:'s',
        left:'a',
        right:'d',
        attack:'attack',
        second:'second',
        heal:' ',
    };
    self.secondKeyMap = {
        up:'ArrowUp',
        down:'ArrowDown',
        left:'ArrowLeft',
        right:'ArrowRight',
        attack:'attack',
        second:'second',
        heal:'Shift',
    };
    self.thirdKeyMap = {
        up:'W',
        down:'S',
        left:'A',
        right:'D',
        attack:'attack',
        second:'second',
        heal:' ',
    };
    self.img = {
        body:[-1,-1,-1,0.5],
        shirt:[Math.random() * 255,Math.random() * 255,Math.random() * 255,0.5],
        shirtType:'shirtNecklace',
        pants:[Math.random() * 255,Math.random() * 255,Math.random() * 255,0.6],
        hair:[Math.random() * 255,Math.random() * 255,Math.random() * 255,0.5],
        hairType:'vikingHat',
    };
    self.username = param.username;
    self.name = param.username;
    self.changeSize();
    self.x = 32;
    self.y = 32;
    self.type = 'Player';
    self.hp = 100;
    self.hpMax = 100;
    self.stats = {
        damage:5,
        defense:0,
        heal:2,
    }
    self.reload = 0;
    playerMap[self.map] += 1;
    self.onDeath = function(pt){
        for(var i in Projectile.list){
            if(Projectile.list[i].parent === pt.id){
                Projectile.list[i].toRemove = true;
            }
        }
        pt.canMove = false;
        pt.keyPress = {
            left:false,
            right:false,
            up:false,
            down:false,
            attack:false,
            second:false,
            heal:false,
        }
    }
    var lastSelf = {};
    self.update = function(){
        self.mapChange += 1;
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateSpd();
            self.updateMove();
            if(self.canMove){
                self.updatePosition();
            }
            self.updateCollisions();
        }
        self.updateAttack();
        self.updateHp();
        self.updateAnimation();
        if(self.mapChange === 0){
            self.canMove = false;
            socket.emit('changeMap',self.transporter);
        }
        if(self.mapChange === 5){
            var map = self.map;
            playerMap[self.map] -= 1;
            self.map = self.transporter.teleport;
            if(self.transporter.teleportx !== -1){
                self.x = self.transporter.teleportx;
            }
            if(self.transporter.teleporty !== -1){
                self.y = self.transporter.teleporty;
            }
            playerMap[self.map] += 1;
            if(map !== self.map){
                for(var i in Spawner.list){
                    if(Spawner.list[i].map === self.map && Spawner.list[i].spawned === false){
                        spawnMonster(Spawner.list[i],i);
                    }
                }
            }
            Player.getAllInitPack(socket);
            for(var i in Player.list){
                if(Player.list[i].map === self.map){
                    SOCKET_LIST[i].emit('initEntity',self.getInitPack());
                }
            }
        }
        if(self.mapChange === 10){
            self.canMove = true;
            self.invincible = false;
        }
    }
    self.updateSpd = function(){
        self.spdX = 0;
        self.spdY = 0;
        self.lastX = self.x;
        self.lastY = self.y;
        if(self.keyPress.up){
            self.spdY = -1;
        }
        if(self.keyPress.down){
            self.spdY = 1;
        }
        if(self.keyPress.left){
            self.spdX = -1;
        }
        if(self.keyPress.right){
            self.spdX = 1;
        }
        if(self.isDead){
            self.spdX = 0;
            self.spdY = 0;
        }
    }
    self.updateAttack = function(){
        self.reload += 1;
        if(self.keyPress.attack){
            if(self.reload % 5 === 0){
                self.shootProjectile('arrow',{});
            }
        }
    }
    self.getUpdatePack = function(){
        var pack = {};
        pack.id = self.id;
        if(lastSelf.x !== self.x){
            pack.x = self.x;
            lastSelf.x = self.x;
        }
        if(lastSelf.y !== self.y){
            pack.y = self.y;
            lastSelf.y = self.y;
        }
        if(lastSelf.map !== self.map){
            pack.map = self.map;
            lastSelf.map = self.map;
        }
        if(lastSelf.username !== self.username){
            pack.username = self.username;
            lastSelf.username = self.username;
        }
        if(lastSelf.name !== self.name){
            pack.name = self.name;
            lastSelf.name = self.name;
        }
        for(var i in self.img){
            if(lastSelf.img){
                if(lastSelf.img[i]){
                    if(Array.isArray(lastSelf.img[i])){
                        for(var j in lastSelf.img[i]){
                            if(self.img[i][j] !== lastSelf.img[i][j]){
                                pack.img = self.img;
                                lastSelf.img = Object.create(self.img);
                            }
                        }
                    }
                    else{
                        pack.img = self.img;
                        lastSelf.img = Object.create(self.img);
                    }
                }
                else{
                    pack.img = self.img;
                    lastSelf.img = Object.create(self.img);
                }
            }
            else{
                pack.img = self.img;
                lastSelf.img = Object.create(self.img);
            }
        }
        if(lastSelf.animationDirection !== self.animationDirection){
            pack.animationDirection = self.animationDirection;
            lastSelf.animationDirection = self.animationDirection;
        }
        if(lastSelf.animation !== self.animation){
            pack.animation = self.animation;
            lastSelf.animation = self.animation;
        }
        if(lastSelf.direction !== self.direction){
            pack.direction = self.direction;
            lastSelf.direction = self.direction;
        }
        if(lastSelf.hp !== self.hp){
            pack.hp = self.hp;
            lastSelf.hp = self.hp;
        }
        if(lastSelf.hpMax !== self.hpMax){
            pack.hpMax = self.hpMax;
            lastSelf.hpMax = self.hpMax;
        }
        if(lastSelf.drawSize !== self.drawSize){
            pack.drawSize = self.drawSize;
            lastSelf.drawSize = self.drawSize;
        }
        for(var i in self.stats){
            if(lastSelf.stats !== undefined){
                if(lastSelf.stats[i] !== undefined){
                    if(self.stats[i] !== lastSelf.stats[i]){
                        pack.stats = self.stats;
                        lastSelf.stats = Object.create(self.stats);
                    }
                }
                else{
                    pack.stats = self.stats;
                    lastSelf.stats = Object.create(self.stats);
                }
            }
            else{
                pack.stats = self.stats;
                lastSelf.stats = Object.create(self.stats);
            }
        }
        return pack;
    }
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.map = self.map;
        pack.username = self.username;
        pack.name = self.name;
        pack.img = self.img;
        pack.animation = self.animation;
        pack.animationDirection = self.animationDirection;
        pack.direction = self.direction;
        pack.hp = self.hp;
        pack.hpMax = self.hpMax;
        pack.drawSize = self.drawSize;
        pack.stats = self.stats;
        pack.type = self.type;
        return pack;
    }
    Player.list[self.id] = self;
    return self;
}


Player.list = {};

Player.onConnect = function(socket,username){
    getDatabase(username,function(param){
        var player = Player({
            id:socket.id,
            username:username,
            param:param,
        },socket);

        for(var i in SOCKET_LIST){
            if(Player.list[i]){
                if(Player.list[i].map === player.map){
                    SOCKET_LIST[i].emit('initEntity',player.getInitPack());
                }
            }
        }
        socket.emit('selfId',{id:socket.id});

        socket.on('keyPress',function(data){
            if(data.inputId === 'releaseAll'){
                player.keyPress = {
                    up:false,
                    down:false,
                    left:false,
                    right:false,
                    attack:false,
                    second:false,
                    heal:false,
                };
            }
            if(player.hp < 1){
                return;
            }
            if(data.inputId === player.keyMap.left || data.inputId === player.secondKeyMap.left || data.inputId === player.thirdKeyMap.left){
                player.keyPress.left = data.state;
            }
            if(data.inputId === player.keyMap.right || data.inputId === player.secondKeyMap.right || data.inputId === player.thirdKeyMap.right){
                player.keyPress.right = data.state;
            }
            if(data.inputId === player.keyMap.up || data.inputId === player.secondKeyMap.up || data.inputId === player.thirdKeyMap.up){
                player.keyPress.up = data.state;
            }
            if(data.inputId === player.keyMap.down || data.inputId === player.secondKeyMap.down || data.inputId === player.thirdKeyMap.down){
                player.keyPress.down = data.state;
            }
            if(data.inputId === player.keyMap.attack || data.inputId === player.secondKeyMap.attack || data.inputId === player.thirdKeyMap.attack){
                player.keyPress.attack = data.state;
            }
            if(data.inputId === player.keyMap.second || data.inputId === player.secondKeyMap.second || data.inputId === player.thirdKeyMap.second){
                player.keyPress.second = data.state;
            }
            if(data.inputId === player.keyMap.heal || data.inputId === player.secondKeyMap.heal || data.inputId === player.thirdKeyMap.heal){
                player.keyPress.heal = data.state;
            }
            if(data.inputId === 'direction'){
                player.direction = (Math.atan2(data.state.y,data.state.x) / Math.PI * 180);
                player.rawMouseX = data.state.x;
                player.rawMouseY = data.state.y;
                player.mouseX = data.state.x + player.x;
                player.mouseY = data.state.y + player.y;
            }
        });

        socket.on('respawn',function(data){
            if(player.hp > 0){
                addToChat('style="color: #ff0000">',player.name + ' cheated using respawn.');
                Player.onDisconnect(SOCKET_LIST[player.id]);
                return;
            }
            player.hp = Math.round(player.hpMax / 2);
            // player.teleport(ENV.Spawnpoint.x,ENV.Spawnpoint.y,ENV.Spawnpoint.map);
            addToChat('style="color: #00ff00">',player.name + ' respawned.');
        });

        socket.on('init',function(data){
            Player.getAllInitPack(socket);
        });
        Player.getAllInitPack(socket);
        addToChat('style="color: #00ff00">',player.name + " just logged on.");
    });
}
Player.onDisconnect = function(socket){
    for(var i in Projectile.list){
        if(socket && Projectile.list[i].parent === socket.id){
            delete Projectile.list[i];
        }
    }
    if(!socket){
        return;
    }
    storeDatabase(Player.list);
    if(Player.list[socket.id]){
        playerMap[Player.list[socket.id].map] -= 1;
        addToChat('style="color: #ff0000">',Player.list[socket.id].name + " logged off.");
        delete Player.list[socket.id];
    }
}
Player.getAllInitPack = function(socket){
    try{
        var player = Player.list[socket.id];
        if(player){
            var pack = {player:[],projectile:[],monster:[]};
            for(var i in Player.list){
                if(Player.list[i].map === player.map){
                    pack.player.push(Player.list[i].getInitPack());
                }
            }
            for(var i in Projectile.list){
                if(Projectile.list[i].map === player.map){
                    pack.projectile.push(Projectile.list[i].getInitPack());
                }
            }
            for(var i in Monster.list){
                if(Monster.list[i].map === player.map){
                    pack.monster.push(Monster.list[i].getInitPack());
                }
            }
            socket.emit('update',pack);
        }
    }
    catch(err){
        console.error(err);
    }
}

Projectile = function(param){
    var self = Entity(param);
    self.projectileType = param.projectileType;
    self.timer = 40;
    self.parent = param.parent;
    self.type = 'Projectile';
    for(var i in projectileData[self.projectileType]){
        self[i] = projectileData[self.projectileType][i];
    }
    self.width *= 4;
    self.height *= 4;
    self.stats = param.stats;
    self.pierce = 1 || param.pierce;
    self.onHit = function(pt){
        self.pierce -= 1;
        if(self.pierce === 0){
            self.toRemove = true;
        }
    }
    var lastSelf = {};
    self.update = function(){
        self.updatePosition();
        self.updateCollisions();
        self.timer -= 1;
        if(self.timer === 0){
            self.toRemove = true;
        }
    }
    self.updateCollisions = function(){
        if(self.canCollide === false){
            return;
        }
        for(var i = -1;i < 2;i++){
            for(var j = -1;j < 2;j++){
                if(Collision.list[self.map + ':' + (Math.round((self.x + i * 64) / 64) * 64) + ':' + (Math.round((self.y + j * 64) / 64) * 64) + ':']){
                    for(var k in Collision.list[self.map + ':' + (Math.round((self.x + i * 64) / 64) * 64) + ':' + (Math.round((self.y + j * 64) / 64) * 64) + ':']){
                        if(Collision.list[self.map + ':' + (Math.round((self.x + i * 64) / 64) * 64) + ':' + (Math.round((self.y + j * 64) / 64) * 64) + ':'] !== undefined){
                            self.doCollision(Collision.list[self.map + ':' + (Math.round((self.x + i * 64) / 64) * 64) + ':' + (Math.round((self.y + j * 64) / 64) * 64) + ':'][k]);
                        }
                    }
                }
            }
        }
    }
    self.doCollision = function(collision){
        if(!collision){
            return;
        }
        if(collision.info === 'noProjectileCollision'){
            return;
        }
        if(self.isColliding(collision)){
            self.spdX = 0;
            self.spdY = 0;
        }
    }
    self.getUpdatePack = function(){
        var pack = {};
        pack.id = self.id;
        if(lastSelf.x !== self.x){
            pack.x = self.x;
            lastSelf.x = self.x;
        }
        if(lastSelf.y !== self.y){
            pack.y = self.y;
            lastSelf.y = self.y;
        }
        if(lastSelf.width !== self.width){
            pack.width = self.width;
            lastSelf.width = self.width;
        }
        if(lastSelf.height !== self.height){
            pack.height = self.height;
            lastSelf.height = self.height;
        }
        if(lastSelf.direction !== self.direction){
            pack.direction = self.direction;
            lastSelf.direction = self.direction;
        }
        if(lastSelf.projectileType !== self.projectileType){
            pack.projectileType = self.projectileType;
            lastSelf.projectileType = self.projectileType;
        }
        return pack;
    }
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.width = self.width;
        pack.height = self.height;
        pack.direction = self.direction;
        pack.projectileType = self.projectileType;
        return pack;
    }
    Projectile.list[self.id] = self;
    return self;
}
Projectile.list = {};

Monster = function(param){
    var self = Actor(param);
    self.monsterType = param.monsterType;
    for(var i in monsterData[self.monsterType]){
        if(i === 'stats'){
            for(var j in monsterData[self.monsterType][i]){
                self.stats[j] = monsterData[self.monsterType][i][j];
            }
        }
        else{
            self[i] = monsterData[self.monsterType][i];
        }
    }
    self.changeSize();
    self.hp = self.hpMax;
    self.target = null;
    self.type = 'Monster';
    self.aggro = 8;
    self.attackState = 'passive';
    self.attackPhase = 1;
    self.spawnId = param.spawnId;
    self.reload = 0;
    self.randomWalk(true,false);
    var lastSelf = {};
    self.update = function(){
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateMove();
            if(self.canMove){
                self.updatePosition();
            }
            self.updateCollisions();
        }
        self.updateHp();
        self.updateAnimation();
        self.updateTarget();
        self.updateAttack();
    }
    self.updateTarget = function(){
        if(self.target){
            if(Player.list[self.target]){
                if(Player.list[self.target].hp < 1){
                    self.target = null;
                    self.trackingEntity = null;
                    self.spdX = 0;
                    self.spdY = 0;
                }
                else if(Player.list[self.target].map !== self.map){
                    self.target = null;
                    self.trackingEntity = null;
                    self.spdX = 0;
                    self.spdY = 0;
                }
                else{
                    if(self.getDistance(Player.list[self.target]) > self.aggro * 64 * 1.5){
                        self.target = null;
                        self.trackingEntity = null;
                        self.spdX = 0;
                        self.spdY = 0;
                    }
                }
            }
            else{
                self.target = null;
                self.trackingEntity = null;
                self.spdX = 0;
                self.spdY = 0;
            }
        }
        if(self.target === null){
            for(var i in Player.list){
                if(Player.list[i].map === self.map){
                    if(Player.list[i].hp > 0){
                        if(self.getDistance(Player.list[i]) < self.aggro * 64){
                            self.target = i;
                            self.trackEntity(Player.list[i],0);
                        }
                    }
                }
            }
        }
    }
    self.updateAttack = function(){
        if(!self.target){
            self.reload = 0;
            return;
        }
        self.reload += 1;
        self.direction = Math.atan2(Player.list[self.target].y - self.y,Player.list[self.target].x - self.x) / Math.PI * 180;
        switch(self.monsterType){
            case 'skeleton':
                if(self.reload % 20 === 19){
                    self.shootProjectile('bone',{
                        speed:20,
                    });
                }
                break;
            case 'snake':
                if(self.reload % 5 === 4){
                    self.shootProjectile('snakeSpit',{
                        speed:20,
                    });
                }
                break;
            case 'jellyeye':
                if(self.reload % 2 === 0){
                    self.shootProjectile('eye',{
                        direction:self.direction + Math.random() * 20 - 10,
                        speed:35,
                    });
                }
                break;
        }
    }
    self.getUpdatePack = function(){
        var pack = {};
        pack.id = self.id;
        if(lastSelf.x !== self.x){
            pack.x = self.x;
            lastSelf.x = self.x;
        }
        if(lastSelf.y !== self.y){
            pack.y = self.y;
            lastSelf.y = self.y;
        }
        if(lastSelf.width !== self.width){
            pack.width = self.width;
            lastSelf.width = self.width;
        }
        if(lastSelf.height !== self.height){
            pack.height = self.height;
            lastSelf.height = self.height;
        }
        if(lastSelf.map !== self.map){
            pack.map = self.map;
            lastSelf.map = self.map;
        }
        if(lastSelf.animationDirection !== self.animationDirection){
            pack.animationDirection = self.animationDirection;
            lastSelf.animationDirection = self.animationDirection;
        }
        if(lastSelf.animation !== self.animation){
            pack.animation = self.animation;
            lastSelf.animation = self.animation;
        }
        if(lastSelf.direction !== self.direction){
            pack.direction = self.direction;
            lastSelf.direction = self.direction;
        }
        if(lastSelf.hp !== self.hp){
            pack.hp = self.hp;
            lastSelf.hp = self.hp;
        }
        if(lastSelf.hpMax !== self.hpMax){
            pack.hpMax = self.hpMax;
            lastSelf.hpMax = self.hpMax;
        }
        if(lastSelf.drawSize !== self.drawSize){
            pack.drawSize = self.drawSize;
            lastSelf.drawSize = self.drawSize;
        }
        if(lastSelf.name !== self.name){
            pack.name = self.name;
            lastSelf.name = self.name;
        }
        if(lastSelf.monsterType !== self.monsterType){
            pack.monsterType = self.monsterType;
            lastSelf.monsterType = self.monsterType;
        }
        return pack;
    }
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.width = self.width;
        pack.height = self.height;
        pack.map = self.map;
        pack.animation = self.animation;
        pack.animationDirection = self.animationDirection;
        pack.direction = self.direction;
        pack.hp = self.hp;
        pack.hpMax = self.hpMax;
        pack.drawSize = self.drawSize;
        pack.name = self.name;
        pack.monsterType = self.monsterType;
        pack.type = self.type;
        return pack;
    }
    Monster.list[self.id] = self;
    return self;
}
Monster.list = {};

var renderWorld = function(json,name){
    playerMap[name] = 0;
    for(var i = 0;i < json.layers.length;i++){
        if(json.layers[i].type === "tilelayer"){
            for(var j = 0;j < json.layers[i].chunks.length;j++){
                for(var k = 0;k < json.layers[i].chunks[j].data.length;k++){
                    tile_idx = json.layers[i].chunks[j].data[k];
                    if(tile_idx !== 0){
                        var s_x, s_y;
                        tile_idx -= 1;
                        var size = 64;
                        s_x = (k % 16) * size;
                        s_y = ~~(k / 16) * size;
                        s_x += json.layers[i].chunks[j].x * 64;
                        s_y += json.layers[i].chunks[j].y * 64;
                        for(var l in json.tilesets[0].tiles){
                            if(json.tilesets[0].tiles[l].id === tile_idx && json.tilesets[0].tiles[l].objectgroup){
                                for(var m in json.tilesets[0].tiles[l].objectgroup.objects){
                                    new Collision({
                                        x:s_x + json.tilesets[0].tiles[l].objectgroup.objects[m].x * 4 + json.tilesets[0].tiles[l].objectgroup.objects[m].width * 2,
                                        y:s_y + json.tilesets[0].tiles[l].objectgroup.objects[m].y * 4 + json.tilesets[0].tiles[l].objectgroup.objects[m].height * 2,
                                        width:json.tilesets[0].tiles[l].objectgroup.objects[m].width * 4,
                                        height:json.tilesets[0].tiles[l].objectgroup.objects[m].height * 4,
                                        map:name,
                                        info:json.tilesets[0].tiles[l].type,
                                    });
                                }
                            }
                        }
                        if(tile_idx + 1 === json.tilesets[1].firstgid + 9){
                            if(json.layers[i].name.includes('Spawner')){
                                spawnId = json.layers[i].name.substr(8,json.layers[i].name.length - 9);
                                var spawner = new Spawner({
                                    x:s_x + 32,
                                    y:s_y + 32,
                                    width:64,
                                    height:64,
                                    spawnId:spawnId,
                                    map:name,
                                });
                            }
                            else{
                                var teleport = "";
                                var teleportj = 0;
                                var teleportx = "";
                                var teleportxj = 0;
                                var teleporty = "";
                                var teleportyj = 0;
                                var teleportdirection = "";
                                for(var l = 0;l < json.layers[i].name.length;l++){
                                    if(json.layers[i].name[l] === ':'){
                                        if(teleport === ""){
                                            teleport = json.layers[i].name.substr(0,l);
                                            teleportj = l;
                                        }
                                        else if(teleportx === ""){
                                            teleportx = json.layers[i].name.substr(teleportj + 1,l - teleportj - 1);
                                            teleportxj = l;
                                        }
                                        else if(teleporty === ""){
                                            teleporty = json.layers[i].name.substr(teleportxj + 1,l - teleportxj - 1);
                                            teleportyj = l;
                                        }
                                        else if(teleportdirection === ""){
                                            teleportdirection = json.layers[i].name.substr(teleportyj + 1,l - teleportyj - 1);
                                        }
                                    }
                                }
                                var transporter = new Transporter({
                                    x:s_x + 32,
                                    y:s_y + 32,
                                    width:64,
                                    height:64,
                                    teleport:teleport,
                                    teleportx:teleportx,
                                    teleporty:teleporty,
                                    teleportdirection:teleportdirection,
                                    map:name,
                                });
                            }
                        }
                    }
                }
            }
        }
    }
}
var loadMap = function(name){
    renderWorld(require('./../client/maps/' + name + '.json'),name);
}
loadMap('World');
loadMap('House');