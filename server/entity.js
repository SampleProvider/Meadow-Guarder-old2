var xpLevels = [
    100,
    500,
    1500,
    2500,
    3500,
    5000,
    8000,
    13000,
    20000,
];


ENV = {
    spawnpoint:{
        x:0,
        y:0,
        map:"World",
    }
}

var PF = require('pathfinding');

addToChat = function(color,message,debug){
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
    for(var i in Player.list){
        if(SOCKET_LIST[i]){
            SOCKET_LIST[i].emit('addToChat',{
                color:color,
                message:message,
            });
        }
    }
}

playerMap = {};

tiles = [];

attackData = require('./../client/data/attacks.json');
monsterData = require('./../client/data/monsters.json');
projectileData = require('./../client/data/projectiles.json');
harvestableNpcData = require('./../client/data/harvestableNpcs.json');

require('./../client/inventory.js');

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
    self.region = '';

    self.toRemove = false;
    self.new = true;

    self.lastX = 0;
    self.lastY = 0;
    self.gridX = 0;
    self.gridY = 0;

    self.zindex = 0;

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
        self.x = Math.round(self.x);
        self.y = Math.round(self.y);
    }
    self.updatePosition = function(){
        self.lastX = self.x;
        self.lastY = self.y;
        self.x += self.spdX;
        self.y += self.spdY;
        self.gridX = Math.floor(self.x / 64);
        self.gridY = Math.floor(self.y / 64);
    }
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
    }
	self.getSquareDistance = function(pt){
		return Math.max(Math.abs(Math.floor(self.x - pt.x)),Math.abs(Math.floor(self.y - pt.y))) / 64;
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
        else{
            var vertices = [
                {x:(self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
                {x:(self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (-self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (-self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
                {x:(-self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (-self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(-self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (-self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
                {x:(-self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(-self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
                {x:self.x,y:self.y},
            ];
            var vertices2 = [
                {x:pt.x + pt.width / 2,y:pt.y + pt.height / 2},
                {x:pt.x + pt.width / 2,y:pt.y - pt.height / 2},
                {x:pt.x - pt.width / 2,y:pt.y - pt.height / 2},
                {x:pt.x - pt.width / 2,y:pt.y + pt.height / 2},
            ];
            var getSlope = function(pt1,pt2){
                return (pt2.y - pt1.y) / (pt2.x - pt1.x);
            }
            for(var i = 0;i < 4;i++){
                if(vertices2[i].y - vertices[0].y < getSlope(vertices[0],vertices[1]) * (vertices2[i].x - vertices[0].x)){
                    if(vertices2[i].y - vertices[1].y > getSlope(vertices[1],vertices[2]) * (vertices2[i].x - vertices[1].x)){
                        if(vertices2[i].y - vertices[2].y > getSlope(vertices[2],vertices[3]) * (vertices2[i].x - vertices[2].x)){
                            if(vertices2[i].y - vertices[3].y < getSlope(vertices[3],vertices[0]) * (vertices2[i].x - vertices[3].x)){
                                return true;
                            }
                        }
                    }
                }
                if(vertices[i].x > vertices2[2].x && vertices[i].x < vertices2[0].x && vertices[i].y > vertices2[2].y && vertices[i].y < vertices2[0].y){
                    return true;
                }
            }
            if(vertices[4].x > vertices2[2].x && vertices[4].x < vertices2[0].x && vertices[4].y > vertices2[2].y && vertices[4].y < vertices2[0].y){
                return true;
            }
            return false;
        }
    }
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.map = self.map;
        pack.direction = self.direction;
        pack.zindex = self.zindex;
        if(self.new === true){
            pack.new = true;
            self.new = false;
        }
        if(self.toRemove === true){
            pack.toRemove = true;
        }
        return pack;
    }
    return self;
}

require('./collision');

Actor = function(param){
    var self = Entity(param);
    self.hp = 0;
    self.hpMax = 0;
    self.stats = {
        damage:0,
        defense:0,
        hpRegen:0,
        manaRegen:0,
        critChance:0,
        critPower:0,
    };

    self.animate = true;
    self.animation = 0;
    self.animationDirection = "down";

    self.invincible = false;
    self.mapChange = 11;
    self.transporter = {};

    self.trackingPath = [];

    self.drawSize = 'medium';

    self.name = param.name || 'null';

    self.maxSpeed = 10;
    self.moveSpeed = 10;

    self.img = {
        body:'Undead',
    }

    self.team = 'Human';

    self.canMove = true;
    self.canCollide = true;
    self.canAttack = param.canAttack !== undefined ? param.canAttack : true;
    self.showHealthBar = true;

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
    self.trackPos = function(x,y){
        var size = 65;
        var dx = self.gridX - size / 2 + 0.5;
        var dy = self.gridY - size / 2 + 0.5;
        var tx = Math.floor(x / 64) - dx;
        var ty = Math.floor(y / 64) - dy;
        var finder = new PF.BiAStarFinder({
            allowDiagonal:true,
            dontCrossCorners:true,
        });
        var grid = new PF.Grid(size,size);
        for(var i = 0;i < size;i++){
            for(var j = 0;j < size;j++){
                var x = dx + i;
                var y = dy + j;
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][self.zindex]){
                        if(Collision.list[self.map][self.zindex][x]){
                            if(Collision.list[self.map][self.zindex][x][y]){
                                grid.setWalkableAt(i,j,false);
                            }
                        }
                    }
                }
                if(self.type === 'Monster'){
                    if(RegionChanger.list[self.map]){
                        if(RegionChanger.list[self.map][x]){
                            if(RegionChanger.list[self.map][x][y]){
                                if(RegionChanger.list[self.map][x][y].noMonster){
                                    grid.setWalkableAt(i,j,false);
                                }
                            }
                        }
                    }
                }
            }
        }
        var nx = self.gridX - dx;
        var ny = self.gridY - dy;
        if(tx < size && tx > 0 && ty < size && ty > 0){
            var path = finder.findPath(nx,ny,tx,ty,grid);
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
    self.randomWalk = function(walking){
        self.randomPos.walking = walking;
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
        if(self.canMove && self.type !== 'Monster'){
            for(var i = -1;i < 2;i++){
                for(var j = -1;j < 2;j++){
                    if(Transporter.list[self.map]){
                        if(Transporter.list[self.map][self.gridX + i]){
                            if(Transporter.list[self.map][self.gridX + i][self.gridY + j]){
                                var transporter = Transporter.list[self.map][self.gridX + i][self.gridY + j];
                                if(transporter.teleportdirection === "up" && self.spdY < 0){
                                    self.doTransport(transporter);
                                }
                                if(transporter.teleportdirection === "down" && self.spdY > 0){
                                    self.doTransport(transporter);
                                }
                                if(transporter.teleportdirection === "left" && self.spdX < 0){
                                    self.doTransport(transporter);
                                }
                                if(transporter.teleportdirection === "right" && self.spdX > 0){
                                    self.doTransport(transporter);
                                }
                            }
                        }
                    }
                }
            }
        }
        if(RegionChanger.list[self.map]){
            if(RegionChanger.list[self.map][self.gridX]){
                if(RegionChanger.list[self.map][self.gridX][self.gridY]){
                    var regionChanger = RegionChanger.list[self.map][self.gridX][self.gridY];
                    if(regionChanger.noMonster && self.type === 'Monster'){
                        self.x = self.lastX;
                        self.y = self.lastY;
                    }
                    if(regionChanger.region !== self.region){
                        self.doRegionChange(regionChanger);
                    }
                }
            }
        }
        if(Slope.list[self.map]){
            if(Slope.list[self.map][self.gridX]){
                if(Slope.list[self.map][self.gridX][self.gridY]){
                    self.zindex +=  Slope.list[self.map][self.gridX][self.gridY];
                }
            }
        }
        var collisions = [];
        for(var i = -1;i < 2;i++){
            for(var j = -1;j < 2;j++){
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][self.zindex]){
                        if(Collision.list[self.map][self.zindex][self.gridX + i]){
                            if(Collision.list[self.map][self.zindex][self.gridX + i][self.gridY + j]){
                                var collision = Collision.list[self.map][self.zindex][self.gridX + i][self.gridY + j];
                                for(var k in collision){
                                    if(self.isColliding(collision[k])){
                                        collisions.push(collision[k]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if(collisions[0]){
            var colliding = false;
            for(var i in collisions){
                if(self.isColliding(collisions[i])){
                    colliding = true;
                }
            }
            if(colliding){
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
                    var colliding = false;
                    for(var i in collisions){
                        if(self.isColliding(collisions[i])){
                            colliding = true;
                        }
                    }
                    if(colliding){
                        self.x = self.lastX;
                    }
                }
            }
        }
    }
    self.updateMap = function(){
        if(self.mapChange === 5){
            self.map = self.transporter.teleport;
            if(self.transporter.teleportx !== -1){
                self.x = self.transporter.teleportx;
            }
            if(self.transporter.teleporty !== -1){
                self.y = self.transporter.teleporty;
            }
            self.keyPress.up = false;
            self.keyPress.down = false;
            self.keyPress.left = false;
            self.keyPress.right = false;
        }
        if(self.mapChange === 10){
            self.canMove = true;
            self.canAttack = self.transporter.canAttack;
            self.invincible = false;
        }
    }
    self.teleport = function(x,y,map){
        if(playerMap[map] === undefined){
            return;
        }
        if(self.mapChange > 10){
            self.mapChange = -1;
            self.transporter = {
                teleport:map,
                teleportx:x,
                teleporty:y,
                canAttack:self.canAttack,
            };
            self.canMove = false;
            self.canAttack = false;
            self.invincible = true;
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
    self.doRegionChange = function(regionChanger){
        self.region = regionChanger.region;
        if(regionChanger.canAttack === false){
            self.canAttack = false;
        }
        else{
            self.canAttack = param.canAttack !== undefined ? param.canAttack : true;
        }
        self.transporter.canAttack = self.canAttack;
    }
    self.onHit = function(pt){

    }
    self.dropItems = function(pt){
        if(!Player.list[pt]){
            return;
        }
        for(var i in self.itemDrops){
            if(Math.random() < self.itemDrops[i].chance * Player.list[pt].luck){
                var amount = Math.round(self.itemDrops[i].amount * (Math.random() + 0.5) * Player.list[pt].luck);
                if(i === 'random'){
                    var numItems = 0;
                    for(var j in Item.list){
                        numItems += 1;
                    }
                    var randomItem = Math.floor(Math.random() * numItems);
                    numItems = 0;
                    for(var j in Item.list){
                        if(numItems === randomItem){
                            while(amount > 0){
                                amount -= 1;
                                new DroppedItem({
                                    x:self.x,
                                    y:self.y,
                                    map:self.map,
                                    item:j,
                                    amount:1,
                                    parent:pt,
                                    allPlayers:false,
                                });
                            }
                        }
                        numItems += 1;
                    }
                }
                else{
                    while(amount > 0){
                        amount -= 1;
                        new DroppedItem({
                            x:self.x,
                            y:self.y,
                            map:self.map,
                            item:i,
                            amount:1,
                            parent:pt,
                            allPlayers:false,
                        });
                    }
                }
            }
        }
        Player.list[pt].xp += Math.ceil(Math.random() * 5);
    }
    self.onDamage = function(pt){
        if(self.invincible === true){
            return;
        }
        var hp = self.hp;
        if(Math.random() < pt.stats.critChance){
            self.hp -= Math.max(Math.floor(pt.stats.damage * (1 + pt.stats.critPower) - self.stats.defense),0);
        }
        else{
            self.hp -= Math.max(Math.floor(pt.stats.damage - self.stats.defense),0);
        }
        self.hp = Math.round(self.hp);
        if(self.hp < 1 && hp > 0){
            self.onDeath(self);
            if(self.type === 'Player'){
                SOCKET_LIST[self.id].emit('death');
                addToChat('#ff0000',self.name + ' died.');
            }
            else{
                if(self.type === 'Monster'){
                    self.dropItems(pt.parent);
                }
                self.toRemove = true;
            }
        }
        self.onHit(pt);
        if(pt.type === 'Projectile'){
            pt.onHit(self);
        }
    }
    self.shootProjectile = function(projectileType,param){
        var direction = param.direction !== undefined ? param.direction / 180 * Math.PI + self.direction / 180 * Math.PI : self.direction / 180 * Math.PI;
        direction += param.directionDeviation !== undefined ? Math.random() * param.directionDeviation / 180 * Math.PI - param.directionDeviation / 180 * Math.PI / 2 : 0
        var stats = Object.create(self.stats);
        if(param.stats){
            for(var i in param.stats){
                if(stats[i]){
                    stats[i] *= param.stats[i];
                }
            }
        }
        var properties = {
            id:param.sameId !== undefined ? self.id : undefined,
            parent:param.id !== undefined ? param.id : self.id,
            x:param.x !== undefined ? param.x : param.distance !== undefined ? projectileData[projectileType] !== undefined ? self.x + Math.cos(direction) * (param.distance + projectileData[projectileType].width * 2) : self.x + Math.cos(direction) * (param.distance + 48) : projectileData[projectileType] !== undefined ? self.x + Math.cos(direction) * projectileData[projectileType].width * 2 : self.x + Math.cos(direction) * 48,
            y:param.y !== undefined ? param.y : param.distance !== undefined ? projectileData[projectileType] !== undefined ? self.y + Math.sin(direction) * (param.distance + projectileData[projectileType].width * 2) : self.y + Math.sin(direction) * (param.distance + 48) : projectileData[projectileType] !== undefined ? self.y + Math.sin(direction) * projectileData[projectileType].width * 2 : self.y + Math.sin(direction) * 48,
            spdX:param.speed !== undefined ? Math.cos(direction) * param.speed : Math.cos(direction) * 20,
            spdY:param.speed !== undefined ? Math.sin(direction) * param.speed : Math.sin(direction) * 20,
            speed:param.speed !== undefined ? param.speed : 20,
            direction:direction * 180 / Math.PI,
            spin:param.spin !== undefined ? param.spin : 0,
            map:self.map,
            stats:stats,
            projectileType:projectileType,
            pierce:param.pierce !== undefined ? param.pierce : 1,
            timer:param.timer !== undefined ? param.timer : 40,
            relativeToParent:param.relativeToParent !== undefined ? param.relativeToParent : false,
            parentType:param.parentType !== undefined ? param.parentType : self.type,
            projectilePattern:param.projectilePattern !== undefined ? param.projectilePattern : false,
            collisionType:param.collisionType !== undefined ? param.collisionType : 'remove',
            zindex:param.zindex !== undefined ? param.zindex : self.zindex,
            team:param.team !== undefined ? param.team : self.team,
        };
        var projectile = new Projectile(properties);
        return projectile;
    }
    self.doAttack = function(data,reload){
        if(self.canAttack === false){
            return;
        }
        for(var i in data){
            if(reload % parseInt(i) === 0){
                for(var j = 0;j < data[i].length;j++){
                    if(data[i][j]){
                        if(data[i][j].manaCost){
                            if(self.mana >= data[i][j].manaCost){
                                self.mana -= data[i][j].manaCost;
                            }
                            else{
                                continue;
                            }
                        }
                        if(data[i][j].hpCost){
                            if(self.hp >= data[i][j].hpCost){
                                self.hp -= data[i][j].hpCost;
                            }
                            else{
                                continue;
                            }
                        }
                        switch(data[i][j].id){
                            case "projectile":
                                self.shootProjectile(data[i][j].projectileType,data[i][j].param);
                                break;
                        }
                    }
                }
            }
        }
    }
    self.changeSize = function(){
        if(self.drawSize === 'small'){
            self.width = 64;
            self.height = 64;
        }
        else if(self.drawSize === 'medium'){
            self.width = 64;
            self.height = 64;
        }
        else{
            self.width = 128;
            self.height = 128;
        }
    }
    self.updateHp = function(){
        if(self.hp < 1){
            return;
        }
        self.hp += self.stats.hpRegen / 20;
        self.hp = Math.min(self.hpMax,self.hp);
    }
    var getInitPack = self.getInitPack;
    self.getInitPack = function(){
        var pack = getInitPack();
        pack.name = self.name;
        pack.img = self.img;
        pack.animation = self.animation;
        pack.animationDirection = self.animationDirection;
        pack.drawSize = self.drawSize;
        pack.hp = self.hp;
        pack.hpMax = self.hpMax;
        pack.team = self.team;
        pack.showHealthBar = self.showHealthBar;
        return pack;
    }
    return self;
}

Player = function(param,socket){
    var self = Actor(param);

    self.keyPress = {
        left:false,
        right:false,
        up:false,
        down:false,
        leftClick:false,
        rightClick:false,
        heal:false,
    };
    self.keyMap = {
        up:'w',
        down:'s',
        left:'a',
        right:'d',
        leftClick:'leftClick',
        rightClick:'rightClick',
        heal:' ',
    };
    self.secondKeyMap = {
        up:'ArrowUp',
        down:'ArrowDown',
        left:'ArrowLeft',
        right:'ArrowRight',
        leftClick:'leftClick',
        rightClick:'rightClick',
        heal:'Shift',
    };
    self.thirdKeyMap = {
        up:'W',
        down:'S',
        left:'A',
        right:'D',
        leftClick:'leftClick',
        rightClick:'rightClick',
        heal:' ',
    };

    self.img = {
        body:"Human",
        shirt:"none",
        pants:"none",
        boots:"none",
        hair:"none",
        headwear:"none",
        gloves:"none",
        waist:"none",
    };

    self.username = param.username;
    self.name = param.username;

    self.changeSize();

    self.x = ENV.spawnpoint.x;
    self.y = ENV.spawnpoint.y;
    self.map = ENV.spawnpoint.map;

    self.type = 'Player';

    self.canMove = false;
    self.invincible = true;

    self.hp = 100;
    self.hpMax = 100;
    self.xp = 0;
    self.xpMax = 100;
    self.mana = 100;
    self.manaMax = 100;

    self.level = 0;

    self.stats = {
        damage:0,
        defense:0,
        hpRegen:2,
        manaRegen:2,
        critChance:0,
        critPower:0,
    }
    self.luck = 1;

    self.pickaxePower = 0;
    self.axePower = 0;
    self.scythePower = 0;

    self.currentItem = '';

    self.mainReload = 0;
    self.passiveReload = 0;
    self.mainAttackData = {};
    self.passiveAttackData = {};
    self.useTime = 0;

    self.lastChat = 0;
    self.chatWarnings = 0;
    self.textColor = '#000000';

    self.inventory = new Inventory(socket,true);
    if(param.database.items){
        for(var i in param.database.items){
            if(param.database.items[i]){
                if(Item.list[param.database.items[i].id]){
                    self.inventory.items[i] = param.database.items[i];
                }
            }
        }
    }
    else{
        self.inventory.addItem('coppershiv',1);
    }
    if(param.database.xp){
        self.xp = param.database.xp;
    }
    if(param.database.level){
        self.level = param.database.level;
    }
    if(param.database.img){
        for(var i in param.database.img){
            self.img[i] = param.database.img[i];
        }
    }
    if(self.img.body === 'Undead' || self.img.body === 'Orc'){
        self.team = 'Undead';
    }
    else{
        self.team = 'Human';
    }
    self.xpMax = xpLevels[self.level];
    self.inventory.refreshInventory();

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
            leftClick:false,
            rightClick:false,
            heal:false,
        }
    }
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
        self.x = Math.round(self.x);
        self.y = Math.round(self.y);
        self.updateStats();
        self.updateXp();
        self.updateAnimation();
        if(self.mapChange === 0){
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
                Player.getAllInitPack(socket);
                for(var i in Player.list){
                    if(Player.list[i].map === self.map){
                        SOCKET_LIST[i].emit('initEntity',self.getInitPack());
                    }
                    else{
                        SOCKET_LIST[i].emit('removePlayer',self.id);
                    }
                }
            }
        }
        if(self.mapChange === 10){
            self.canMove = true;
            self.canAttack = self.transporter.canAttack;
            self.invincible = false;
        }
        self.lastChat -= 1;
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
        self.passiveReload += 1;
        self.doAttack(self.passiveAttackData,self.passiveReload);
    }
    self.updateQuest = function(){
        if(self.keyPress.rightClick === true){
            for(var i in Npc.list){
                if(Npc.list[i].map === self.map){
                    var npc = Npc.list[i];
                    if(npc.x - npc.width / 2 <= self.mouseX && npc.x + npc.width / 2 >= self.mouseX && npc.y - npc.height / 2 <= self.mouseY && npc.y + npc.height / 2 >= self.mouseY){
                        if(self.getDistance(npc) > 128){
                            self.keyPress.rightClick = false;
                            continue;
                        }
                        var response1 = undefined;
                        var response2 = undefined;
                        var response3 = undefined;
                        var response4 = undefined;
                        self.questInfo.response1 = undefined;
                        self.questInfo.response2 = undefined;
                        self.questInfo.response3 = undefined;
                        self.questInfo.response4 = undefined;
                        for(var j in questData){
                            if(questData[j].startNpc === i){
                                if(self.checkQuestRequirements(j)){
                                    if(self.quest === false){
                                        if(response1 === undefined){
                                            response1 = '*Start the quest ' + j + '*';
                                            self.questInfo.response1 = j;
                                        }
                                        else if(response2 === undefined){
                                            response2 = '*Start the quest ' + j + '*';
                                            self.questInfo.response2 = j;
                                        }
                                        else if(response3 === undefined){
                                            response3 = '*Start the quest ' + j + '*';
                                            self.questInfo.response3 = j;
                                        }
                                        else if(response4 === undefined){
                                            response4 = '*Start the quest ' + j + '*';
                                            self.questInfo.response4 = j;
                                        }
                                    }
                                    else{
                                        if(response1 === undefined){
                                            response1 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                            self.questInfo.response1 = 'None';
                                        }
                                        else if(response2 === undefined){
                                            response2 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                            self.questInfo.response2 = 'None';
                                        }
                                        else if(response3 === undefined){
                                            response3 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                            self.questInfo.response3 = 'None';
                                        }
                                        else if(response4 === undefined){
                                            response4 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                            self.questInfo.response4 = 'None';
                                        }
                                    }
                                }
                                else{
                                    var requirements = 'Requires ';
                                    for(var k in questData[j].requirements){
                                        if(self.questStats[questData[j].requirements[k]] === false){
                                            if(requirements === 'Requires '){
                                                requirements += questData[j].requirements[k];
                                            }
                                            else{
                                                requirements += ' and ' + questData[j].requirements[k];
                                            }
                                        }
                                        else if(questData[j].requirements[k].slice(0,4) === 'Lvl '){
                                            if(parseInt(questData[j].requirements[k].slice(4,questData[j].requirements[k].length),10) > self.level){
                                                if(requirements === 'Requires '){
                                                    requirements += 'Level ' + questData[j].requirements[k].slice(4,questData[j].requirements[k].length);
                                                }
                                                else{
                                                    requirements += ' and Level ' + questData[j].requirements[k].slice(4,questData[j].requirements[k].length);
                                                }
                                            }
                                        }
                                    }
                                    if(response1 === undefined){
                                        response1 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                        self.questInfo.response1 = 'None';
                                    }
                                    else if(response2 === undefined){
                                        response2 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                        self.questInfo.response2 = 'None';
                                    }
                                    else if(response3 === undefined){
                                        response3 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                        self.questInfo.response3 = 'None';
                                    }
                                    else if(response4 === undefined){
                                        response4 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                        self.questInfo.response4 = 'None';
                                    }
                                }
                            }
                        }
                        if(npc.mainItem){
                            if(self.checkNpcRequirements(i)){
                                if(response1 === undefined){
                                    response1 = '*Buy ' + npc.mainItem + '*';
                                    self.questInfo.response1 = npc.mainItem;
                                }
                                else if(response2 === undefined){
                                    response2 = '*Buy ' + npc.mainItem + '*';
                                    self.questInfo.response2 = npc.mainItem;
                                }
                                else if(response3 === undefined){
                                    response3 = '*Buy ' + npc.mainItem + '*';
                                    self.questInfo.response3 = npc.mainItem;
                                }
                                else if(response4 === undefined){
                                    response4 = '*Buy ' + npc.mainItem + '*';
                                    self.questInfo.response4 = npc.mainItem;
                                }
                            }
                            else{
                                var requirements = 'Requires ';
                                for(var j in npcData[i].requirements){
                                    if(self.questStats[npcData[i].requirements[j]] === false){
                                        if(requirements === 'Requires '){
                                            requirements += npcData[i].requirements[j];
                                        }
                                        else{
                                            requirements += ' and ' + npcData[i].requirements[j];
                                        }
                                    }
                                    else if(npcData[i].requirements[j].slice(0,4) === 'Lvl '){
                                        if(parseInt(npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length),10) > self.level){
                                            if(requirements === 'Requires '){
                                                requirements += 'Level ' + npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length);
                                            }
                                            else{
                                                requirements += ' and Level ' + npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length);
                                            }
                                        }
                                    }
                                }
                                if(response1 === undefined){
                                    response1 = '<span style="color:#aaaaaa">*Buy ' + npc.mainItem + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response1 = 'None';
                                }
                                else if(response2 === undefined){
                                    response2 = '<span style="color:#aaaaaa">*Buy ' + npc.mainItem + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response2 = 'None';
                                }
                                else if(response3 === undefined){
                                    response3 = '<span style="color:#aaaaaa">*Buy ' + npc.mainItem + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response3 = 'None';
                                }
                                else if(response4 === undefined){
                                    response4 = '<span style="color:#aaaaaa">*Buy ' + npc.mainItem + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response4 = 'None';
                                }
                            }
                        }
                        if(npc.mainCraft){
                            if(self.checkNpcRequirements(i)){
                                if(response1 === undefined){
                                    response1 = '*Craft ' + npc.mainCraft + '*';
                                    self.questInfo.response1 = npc.mainCraft;
                                }
                                else if(response2 === undefined){
                                    response2 = '*Craft ' + npc.mainCraft + '*';
                                    self.questInfo.response2 = npc.mainCraft;
                                }
                                else if(response3 === undefined){
                                    response3 = '*Craft ' + npc.mainCraft + '*';
                                    self.questInfo.response3 = npc.mainCraft;
                                }
                                else if(response4 === undefined){
                                    response4 = '*Craft ' + npc.mainCraft + '*';
                                    self.questInfo.response4 = npc.mainCraft;
                                }
                            }
                            else{
                                var requirements = 'Requires ';
                                for(var j in npcData[i].requirements){
                                    if(self.questStats[npcData[i].requirements[j]] === false){
                                        if(requirements === 'Requires '){
                                            requirements += npcData[i].requirements[j];
                                        }
                                        else{
                                            requirements += ' and ' + npcData[i].requirements[j];
                                        }
                                    }
                                    else if(npcData[i].requirements[j].slice(0,4) === 'Lvl '){
                                        if(parseInt(npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length),10) > self.level){
                                            if(requirements === 'Requires '){
                                                requirements += 'Level ' + npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length);
                                            }
                                            else{
                                                requirements += ' and Level ' + npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length);
                                            }
                                        }
                                    }
                                }
                                if(response1 === undefined){
                                    response1 = '<span style="color:#aaaaaa">*Craft ' + npc.mainCraft + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response1 = 'None';
                                }
                                else if(response2 === undefined){
                                    response2 = '<span style="color:#aaaaaa">*Craft ' + npc.mainCraft + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response2 = 'None';
                                }
                                else if(response3 === undefined){
                                    response3 = '<span style="color:#aaaaaa">*Craft ' + npc.mainCraft + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response3 = 'None';
                                }
                                else if(response4 === undefined){
                                    response4 = '<span style="color:#aaaaaa">*Craft ' + npc.mainCraft + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response4 = 'None';
                                }
                            }
                        }
                        if(npc.dungeon){
                            if(self.checkNpcRequirements(i)){
                                if(self.quest === false){
                                    if(response1 === undefined){
                                        response1 = '*Enter ' + npc.name + '*';
                                        self.questInfo.response1 = npc.name;
                                    }
                                    else if(response2 === undefined){
                                        response2 = '*Enter ' + npc.name + '*';
                                        self.questInfo.response2 = npc.name;
                                    }
                                    else if(response3 === undefined){
                                        response3 = '*Enter ' + npc.name + '*';
                                        self.questInfo.response3 = npc.name;
                                    }
                                    else if(response4 === undefined){
                                        response4 = '*Enter ' + npc.name + '*';
                                        self.questInfo.response4 = npc.name;
                                    }
                                }
                                else{
                                    if(response1 === undefined){
                                        response1 = '<span style="color:#aaaaaa">*Enter ' + npc.name + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                        self.questInfo.response1 = 'None';
                                    }
                                    else if(response2 === undefined){
                                        response2 = '<span style="color:#aaaaaa">*Enter ' + npc.name + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                        self.questInfo.response2 = 'None';
                                    }
                                    else if(response3 === undefined){
                                        response3 = '<span style="color:#aaaaaa">*Enter ' + npc.name + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                        self.questInfo.response3 = 'None';
                                    }
                                    else if(response4 === undefined){
                                        response4 = '<span style="color:#aaaaaa">*Enter ' + npc.name + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                        self.questInfo.response4 = 'None';
                                    } 
                                }
                            }
                            else{
                                var requirements = 'Requires ';
                                for(var j in npcData[i].requirements){
                                    if(self.questStats[npcData[i].requirements[j]] === false){
                                        if(requirements === 'Requires '){
                                            requirements += npcData[i].requirements[j];
                                        }
                                        else{
                                            requirements += ' and ' + npcData[i].requirements[j];
                                        }
                                    }
                                    else if(npcData[i].requirements[j].slice(0,4) === 'Lvl '){
                                        if(parseInt(npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length),10) > self.level){
                                            if(requirements === 'Requires '){
                                                requirements += 'Level ' + npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length);
                                            }
                                            else{
                                                requirements += ' and Level ' + npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length);
                                            }
                                        }
                                    }
                                }
                                if(response1 === undefined){
                                    response1 = '<span style="color:#aaaaaa">*Enter ' + npc.name + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response1 = 'None';
                                }
                                else if(response2 === undefined){
                                    response2 = '<span style="color:#aaaaaa">*Enter ' + npc.name + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response2 = 'None';
                                }
                                else if(response3 === undefined){
                                    response3 = '<span style="color:#aaaaaa">*Enter ' + npc.name + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response3 = 'None';
                                }
                                else if(response4 === undefined){
                                    response4 = '<span style="color:#aaaaaa">*Enter ' + npc.name + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response4 = 'None';
                                }
                            }
                        }
                        if(i === 'petmaster'){
                            if(response1 === undefined){
                                response1 = '*Upgrade your Pet*';
                                self.questInfo.response1 = 'Pet Upgrade';
                            }
                            else if(response2 === undefined){
                                response2 = '*Upgrade your Pet*';
                                self.questInfo.response2 = 'Pet Upgrade';
                            }
                            else if(response3 === undefined){
                                response3 = '*Upgrade your Pet*';
                                self.questInfo.response3 = 'Pet Upgrade';
                            }
                            else if(response4 === undefined){
                                response4 = '*Upgrade your Pet*';
                                self.questInfo.response4 = 'Pet Upgrade';
                            }
                        }
                        if(response1 === undefined){
                            response1 = '*End conversation*';
                            self.questInfo.response1 = 'End';
                        }
                        else if(response2 === undefined){
                            response2 = '*End conversation*';
                            self.questInfo.response2 = 'End';
                        }
                        else if(response3 === undefined){
                            response3 = '*End conversation*';
                            self.questInfo.response3 = 'End';
                        }
                        else if(response4 === undefined){
                            response4 = '*End conversation*';
                            self.questInfo.response4 = 'End';
                        }
                        if(npc.dialogues !== undefined){
                            var dialogue = Math.floor(Math.random() * npc.dialogues.length);
                            self.startDialogue(npc.dialogues[dialogue],response1,response2,response3,response4);
                        }
                        else{
                            self.startDialogue('',response1,response2,response3,response4);
                        }
                        self.keyPress.rightClick = false;
                    }
                }
            }
        }
    }
    self.updateStats = function(){
        if(self.inventory.updateStats){
            self.inventory.updateStats = false;

            self.hpMax = 100;
            self.manaMax = 100;
            
            self.stats = {
                damage:0,
                defense:0,
                hpRegen:2,
                manaRegen:2,
                critChance:0,
                critPower:0,
            }
            self.luck = 1;

            self.pickaxePower = 0;
            self.axePower = 0;
            self.scythePower = 0;

            self.currentItem = '';

            self.maxSpeed = 10;

            self.mainAttackData = {};
            self.passiveAttackData = {};
            self.useTime = 0;

            var maxSlots = self.inventory.maxSlots;
            self.inventory.maxSlots = 20;

            var damageType = '';

            for(var i in self.inventory.items){
                if(i >= 0){
                    if(i + '' === self.inventory.hotbarSelectedItem + ''){
                        if(self.inventory.items[i].id){
                            var item = Item.list[self.inventory.items[i].id];
                            if(item.equip !== 'hotbar' && item.equip !== 'consume'){
                                continue;
                            }
                            self.currentItem = self.inventory.items[i].id;
                            if(item.damage !== undefined){
                                self.stats.damage += item.damage;
                            }
                            if(item.meleeDamage !== undefined){
                                self.stats.damage += item.meleeDamage;
                                damageType = 'melee';
                            }
                            if(item.rangedDamage !== undefined){
                                self.stats.damage += item.rangedDamage;
                                damageType = 'ranged';
                            }
                            if(item.magicDamage !== undefined){
                                self.stats.damage += item.magicDamage;
                                damageType = 'magic';
                            }
                            if(item.critChance !== undefined){
                                self.stats.critChance += item.critChance;
                            }
                            if(item.pickaxePower !== undefined){
                                self.pickaxePower = item.pickaxePower;
                            }
                            if(item.axePower !== undefined){
                                self.axePower = item.axePower;
                            }
                            if(item.scythePower !== undefined){
                                self.scythePower = item.scythePower;
                            }
                            if(item.useTime !== undefined){
                                self.useTime = item.useTime;
                            }
                            if(item.attacks !== undefined){
                                if(attackData[item.attacks]){
                                    for(var j in attackData[item.attacks]){
                                        if(self.mainAttackData[j]){
                                            for(var k in attackData[item.attacks][j]){
                                                self.mainAttackData[j].push(attackData[item.attacks][j][k]);
                                            }
                                        }
                                        else{
                                            self.mainAttackData[j] = Object.create(attackData[item.attacks][j]);
                                        }
                                    }
                                }
                            }
                            if(item.passives !== undefined){
                                if(attackData[item.passives]){
                                    for(var j in attackData[item.passives]){
                                        if(self.passiveAttackData[j]){
                                            for(var k in attackData[item.passives][j]){
                                                self.passiveAttackData[j].push(attackData[item.passives][j][k]);
                                            }
                                        }
                                        else{
                                            self.passiveAttackData[j] = Object.create(attackData[item.passives][j]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else{
                    if(self.inventory.items[i].id){
                        var item = Item.list[self.inventory.items[i].id];
                        if(item.defense !== undefined){
                            self.stats.defense += item.defense;
                        }
                        if(item.hp !== undefined){
                            self.hpMax += item.hp;
                        }
                        if(item.hpRegen !== undefined){
                            self.stats.hpRegen += item.hpRegen;
                        }
                        if(item.mana !== undefined){
                            self.manaMax += item.mana;
                        }
                        if(item.manaRegen !== undefined){
                            self.stats.manaRegen += item.manaRegen;
                        }
                        if(item.movementSpeed !== undefined){
                            self.maxSpeed += item.movementSpeed;
                        }
                        if(item.damage !== undefined){
                            self.damage += item.damage;
                        }
                        if(item.meleeDamage !== undefined && damageType === 'melee'){
                            self.stats.damage += item.meleeDamage;
                        }
                        if(item.rangedDamage !== undefined && damageType === 'ranged'){
                            self.stats.damage += item.rangedDamage;
                        }
                        if(item.magicDamage !== undefined && damageType === 'magic'){
                            self.stats.damage += item.magicDamage;
                        }
                        if(item.slots !== undefined){
                            self.inventory.maxSlots += item.slots;
                        }
                        if(item.attacks !== undefined){
                            if(attackData[item.attacks]){
                                for(var j in attackData[item.attacks]){
                                    if(self.mainAttackData[j]){
                                        for(var k in attackData[item.attacks][j]){
                                            self.mainAttackData[j].push(attackData[item.attacks][j][k]);
                                        }
                                    }
                                    else{
                                        self.mainAttackData[j] = Object.create(attackData[item.attacks][j]);
                                    }
                                }
                            }
                        }
                        if(item.passives !== undefined){
                            if(attackData[item.passives]){
                                for(var j in attackData[item.passives]){
                                    if(self.passiveAttackData[j]){
                                        for(var k in attackData[item.passives][j]){
                                            self.passiveAttackData[j].push(attackData[item.passives][j][k]);
                                        }
                                    }
                                    else{
                                        self.passiveAttackData[j] = Object.create(attackData[item.passives][j]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if(self.inventory.maxSlots !== maxSlots){
                if(self.inventory.maxSlots < maxSlots){
                    for(var i in self.inventory.items){
                        if(i >= 0){
                            if(i >= self.inventory.maxSlots){

                            }
                        }
                    }
                }
                self.inventory.refreshMenu();
            }
        }
    }
    self.updateHarvest = function(){
        if(self.keyPress.leftClick === true){
            if(self.pickaxePower > 0 || self.axePower > 0 || self.scythePower > 0){
                for(var i in HarvestableNpc.list){
                    if(HarvestableNpc.list[i].img !== 'none'){
                        if(self.getSquareDistance({x:self.mouseX,y:self.mouseY}) <= 1.5){
                            if(HarvestableNpc.list[i].harvestTool === 'pickaxe' && self.pickaxePower >= HarvestableNpc.list[i].harvestPower){
                                if(HarvestableNpc.list[i].map === self.map){
                                    var npc = HarvestableNpc.list[i];
                                    if(npc.x + npc.harvestOffsetX - npc.harvestWidth / 2 <= self.mouseX && npc.x + npc.harvestOffsetX + npc.harvestWidth / 2 >= self.mouseX && npc.y + npc.harvestOffsetY - npc.harvestHeight / 2 <= self.mouseY && npc.y + npc.harvestOffsetY + npc.harvestHeight / 2 >= self.mouseY){
                                        npc.harvestHp -= self.pickaxePower;
                                        if(npc.harvestHp <= 0){
                                            npc.dropItems(self.id);
                                        }
                                    }
                                }
                            }
                            else if(HarvestableNpc.list[i].harvestTool === 'axe' && self.axePower >= HarvestableNpc.list[i].harvestPower){
                                if(HarvestableNpc.list[i].map === self.map){
                                    var npc = HarvestableNpc.list[i];
                                    if(npc.x + npc.harvestOffsetX - npc.harvestWidth / 2 <= self.mouseX && npc.x + npc.harvestOffsetX + npc.harvestWidth / 2 >= self.mouseX && npc.y + npc.harvestOffsetY - npc.harvestHeight / 2 <= self.mouseY && npc.y + npc.harvestOffsetY + npc.harvestHeight / 2 >= self.mouseY){
                                        npc.harvestHp -= self.axePower;
                                        if(npc.harvestHp <= 0){
                                            npc.dropItems(self.id);
                                        }
                                    }
                                }
                            }
                            else if(HarvestableNpc.list[i].harvestTool === 'scythe' && self.scythePower >= HarvestableNpc.list[i].harvestPower){
                                if(HarvestableNpc.list[i].map === self.map){
                                    var npc = HarvestableNpc.list[i];
                                    if(npc.x + npc.harvestOffsetX - npc.harvestWidth / 2 <= self.mouseX && npc.x + npc.harvestOffsetX + npc.harvestWidth / 2 >= self.mouseX && npc.y + npc.harvestOffsetY - npc.harvestHeight / 2 <= self.mouseY && npc.y + npc.harvestOffsetY + npc.harvestHeight / 2 >= self.mouseY){
                                        npc.harvestHp -= self.scythePower;
                                        if(npc.harvestHp <= 0){
                                            npc.dropItems(self.id);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    self.updateXp = function(){
        if(self.xp >= self.xpMax){
            if(xpLevels[self.level]){
                self.level += 1;
                self.xpMax = xpLevels[self.level];
                addToChat('#00ff00',self.name + ' is now level ' + self.level + '.');
                self.xp = 0;
            }
            else{
                self.xpMax = self.xp;
            }
        }
    }
    self.updateMana = function(){
        self.mana += self.stats.manaRegen / 20;
        self.mana = Math.min(self.manaMax,self.mana);
    }
    self.doRegionChange = function(regionChanger){
        self.region = regionChanger.region;
        if(regionChanger.canAttack === false){
            self.canAttack = false;
        }
        else{
            self.canAttack = param.canAttack !== undefined ? param.canAttack : true;
        }
        self.transporter.canAttack = self.canAttack;
        socket.emit('regionChange',{region:regionChanger.region,mapName:regionChanger.mapName});
    }
    var getInitPack = self.getInitPack;
    self.getInitPack = function(){
        var pack = getInitPack();
        pack.xp = self.xp;
        pack.xpMax = self.xpMax;
        pack.mana = self.mana;
        pack.manaMax = self.manaMax;
        pack.currentItem = self.currentItem;
        pack.type = self.type;
        return pack;
    }
    Player.list[self.id] = self;
    return self;
}

Player.list = {};

Player.onConnect = function(socket,username){
    getDatabase(username,function(database){
        var player = Player({
            id:socket.id,
            username:username,
            database:database,
        },socket);
        for(var i in SOCKET_LIST){
            if(Player.list[i]){
                if(Player.list[i].map === player.map){
                    SOCKET_LIST[i].emit('initEntity',player.getInitPack());
                }
            }
        }
        
        socket.emit('selfId',{id:socket.id,img:player.img});

        socket.on('keyPress',function(data){
            if(data.inputId === 'releaseAll'){
                player.keyPress = {
                    up:false,
                    down:false,
                    left:false,
                    right:false,
                    leftClick:false,
                    rightClick:false,
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
            if(data.inputId === player.keyMap.leftClick || data.inputId === player.secondKeyMap.leftClick || data.inputId === player.thirdKeyMap.leftClick){
                player.keyPress.leftClick = data.state;
                if(data.state === true){
                    for(var i in DroppedItem.list){
                        if(DroppedItem.list[i].parent + '' === player.id + '' || DroppedItem.list[i].allPlayers){
                            if(player.getSquareDistance(DroppedItem.list[i]) < 32){
                                if(DroppedItem.list[i].isColliding({x:player.mouseX,y:player.mouseY,width:0,height:0,map:player.map,type:'Player'})){
                                    if(player.inventory.addItem(DroppedItem.list[i].item,DroppedItem.list[i].amount) !== false){
                                        player.keyPress.leftClick = false;
                                        delete DroppedItem.list[i];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if(data.inputId === player.keyMap.rightClick || data.inputId === player.secondKeyMap.rightClick || data.inputId === player.thirdKeyMap.rightClick){
                player.keyPress.rightClick = data.state;
            }
            if(data.inputId === player.keyMap.heal || data.inputId === player.secondKeyMap.heal || data.inputId === player.thirdKeyMap.heal){
                player.keyPress.heal = data.state;
            }
            if(data.inputId === 'direction'){
                player.direction = (Math.atan2(data.state.y,data.state.x) / Math.PI * 180);
                player.mouseX = data.state.x + player.x;
                player.mouseY = data.state.y + player.y;
            }
        });

        socket.on('attack',function(data){
            player.mainReload += 1;
            player.doAttack(player.mainAttackData,player.mainReload);
            if(player.canAttack){
                if(player.inventory.items[player.inventory.hotbarSelectedItem]){
                    if(player.inventory.items[player.inventory.hotbarSelectedItem].id){
                        if(Item.list[player.inventory.items[player.inventory.hotbarSelectedItem].id].equip === 'consume'){
                            player.inventory.items[player.inventory.hotbarSelectedItem].amount -= 1;
                            if(player.inventory.items[player.inventory.hotbarSelectedItem].amount <= 0){
                                player.inventory.items[player.inventory.hotbarSelectedItem] = {};
                            }
                            player.inventory.refreshItem(player.inventory.hotbarSelectedItem);
                        }
                    }
                }
            }
        });

        socket.on('changePlayer',function(data){
            if(player.img[data.id] !== undefined){
                player.img[data.id] = data.type;
            }
            if(data.id === 'body'){
                if(data.type === 'Undead' || data.type === 'Orc'){
                    player.team = 'Undead';
                }
                else{
                    player.team = 'Human';
                }
            }
        });

        socket.on('respawn',function(data){
            if(player.hp > 0){
                addToChat('#ff0000',player.name + ' cheated using respawn.');
                Player.onDisconnect(SOCKET_LIST[player.id]);
                return;
            }
            player.canMove = true;
            player.hp = Math.round(player.hpMax / 2);
            player.teleport(ENV.spawnpoint.x,ENV.spawnpoint.y,ENV.spawnpoint.map);
            addToChat('#00ff00',player.name + ' respawned.');
        });

        socket.on('init',function(data){
            Player.getAllInitPack(socket);
        });

        socket.on('nextReload',function(data){
            player.updateAttack();
            player.updateHp();
            player.updateMana();
        });

        socket.on('signInFinished',function(data){
            player.canMove = true;
            player.invincible = false;
            Player.getAllInitPack(socket);
            addToChat('#00ff00',player.name + " just logged on.");
        });
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
        addToChat('#ff0000',Player.list[socket.id].name + " logged off.");
        delete Player.list[socket.id];
    }
}
Player.getAllInitPack = function(socket){
    try{
        var player = Player.list[socket.id];
        if(player){
            var pack = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
            for(var i in Player.list){
                if(Player.list[i].map === player.map){
                    if(player.getSquareDistance(Player.list[i]) < 32){
                        pack.player.push(Player.list[i].getInitPack());
                    }
                }
            }
            for(var i in Projectile.list){
                if(Projectile.list[i].map === player.map){
                    if(player.getSquareDistance(Projectile.list[i]) < 32){
                        pack.projectile.push(Projectile.list[i].getInitPack());
                    }
                }
            }
            for(var i in Monster.list){
                if(Monster.list[i].map === player.map){
                    if(player.getSquareDistance(Monster.list[i]) < 32){
                        pack.monster.push(Monster.list[i].getInitPack());
                    }
                }
            }
            for(var i in Npc.list){
                if(Npc.list[i].map === player.map){
                    if(player.getSquareDistance(Npc.list[i]) < 32){
                        pack.npc.push(Npc.list[i].getInitPack());
                    }
                }
            }
            for(var i in DroppedItem.list){
                if(DroppedItem.list[i].map === player.map){
                    if(player.getSquareDistance(DroppedItem.list[i]) < 32){
                        pack.droppedItem.push(DroppedItem.list[i].getInitPack());
                    }
                }
            }
            for(var i in HarvestableNpc.list){
                if(HarvestableNpc.list[i].map === player.map){
                    if(player.getSquareDistance(HarvestableNpc.list[i]) < 32){
                        pack.harvestableNpc.push(HarvestableNpc.list[i].getInitPack());
                    }
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
    self.spin = param.spin;
    self.projectilePattern = param.projectilePattern;
    self.timer = param.timer;
    self.parent = param.parent;
    self.parentType = param.parentType;
    self.relativeToParent = param.relativeToParent;
    self.team = param.team;
    self.type = 'Projectile';
    self.animations = 1;
    self.animation = 0;
    if(projectileData[self.projectileType]){
        for(var i in projectileData[self.projectileType]){
            self[i] = projectileData[self.projectileType][i];
        }
    }
    else{
        self.width = 24;
        self.height = 24;
        self.collisionType = 'sticky';
    }
    self.collisionType = param.collisionType;
    self.width *= 4;
    self.height *= 4;
    self.zindex = param.zindex;
    self.stats = param.stats;
    self.pierce = param.pierce;
    self.onHit = function(pt){
        self.pierce -= 1;
        if(self.pierce === 0){
            self.toRemove = true;
        }
    }
    self.update = function(){
        self.updatePattern();
        self.updatePosition();
        self.x = Math.round(self.x);
        self.y = Math.round(self.y);
        self.updateCollisions();
        self.animation += 0.5;
        if(self.animation >= self.animations){
            self.animation = 0;
        }
        self.direction += self.spin;
        if(self.timer <= 0){
            self.toRemove = true;
        }
        self.timer -= 1;
    }
    self.updatePattern = function(){
        if(self.parentType === 'Player'){
            if(!Player.list[self.parent] && self.relativeToParent){
                self.toRemove = true;
                return;
            }
            var entity = Player.list[self.parent];
        }
        else if(self.parentType === 'Monster'){
            if(!Monster.list[self.parent] && self.relativeToParent){
                self.toRemove = true;
                return;
            }
            var entity = Monster.list[self.parent];
        }
        if(self.projectilePattern === 'shiv'){
            self.x = entity.x;
            self.y = entity.y;
            self.direction = param.direction;
            self.spdX = Math.cos(self.direction / 180 * Math.PI) * (48 - Math.pow(self.timer - 5,2)) * Math.sqrt(2);
            self.spdY = Math.sin(self.direction / 180 * Math.PI) * (48 - Math.pow(self.timer - 5,2)) * Math.sqrt(2);
            self.direction += 135;
        }
        if(self.projectilePattern === 'sword'){
            self.x = entity.x;
            self.y = entity.y;
            self.direction = param.direction - 90 + (self.timer - 1) * 45;
            self.spdX = Math.cos(self.direction / 180 * Math.PI) * 48 * Math.sqrt(2);
            self.spdY = Math.sin(self.direction / 180 * Math.PI) * 48 * Math.sqrt(2);
            self.direction += 135;
        }
        if(self.projectilePattern === 'harvest'){
            self.x = entity.x;
            self.y = entity.y;
            self.direction = param.direction - 90 + (self.timer - 1) * 45;
            self.spdX = Math.cos(self.direction / 180 * Math.PI) * 48 * Math.sqrt(2);
            self.spdY = Math.sin(self.direction / 180 * Math.PI) * 48 * Math.sqrt(2);
            self.direction += 135;
            if(self.timer === 3){
                entity.updateHarvest();
            }
        }
        if(self.projectilePattern === 'claw'){
            self.x = entity.x;
            self.y = entity.y;
            self.direction = param.direction - 45 + (self.timer - 1) * 45;
            self.spdX = Math.cos(self.direction / 180 * Math.PI) * 48 * Math.sqrt(2);
            self.spdY = Math.sin(self.direction / 180 * Math.PI) * 48 * Math.sqrt(2);
            self.direction += 135;
        }
        if(self.projectilePattern === 'waraxe'){
            if(entity.x > self.x){
                self.spdX += 1;
            }
            else if(entity.x < self.x){
                self.spdX -= 1;
            }
            if(entity.y > self.y){
                self.spdY += 1;
            }
            else if(entity.y < self.y){
                self.spdY -= 1;
            }
            if(self.getDistance(entity) < 64 && self.timer < 40){
                self.toRemove = true;
            }
        }
        if(self.projectilePattern === 'homing'){
            var nearestEntity = null;
            for(var i in Player.list){
                if(Player.list[i].team !== self.team && Player.list[i].map === self.map && Player.list[i].hp > 0){
                    if(nearestEntity === null){
                        nearestEntity = Player.list[i];
                    }
                    else if(self.getDistance(Player.list[i]) < self.getDistance(nearestEntity)){
                        nearestEntity = Player.list[i];
                    }
                }
            }
            for(var i in Monster.list){
                if(Monster.list[i].team !== self.team && Monster.list[i].map === self.map && Monster.list[i].hp > 0){
                    if(nearestEntity === null){
                        nearestEntity = Monster.list[i];
                    }
                    else if(self.getDistance(Monster.list[i]) < self.getDistance(nearestEntity)){
                        nearestEntity = Monster.list[i];
                    }
                }
            }
            if(nearestEntity){
                var direction = Math.atan2(nearestEntity.y - self.y,nearestEntity.x - self.x) / Math.PI * 180;
                self.direction = self.direction % 360;
                if(direction - self.direction > 180){
                    self.direction += (direction - self.direction - 360) / 10;
                }
                else if(direction - self.direction < -180){
                    self.direction += (direction - self.direction - 360) / 10;
                }
                else{
                    self.direction += (direction - self.direction) / 10;
                }
                self.spdX = Math.cos(self.direction / 180 * Math.PI) * param.speed;
                self.spdY = Math.sin(self.direction / 180 * Math.PI) * param.speed;
            }
        }
    }
    self.updateCollisions = function(){
        var collisions = [];
        for(var i = -1;i < 2;i++){
            for(var j = -1;j < 2;j++){
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][self.zindex]){
                        if(Collision.list[self.map][self.zindex][self.gridX + i]){
                            if(Collision.list[self.map][self.zindex][self.gridX + i][self.gridY + j]){
                                var collision = Collision.list[self.map][self.zindex][self.gridX + i][self.gridY + j];
                                for(var k in collision){
                                    if(collision[k].info === 'noProjectileCollisions'){
                                        continue;
                                    }
                                    if(self.isColliding(collision[k])){
                                        collisions.push(collision[k]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if(collisions[0]){
            if(self.collisionType === 'remove'){
                self.toRemove = true;
            }
            else if(self.collisionType === 'sticky'){
                self.spdX = 0;
                self.spdY = 0;
                self.x = self.lastX;
                self.y = self.lastY;
            }
        }
    }
    var getInitPack = self.getInitPack;
    self.getInitPack = function(){
        var pack = getInitPack();
        if(self.relativeToParent){
            if(self.parentType === 'Player'){
                if(Player.list[self.parent]){
                    pack.x = self.x - Player.list[self.parent].x;
                    pack.y = self.y - Player.list[self.parent].y;
                }
            }
            else if(self.parentType === 'Monster'){
                if(Monster.list[self.parent]){
                    pack.x = self.x - Monster.list[self.parent].x;
                    pack.y = self.y - Monster.list[self.parent].y;
                }
            }
        }
        else{
            pack.x = self.x;
            pack.y = self.y;
        }
        pack.width = self.width;
        pack.height = self.height;
        pack.projectileType = self.projectileType;
        pack.parent = self.parent;
        pack.parentType = self.parentType;
        pack.relativeToParent = self.relativeToParent;
        pack.animations = self.animations;
        pack.animation = self.animation;
        pack.type = self.type;
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
        else if(i === 'itemDrops'){
            self[i] = Object.create(monsterData[self.monsterType][i]);
        }
        else{
            self[i] = monsterData[self.monsterType][i];
        }
    }
    self.changeSize();

    self.hp = self.hpMax;

    self.target = null;
    self.damaged = false;

    self.type = 'Monster';

    self.aggro = 6;
    self.attackState = 'passive';
    self.attackPhase = 1;

    self.spawnId = param.spawnId;

    self.trackTime = 100;
    self.randomPos = {
        x:self.x,
        y:self.y,
        timeX:0,
        timeY:0,
        walkTimeX:100,
        walkTimeY:100,
        waitTimeX:60,
        waitTimeY:60,
    };

    self.mainReload = 0;
    self.passiveReload = 0;
    
    self.randomWalk(true);
    self.onHit = function(pt){
        if(self.target === null){
            self.target = pt.parent;
            self.damaged = true;
        }
    }
    self.update = function(){
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.trackTarget();
            self.updateMove();
            if(self.canMove){
                self.updatePosition();
            }
            self.updateCollisions();
        }
        self.x = Math.round(self.x);
        self.y = Math.round(self.y);
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
                    self.spdX = 0;
                    self.spdY = 0;
                }
                else if(Player.list[self.target].team === self.team){
                    self.target = null;
                    self.spdX = 0;
                    self.spdY = 0;
                }
                else if(Player.list[self.target].map !== self.map){
                    self.target = null;
                    self.spdX = 0;
                    self.spdY = 0;
                }
                else{
                    if(self.getSquareDistance(Player.list[self.target]) > self.aggro * 2 && self.damaged === false){
                        self.target = null;
                        self.spdX = 0;
                        self.spdY = 0;
                    }
                }
            }
            else{
                self.target = null;
                self.spdX = 0;
                self.spdY = 0;
            }
            if(self.getSquareDistance(self.randomPos) > 16){
                self.target = null;
                self.trackPos(self.randomPos.x,self.randomPos.y);
            }
        }
        else{
            for(var i in Player.list){
                if(Player.list[i].map === self.map){
                    if(Player.list[i].team !== self.team){
                        if(Player.list[i].hp > 0){
                            if(self.getSquareDistance(Player.list[i]) < self.aggro && Player.list[i].getSquareDistance(self.randomPos) <= 16){
                                if(Player.list[i])
                                self.target = i;
                                self.damaged = false;
                            }
                        }
                    }
                }
            }
        }
    }
    self.trackTarget = function(){
        if(self.target){
            if(Player.list[self.target]){
                self.spdX = 0;
                self.spdY = 0;
                var size = 33;
                var dx = self.gridX - size / 2 + 0.5;
                var dy = self.gridY - size / 2 + 0.5;
                var tx = Player.list[self.target].gridX - dx;
                var ty = Player.list[self.target].gridY - dy;
                self.trackTime += 1;
                if(self.trackTime > 50 + 50 * Math.random()){
                    self.trackTime = 0;
                    var finder = new PF.BiAStarFinder({
                        allowDiagonal:true,
                        dontCrossCorners:true,
                    });
                    var grid = new PF.Grid(size,size);
                    for(var i = 0;i < size;i++){
                        for(var j = 0;j < size;j++){
                            var x = dx + i;
                            var y = dy + j;
                            if(Collision.list[self.map]){
                                if(Collision.list[self.map][self.zindex]){
                                    if(Collision.list[self.map][self.zindex][x]){
                                        if(Collision.list[self.map][self.zindex][x][y]){
                                            grid.setWalkableAt(i,j,false);
                                        }
                                    }
                                }
                            }
                            if(RegionChanger.list[self.map]){
                                if(RegionChanger.list[self.map][x]){
                                    if(RegionChanger.list[self.map][x][y]){
                                        if(RegionChanger.list[self.map][x][y].noMonster){
                                            grid.setWalkableAt(i,j,false);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    var nx = self.gridX - dx;
                    var ny = self.gridY - dy;
                    if(tx < size && tx > 0 && ty < size && ty > 0){
                        var path = finder.findPath(nx,ny,tx,ty,grid);
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
        }
        else{
            if(self.spdX === 0 && self.randomPos.timeX > self.randomPos.walkTimeX){
                self.spdX = Math.round(Math.random() * 2 - 1);
                self.randomPos.timeX = 0;
                self.randomPos.waitTimeX = 100 * Math.random() + 100;
            }
            else if(self.spdX !== 0 && self.randomPos.timeX > self.randomPos.waitTimeX){
                self.spdX = 0;
                self.randomPos.timeX = 0;
                self.randomPos.walkTimeX = 200 * Math.random() + 200;
            }
            if(self.spdY === 0 && self.randomPos.timeY > self.randomPos.walkTimeY){
                self.spdY = Math.round(Math.random() * 2 - 1);
                self.randomPos.timeY = 0;
                self.randomPos.waitTimeY = 100 * Math.random() + 100;
            }
            else if(self.spdY !== 0 && self.randomPos.timeY > self.randomPos.waitTimeY){
                self.spdY = 0;
                self.randomPos.timeY = 0;
                self.randomPos.walkTimeY = 200 * Math.random() + 200;
            }
            self.randomPos.timeX += 1;
            self.randomPos.timeY += 1;
        }
    }
    self.updateAttack = function(){
        if(!self.target){
            self.mainReload = 0;
            self.passiveReload = 0;
            return;
        }
        self.mainReload += 1;
        self.passiveReload += 1;
        self.direction = Math.atan2(Player.list[self.target].y - self.y,Player.list[self.target].x - self.x) / Math.PI * 180;
        self.doAttack(self.mainAttackData,self.mainReload);
        self.doAttack(self.passiveAttackData,self.passiveReload);
    }
    var getInitPack = self.getInitPack;
    self.getInitPack = function(){
        var pack = getInitPack();
        pack.monsterType = self.monsterType;
        pack.type = self.type;
        return pack;
    }
    Monster.list[self.id] = self;
    return self;
}
Monster.list = {};

Npc = function(param){
    var self = Actor(param);
    self.changeSize();
    self.randomWalk(true);
    self.update = function(){
        self.mapChange += 1;
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateMove();
            if(self.canMove){
                self.updatePosition();
            }
            self.updateCollisions();
        }
        self.x = Math.round(self.x);
        self.y = Math.round(self.y);
        self.updateAnimation();
        if(self.mapChange === 0){
            self.canMove = false;
        }
        if(self.mapChange === 5){
            self.map = self.transporter.teleport;
            if(self.transporter.teleportx !== -1){
                self.x = self.transporter.teleportx;
            }
            if(self.transporter.teleporty !== -1){
                self.y = self.transporter.teleporty;
            }
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
    Npc.list[self.id] = self;
    return self;
}
Npc.list = {};

HarvestableNpc = function(param){
    var self = Entity(param);
    self.img = param.img;
    for(var i in harvestableNpcData[self.img]){
        self[i] = harvestableNpcData[self.img][i];
    }
    self.x += self.offsetX;
    self.y += self.offsetY;
    self.harvestHpMax = self.harvestHp;
    self.collisionId = Math.random();
    for(var i in self.collisions){
        Collision.add({
            x:self.x + self.collisions[i].x,
            y:self.y + self.collisions[i].y,
            map:self.map,
            width:self.collisions[i].width,
            height:self.collisions[i].height,
            info:'',
            type:'Collision',
            zindex:0,
        },self.collisionId);
    }
    self.timer = 0;
    self.update = function(){
        if(self.timer === 0){
            self.img = param.img;
            self.new = true;
            self.harvestHp = self.harvestHpMax;
            for(var i in self.collisions){
                Collision.add({
                    x:self.x + self.collisions[i].x,
                    y:self.y + self.collisions[i].y,
                    map:self.map,
                    width:self.collisions[i].width,
                    height:self.collisions[i].height,
                    info:'',
                    type:'Collision',
                    zindex:0,
                },self.collisionId);
            }
        }
        self.timer -= 1;
    }
    self.dropItems = function(pt){
        if(!Player.list[pt]){
            return;
        }
        for(var i in self.itemDrops){
            if(Math.random() < self.itemDrops[i].chance * Player.list[pt].luck){
                var amount = Math.round(self.itemDrops[i].amount * (Math.random() + 0.5) * Player.list[pt].luck);
                while(amount > 0){
                    amount -= 1;
                    new DroppedItem({
                        x:self.x,
                        y:self.y,
                        map:self.map,
                        item:i,
                        amount:1,
                        parent:pt,
                        allPlayers:false,
                    });
                }
            }
        }
        self.img = 'none';
        self.toRemove = true;
        for(var i in self.collisions){
            Collision.remove({
                x:self.x + self.collisions[i].x,
                y:self.y + self.collisions[i].y,
                map:self.map,
                width:self.collisions[i].width,
                height:self.collisions[i].height,
                info:'',
                type:'Collision',
                zindex:0,
            },self.collisionId);
        }
        self.timer = Math.floor(2400 + 1200 * Math.random());
    }
    var getInitPack = self.getInitPack;
    self.getInitPack = function(){
        var pack = getInitPack();
        pack.width = self.width;
        pack.height = self.height;
        pack.img = self.img;
        pack.harvestHpMax = self.harvestHpMax;
        pack.harvestHp = self.harvestHp;
        pack.type = self.type;
        return pack;
    }
    HarvestableNpc.list[self.id] = self;
    return self;
}
HarvestableNpc.list = {};

DroppedItem = function(param){
	var self = Entity(param);
	self.id = Math.random();
    self.parent = param.parent;
    self.width = 48;
    self.height = 48;
    self.x += 128 * Math.random() - 64;
    self.y += 128 * Math.random() - 64;
    self.allPlayers = param.allPlayers;
    self.timer = 6000;
    self.item = param.item;
    self.amount = param.amount;
    self.toRemove = false;
    self.type = 'DroppedItem';
	var super_update = self.update;
	self.update = function(){
        super_update();
        self.timer -= 1;
        if(self.timer <= 0){
            self.toRemove = true;
        }
    }
    var getInitPack = self.getInitPack;
    self.getInitPack = function(){
        var pack = getInitPack();
        pack.item = self.item;
        pack.amount = self.amount;
        pack.parent = self.parent;
        pack.allPlayers = self.allPlayers;
        pack.type = self.type;
        return pack;
    }
	DroppedItem.list[self.id] = self;
	return self;
}
DroppedItem.list = {};

require('./maps.js');