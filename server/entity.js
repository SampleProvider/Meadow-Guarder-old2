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
    30000,
    50000,
    75000,
    100000,
    150000,
    230000,
    370000,
    550000,
    780000,
    1000000,
    10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
];

var hpLevels = [
    100,
    110,
    120,
    135,
    150,
    165,
    180,
    200,
    220,
    240,
    255,
    280,
    305,
    335,
    365,
    410,
    455,
    505,
    565,
    630,
    10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
];

var manaLevels = [
    100,
    110,
    120,
    135,
    150,
    165,
    180,
    200,
    220,
    240,
    255,
    280,
    305,
    335,
    365,
    410,
    455,
    505,
    565,
    630,
    10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
];


ENV = {
    spawnpoints:{}
}

var PF = require('pathfinding');

playerMap = {};

debugData = require('./debug.json');

npcData = require('./../client/data/npcs.json');
attackData = require('./../client/data/attacks.json');
monsterData = require('./../client/data/monsters.json');
projectileData = require('./../client/data/projectiles.json');
songData = require('./../client/data/songs.json');
harvestableNpcData = require('./../client/data/harvestableNpcs.json');

quests = {};

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
            pt.dropItems();
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
        self.updateGridPosition();
        self.x = Math.round(self.x);
        self.y = Math.round(self.y);
    }
    self.updatePosition = function(){
        self.lastX = self.x;
        self.lastY = self.y;
        self.x += self.spdX;
        self.y += self.spdY;
    }
    self.updateGridPosition = function(){
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
            if(self.getSquareDistance(pt) / 2 >= self.width + self.height + pt.width + pt.height){
                return false;
            }
            if(pt.x + pt.width / 2 + pt.height / 2 <= self.x - self.width / 2 - self.height / 2){
                return false;
            }
            if(pt.x - pt.width / 2 - pt.height / 2 >= self.x + self.width / 2 + self.height / 2){
                return false;
            }
            if(pt.y + pt.width / 2 + pt.height / 2 <= self.y - self.width / 2 - self.height / 2){
                return false;
            }
            if(pt.y - pt.width / 2 - pt.height / 2 >= self.y + self.width / 2 + self.height / 2){
                return false;
            }
            if(self.vertices.length){
                var vertices = self.vertices;
            }
            else{
                var vertices = [
                    {x:(self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
                    {x:(self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (-self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (-self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
                    {x:(-self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (-self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(-self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (-self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
                    {x:(-self.width / 2) * Math.cos(self.direction / 180 * Math.PI) - (self.height / 2) * Math.sin(self.direction / 180 * Math.PI) + self.x,y:(-self.width / 2) * Math.sin(self.direction / 180 * Math.PI) + (self.height / 2) * Math.cos(self.direction / 180 * Math.PI) + self.y},
                    {x:self.x,y:self.y},
                ];
                self.vertices = vertices;
            }
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
        pack.width = self.width;
        pack.height = self.height;
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

    self.collided = {x:false,y:false};

    self.trackingPath = [];

    self.drawSize = 'medium';

    self.name = param.name || 'null';

    self.maxSpeed = 10;
    self.moveSpeed = 10;

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

    self.team = 'Human';

    self.canMove = true;
    self.canCollide = true;
    self.canAttack = param.canAttack !== undefined ? param.canAttack : true;
    self.showHealthBar = true;

    self.dashing = false;
    self.dashTime = 0;
    self.dashX = 0;
    self.dashY = 0;

    self.projectilesHit = {};

    self.playersDamaged = {};

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
            pt.canAttack = false;
        }
    }
    self.updateMove = function(){
        if(self.dashing){
            if(self.dashTime <= 0){
                self.dashing = false;
            }
            else{
                self.spdX = self.dashX;
                self.spdY = self.dashY;
                self.dashTime -= 1;
            }
        }
        else if(self.trackingPath[0]){
            if(self.x < self.trackingPath[0][0] * 64 + self.width / 2){
                self.spdX = 1;
            }
            else if(self.x > self.trackingPath[0][0] * 64 + self.width / 2){
                self.spdX = -1;
            }
            else{
                self.spdX = 0;
            }
            if(self.y < self.trackingPath[0][1] * 64 + self.height / 2){
                self.spdY = 1;
            }
            else if(self.y > self.trackingPath[0][1] * 64 + self.height / 2){
                self.spdY = -1;
            }
            else{
                self.spdY = 0;
            }
            if(self.spdX === 0 && self.spdY === 0){
                self.trackingPath.shift();
            }
        }
        for(var i in self.projectilesHit){
            self.projectilesHit[i] -= 1;
            if(self.projectilesHit[i] <= 0){
                delete self.projectilesHit[i];
            }
        }
    }
    self.canSee = function(pt){
        if(pt.map !== self.map){
            return;
        }
        var getYValue = function(x){
            var slope = (self.y - pt.y) / (self.x - pt.x);
            return self.y + (x - self.x) * slope;
        }
        if(self.gridX > pt.gridX){
            for(var i = self.gridX;i >= pt.gridX;i--){
                if(i === self.gridX){
                    var lastY = self.gridY;
                    var y = Math.floor(getYValue(i * 64 - 64) / 64);
                }
                else{
                    var lastY = Math.floor(getYValue(i * 64) / 64);
                    var y = Math.floor(getYValue(i * 64 - 64) / 64);
                }
                if(lastY > y){
                    for(var j = lastY;j >= y;j--){
                        if(Collision.list[self.map]){
                            if(Collision.list[self.map][self.zindex]){
                                if(Collision.list[self.map][self.zindex][i]){
                                    if(Collision.list[self.map][self.zindex][i][j]){
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
                else{
                    for(var j = lastY;j <= y;j++){
                        if(Collision.list[self.map]){
                            if(Collision.list[self.map][self.zindex]){
                                if(Collision.list[self.map][self.zindex][i]){
                                    if(Collision.list[self.map][self.zindex][i][j]){
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else{
            for(var i = self.gridX;i <= pt.gridX;i++){
                if(i === self.gridX){
                    var lastY = self.gridY;
                    var y = Math.floor(getYValue(i * 64 + 64) / 64);
                }
                else{
                    var lastY = Math.floor(getYValue(i * 64) / 64);
                    var y = Math.floor(getYValue(i * 64 + 64) / 64);
                }
                if(lastY > y){
                    for(var j = lastY;j >= y;j--){
                        if(Collision.list[self.map]){
                            if(Collision.list[self.map][self.zindex]){
                                if(Collision.list[self.map][self.zindex][i]){
                                    if(Collision.list[self.map][self.zindex][i][j]){
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
                else{
                    for(var j = lastY;j <= y;j++){
                        if(Collision.list[self.map]){
                            if(Collision.list[self.map][self.zindex]){
                                if(Collision.list[self.map][self.zindex][i]){
                                    if(Collision.list[self.map][self.zindex][i][j]){
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return true;
    }
    self.trackPos = function(x,y){
        var size = 65;
        var dx = Math.floor(self.x / 64 - self.width / 128) - size / 2 + 0.5;
        var dy = Math.floor(self.y / 64 - self.height / 128) - size / 2 + 0.5;
        var tx = Math.floor(x / 64) - dx;
        var ty = Math.floor(y / 64) - dy;
        var finder = new PF.BiAStarFinder({
            allowDiagonal:true,
            dontCrossCorners:true,
        });
        var grid = new PF.Grid(size,size);
        for(var i = 0;i < size;i++){
            for(var j = 0;j < size;j++){
                var setWalkableAt = function(){
                    for(var k = -self.width / 64 + 1;k < 1;k++){
                        for(var l = -self.height / 64 + 1;l < 1;l++){
                            if(i + k >= 0 && i + k < size && j + l >= 0 && j + l < size){
                                grid.setWalkableAt(i + k,j + l,false);
                            }
                        }
                    }
                }
                var x = dx + i;
                var y = dy + j;
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][self.zindex]){
                        if(Collision.list[self.map][self.zindex][x]){
                            if(Collision.list[self.map][self.zindex][x][y]){
                                setWalkableAt();
                            }
                        }
                    }
                }
                if(self.type === 'Monster'){
                    if(RegionChanger.list[self.map]){
                        if(RegionChanger.list[self.map][x]){
                            if(RegionChanger.list[self.map][x][y]){
                                if(RegionChanger.list[self.map][x][y].noMonster){
                                    setWalkableAt();
                                }
                            }
                        }
                    }
                }
            }
        }
        var nx = Math.floor(size / 2);
        var ny = Math.floor(size / 2);
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
        if(self.canMove === false || self.inDialogue === true){
            self.animation = 0;
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
                    self.zindex += Slope.list[self.map][self.gridX][self.gridY];
                }
            }
        }
        var collisions = [];
        for(var i = Math.floor((self.x - self.width / 2) / 64);i <= Math.floor((self.x + self.width / 2) / 64);i++){
            for(var j = Math.floor((self.y - self.height / 2) / 64);j <= Math.floor((self.y + self.height / 2) / 64);j++){
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][self.zindex]){
                        if(Collision.list[self.map][self.zindex][i]){
                            if(Collision.list[self.map][self.zindex][i][j]){
                                var collision = Collision.list[self.map][self.zindex][i][j];
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
                        self.collided = {x:true,y:true};
                    }
                    else{
                        self.collided = {x:false,y:true};
                    }
                }
                else{
                    self.collided = {x:true,y:false};
                }
            }
        }
        else{
            self.collided = {x:false,y:false};
        }
        if(self.canMove && self.type !== 'Monster'){
            for(var i = Math.floor((self.x - self.width / 2) / 64);i <= Math.floor((self.x + self.width / 2) / 64);i++){
                for(var j = Math.floor((self.y - self.height / 2) / 64);j <= Math.floor((self.y + self.height / 2) / 64);j++){
                    if(Transporter.list[self.map]){
                        if(Transporter.list[self.map][i]){
                            if(Transporter.list[self.map][i][j]){
                                var transporter = Transporter.list[self.map][i][j];
                                if(self.isColliding(transporter)){
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
        if(self.hp <= 0){
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
    }
    self.onHit = function(pt){
        if(pt.sameId === false){
            self.projectilesHit[pt.id] = 10;
        }
    }
    self.dropItems = function(){
        var playersPercentage = {};
        var totalDamage = 0;
        for(var i in self.playersDamaged){
            if(Player.list[i]){
                playersPercentage[i] = self.playersDamaged[i];
                totalDamage += self.playersDamaged[i];
                for(var j in Player.list[i].questTasks){
                    if(Player.list[i].questTasks[j].id === 'monster' && Player.list[i].questTasks[j].name === self.name){
                        Player.list[i].questTasks[j].amount += 1;
                        if(Player.list[i].questTasks[j].amount === Player.list[i].questTasks[j].target){
                            Player.list[i].questTasks[j].completed = true;
                            Player.list[i].updateQuest(Player.list[i]);
                        }
                    }
                }
            }
        }
        for(var i in playersPercentage){
            playersPercentage[i] /= totalDamage;
        }
        for(var i in playersPercentage){
            for(var j in self.itemDrops){
                if(Math.random() < self.itemDrops[j].chance * Player.list[i].luck){
                    var amount = Math.round(self.itemDrops[j].amount * (Math.random() + 0.5) * Player.list[i].luck * playersPercentage[i]);
                    if(j === 'random'){
                        var numItems = 0;
                        for(var k in Item.list){
                            if(Item.list[k].type === 'Material'){
                                numItems += 1;
                            }
                        }
                        var randomItem = Math.floor(Math.random() * numItems);
                        numItems = 0;
                        for(var k in Item.list){
                            if(Item.list[k].type === 'Material'){
                                if(numItems === randomItem){
                                    while(amount > 0){
                                        var amountRemoved = Math.ceil(Math.random() * amount);
                                        amount -= amountRemoved;
                                        new DroppedItem({
                                            x:self.x,
                                            y:self.y,
                                            map:self.map,
                                            item:k,
                                            amount:amountRemoved,
                                            parent:i,
                                            allPlayers:false,
                                        });
                                    }
                                }
                                numItems += 1;
                            }
                        }
                    }
                    else{
                        while(amount > 0){
                            var amountRemoved = Math.ceil(Math.random() * amount);
                            amount -= amountRemoved;
                            new DroppedItem({
                                x:self.x,
                                y:self.y,
                                map:self.map,
                                item:j,
                                amount:amountRemoved,
                                parent:i,
                                allPlayers:false,
                            });
                        }
                    }
                }
            }
            Player.list[i].xp += parseInt(Math.ceil(Math.random() * 15 * playersPercentage[i]));
        }
    }
    self.onDamage = function(pt){
        if(self.invincible === true){
            return;
        }
        if(pt.sameId === false && self.projectilesHit[pt.id]){
            return;
        }
        var hp = self.hp;
        var crit = false;
        if(Math.random() < pt.stats.critChance){
            crit = true;
            self.hp -= Math.max(Math.floor((pt.stats.damage * (0.8 + Math.random() * 0.4) * (1 + pt.stats.critPower) - self.stats.defense)),0);
        }
        else{
            self.hp -= Math.max(Math.floor(pt.stats.damage * (0.8 + Math.random() * 0.4) - self.stats.defense),0);
        }
        self.hp = Math.round(self.hp);
        if(pt.type === 'Projectile' && pt.parentType === 'Player'){
            if(self.playersDamaged[pt.parent]){
                self.playersDamaged[pt.parent] += Math.ceil(hp - Math.max(self.hp,0));
            }
            else{
                self.playersDamaged[pt.parent] = Math.max(Math.ceil(hp - Math.max(self.hp,0)),1);
            }
        }
        if(self.hp < 1 && hp > 0){
            self.onDeath(self,pt);
            if(self.type !== 'Player'){
                self.toRemove = true;
            }
        }
        if(hp > 0){
            if(Math.round(hp - self.hp) !== 0){
                for(var i in SOCKET_LIST){
                    if(Player.list[i]){
                        if(Player.list[i].map === self.map){
                            if(Player.list[i].getSquareDistance(self) < 32){
                                SOCKET_LIST[i].emit('createParticle',{
                                    x:self.x,
                                    y:self.y,
                                    map:self.map,
                                    particleType:crit === true ? 'critDamage' : 'damage',
                                    number:1,
                                    value:Math.round(hp - self.hp),
                                });
                            }
                        }
                    }
                }
            }
        }
        self.onHit(pt);
        if(pt.type === 'Projectile'){
            pt.onHit(self);
        }
    }
    self.shootProjectile = function(projectileType,param){
        var direction = param.direction !== undefined ? param.direction / 180 * Math.PI + self.direction / 180 * Math.PI : self.direction / 180 * Math.PI;
        direction += param.directionDeviation !== undefined ? Math.random() * param.directionDeviation / 180 * Math.PI - param.directionDeviation / 180 * Math.PI / 2 : 0;
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
            parentName:self.name,
            x:param.x !== undefined ? param.x : param.distance !== undefined ? projectileData[projectileType] !== undefined ? self.x + Math.cos(direction) * (param.distance + projectileData[projectileType].width * 2) : self.x + Math.cos(direction) * (param.distance + 48) : projectileData[projectileType] !== undefined ? self.x + Math.cos(direction) * projectileData[projectileType].width * 2 : self.x + Math.cos(direction) * 48,
            y:param.y !== undefined ? param.y : param.distance !== undefined ? projectileData[projectileType] !== undefined ? self.y + Math.sin(direction) * (param.distance + projectileData[projectileType].width * 2) : self.y + Math.sin(direction) * (param.distance + 48) : projectileData[projectileType] !== undefined ? self.y + Math.sin(direction) * projectileData[projectileType].width * 2 : self.y + Math.sin(direction) * 48,
            spdX:param.speed !== undefined ? Math.cos(direction) * param.speed : Math.cos(direction) * 20,
            spdY:param.speed !== undefined ? Math.sin(direction) * param.speed : Math.sin(direction) * 20,
            speed:param.speed !== undefined ? param.speed : 20,
            direction:direction * 180 / Math.PI,
            spin:param.spin !== undefined ? param.spin : 0,
            map:self.map,
            projectileType:projectileType,
            pierce:param.pierce !== undefined ? param.pierce : 1,
            timer:param.timer !== undefined ? param.timer : 40,
            relativeToParent:param.relativeToParent !== undefined ? param.relativeToParent : false,
            parentType:param.parentType !== undefined ? param.parentType : self.type,
            projectilePattern:param.projectilePattern !== undefined ? param.projectilePattern : false,
            collisionType:param.collisionType !== undefined ? param.collisionType : false,
            zindex:param.zindex !== undefined ? param.zindex : self.zindex,
            team:param.team !== undefined ? param.team : self.team,
            stats:stats,
        };
        var projectile = new Projectile(properties);
        return projectile;
    }
    self.dash = function(param){
        if(self.dashing === true){
            return;
        }
        self.dashing = true;
        self.dashTime = param.time !== undefined ? param.time : 10;
        var direction = param.direction !== undefined ? param.direction / 180 * Math.PI + self.direction / 180 * Math.PI : self.direction / 180 * Math.PI;
        direction += param.directionDeviation !== undefined ? Math.random() * param.directionDeviation / 180 * Math.PI - param.directionDeviation / 180 * Math.PI / 2 : 0;
        var dashX = Math.cos(direction);
        var dashY = Math.sin(direction);
        var dashDistance = param.dashDistance !== undefined ? param.dashDistance * 64 : 256;
        self.dashX = dashDistance / self.dashTime * dashX;
        self.dashY = dashDistance / self.dashTime * dashY;
    }
    self.doAttack = function(data,reload){
        if(self.canAttack === false){
            return;
        }
        for(var i in data){
            if(reload % parseInt(i) === 0){
                for(var j = 0;j < data[i].length;j++){
                    if(data[i][j]){
                        switch(data[i][j].id){
                            case "projectile":
                                self.shootProjectile(data[i][j].projectileType,data[i][j].param);
                                break;
                            case "dash":
                                self.dash(data[i][j].param);
                                break;
                            case "music":
                                for(var k in Player.list){
                                    SOCKET_LIST[k].emit('musicBox',data[i][j].songName);
                                }
                                addToChat('#00ffff',self.name + ' started the music ' + songData[data[i][j].songName].name + '.');
                                break;
                        }
                        if(data[i][j].xpGain){
                            if(self.type === 'Player'){
                                self.xp += data[i][j].xpGain;
                            }
                        }
                        if(data[i][j].hpCost){
                            if(self.hp > data[i][j].hpCost){
                                self.hp -= data[i][j].hpCost;
                            }
                            else{
                                if(self.hp > 0){
                                    self.hp = 0;
                                    self.onDeath(self,'self');
                                    if(self.type !== 'Player'){
                                        self.toRemove = true;
                                    }
                                    return;
                                }
                            }
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
        if(self.hp <= 0){
            return;
        }
        self.hp += self.stats.hpRegen / 20;
        self.hp = Math.min(self.hpMax,self.hp);
        if(self.hp <= 0){
            self.hp = 0;
            self.onDeath(self,'self');
            if(self.type !== 'Player'){
                self.toRemove = true;
            }
            return;
        }
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
        pack.canAttack = self.canAttack;
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
    };
    self.secondKeyMap = {
        up:'ArrowUp',
        down:'ArrowDown',
        left:'ArrowLeft',
        right:'ArrowRight',
        leftClick:'q',
        rightClick:'e',
    };
    self.thirdKeyMap = {
        up:'W',
        down:'S',
        left:'A',
        right:'D',
        leftClick:'Q',
        rightClick:'E',
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

    self.regionChanger = {};
    self.worldRegion = 'Altoris Island';

    self.x = ENV.spawnpoints[self.worldRegion].x;
    self.y = ENV.spawnpoints[self.worldRegion].y;
    self.map = ENV.spawnpoints[self.worldRegion].map;

    self.type = 'Player';

    self.canMove = false;
    self.invincible = true;
    self.canAttack = false;

    self.hp = 100;
    self.hpMax = 100;
    self.xp = 0;
    self.xpMax = 100;
    self.mana = 100;
    self.manaMax = 100;
    self.lastUsedMana = 0;

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

    self.tradingEntity = null;
    self.acceptedTrade = false;
    self.finalAcceptedTrade = false;

    self.lastChat = 0;
    self.chatWarnings = 0;
    self.textColor = '#000000';

    if(debugData[self.name]){
        self.textColor = debugData[self.name].color;
    }

    self.inDialogue = false;
    self.dialogueMessage = {};

    self.loggedOn = false;

    self.debug = {
        invisible:false,
        invincible:false,
    }

    self.inventory = new Inventory(socket,true);
    if(param.database.items){
        for(var i in param.database.items){
            if(typeof param.database.items[i] === 'object'){
                if(Item.list[param.database.items[i].id]){
                    self.inventory.items[i] = param.database.items[i];
                }
            }
        }
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

    self.quest = false;
    self.questStage = 0;
    self.questTasks = [];

    self.advancements = {};
    if(param.database.advancements){
        for(var i in param.database.advancements){
            self.advancements[i] = param.database.advancements[i];
        }
    }
    if(self.img.body === 'Undead' || self.img.body === 'Orc'){
        self.team = 'Undead';
    }
    else{
        self.team = 'Human';
    }
    self.xpMax = xpLevels[self.level];
    self.hpMax = hpLevels[self.level];
    self.hp = self.hpMax;
    self.manaMax = manaLevels[self.level];
    self.mana = self.manaMax;
    self.inventory.refreshInventory();

    if(param.database.worldRegion){
        self.worldRegion = param.database.worldRegion;
    }
    
    if(ENV.spawnpoints[self.worldRegion]){
        self.x = ENV.spawnpoints[self.worldRegion].x;
        self.y = ENV.spawnpoints[self.worldRegion].y;
        self.map = ENV.spawnpoints[self.worldRegion].map;
    }

    playerMap[self.map] += 1;
    self.onDeath = function(pt,entity){
        pt.canMove = false;
        pt.keyPress = {
            left:false,
            right:false,
            up:false,
            down:false,
            leftClick:false,
            rightClick:false,
        }
        for(var i in SOCKET_LIST){
            if(Player.list[i]){
                if(Player.list[i].map === pt.map){
                    SOCKET_LIST[i].emit('createParticle',{
                        x:pt.x,
                        y:pt.y,
                        map:pt.map,
                        particleType:'death',
                        number:40,
                    });
                }
            }
        }
        SOCKET_LIST[pt.id].emit('death');
        if(entity){
            if(entity === 'self'){
                addToChat('#ff0000',pt.name + ' committed suicide.');
            }
            else if(entity.name){
                addToChat('#ff0000',pt.name + ' was killed by ' + entity.name + '.');
            }
            else if(entity.parentName){
                addToChat('#ff0000',pt.name + ' was killed by ' + entity.parentName + '.');
            }
            else{
                addToChat('#ff0000',pt.name + ' died.');
            }
        }
    }
    self.update = function(){
        self.updateDebug();
        self.mapChange += 1;
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateSpd();
            self.updateMove();
            if(self.canMove && self.inDialogue === false){
                self.updatePosition();
            }
            self.updateGridPosition();
            self.updateCollisions();
        }
        self.x = Math.round(self.x);
        self.y = Math.round(self.y);
        self.updateStats();
        self.updateXp();
        self.updateAnimation();
        self.updateAttack();
        self.updateHp();
        self.updateMana();
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
        if(self.keyPress.leftClick === true && self.canAttack && self.hp > 0){
            self.passiveReload += 1;
            self.doAttack(self.passiveAttackData,self.passiveReload);
            if(self.inventory.items[self.inventory.hotbarSelectedItem]){
                if(self.inventory.items[self.inventory.hotbarSelectedItem].id){
                    if(Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].equip === 'consume' || Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].equip === 'hotbar'){
                        if(self.inventory.items[self.inventory.hotbarSelectedItem].cooldown === 0 || self.inventory.items[self.inventory.hotbarSelectedItem].cooldown === undefined){
                            var hasMana = true;
                            if(Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].manaCost){
                                if(self.mana >= Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].manaCost){
                                    self.mana -= Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].manaCost;
                                }
                                else{
                                    hasMana = false;
                                }
                            }
                            if(hasMana){
                                for(var i in self.inventory.items){
                                    if(self.inventory.items[i].id){
                                        if(Item.list[self.inventory.items[i].id].type === Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].type){
                                            self.inventory.items[i].cooldown = Item.list[self.inventory.items[i].id].useTime;
                                        }
                                    }
                                }
                                self.mainReload += 1;
                                self.doAttack(self.mainAttackData,self.mainReload);
                                socket.emit('attack');
                                self.lastUsedMana = 0;
                                if(Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].equip === 'consume'){
                                    self.inventory.items[self.inventory.hotbarSelectedItem].amount -= 1;
                                    if(self.inventory.items[self.inventory.hotbarSelectedItem].amount <= 0){
                                        self.inventory.items[self.inventory.hotbarSelectedItem] = {};
                                    }
                                    self.inventory.refreshItem(self.inventory.hotbarSelectedItem);
                                }
                            }
                        }
                    }
                }
            }
        }
        for(var i in self.inventory.items){
            if(typeof self.inventory.items[i] === 'object'){
                if(self.inventory.items[i].id){
                    if(self.inventory.items[i].cooldown > 0){
                        self.inventory.items[i].cooldown -= 1;
                    }
                }
            }
        }
        socket.emit('nextReload');
    }
    self.updateStats = function(){
        if(self.inventory.updateStats){
            self.inventory.updateStats = false;

            for(var i in Projectile.list){
                if(Projectile.list[i].id === self.id){
                    delete Projectile.list[i];
                }
            }

            var hp = self.hp;
            var hpMax = self.hpMax;
            var manaMax = self.manaMax;

            self.hpMax = hpLevels[self.level];
            self.manaMax = manaLevels[self.level];
            
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
                            if(item.critPower !== undefined){
                                self.stats.critPower += item.critPower;
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
                else if(i.slice(0,5) !== 'trade'){
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
                            self.stats.damage += item.damage;
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
                        if(item.critChance !== undefined){
                            self.stats.critChance += item.critChance;
                        }
                        if(item.critPower !== undefined){
                            self.stats.critPower += item.critPower;
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
                self.inventory.refreshMenu(maxSlots);
            }

            self.hp += self.hpMax - hpMax;
            self.mana += self.manaMax - manaMax;

            if(self.hp <= 0 && hp > 0){
                self.onDeath(self,'self');
            }
        }
    }
    self.updateHarvest = function(){
        if(self.pickaxePower > 0 || self.axePower > 0 || self.scythePower > 0){
            for(var i in HarvestableNpc.list){
                if(HarvestableNpc.list[i].img !== 'none'){
                    if(self.getSquareDistance({x:self.mouseX,y:self.mouseY}) <= 2){
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
    self.updateXp = function(){
        if(self.xp >= self.xpMax){
            if(xpLevels[self.level]){
                self.level += 1;
                self.xpMax = xpLevels[self.level];
                addToChat('#00ff00',self.name + ' is now level ' + self.level + '.');
                self.xp -= xpLevels[self.level - 1];
                self.inventory.updateStats = true;
                self.updateStats();
            }
            else{
                self.xpMax = self.xp;
            }
        }
    }
    self.updateMana = function(){
        self.mana += self.stats.manaRegen / 20 * (self.lastUsedMana / 5);
        self.mana = Math.min(self.manaMax,self.mana);
        self.lastUsedMana += 1;
    }
    self.updateDebug = function(){
        if(self.debug.invincible){
            self.invincible = true;
        }
    }
    self.pickUpItems = function(){
        if(self.canMove){
            for(var i in DroppedItem.list){
                if(DroppedItem.list[i].parent + '' === self.id + '' || DroppedItem.list[i].allPlayers){
                    if(self.getSquareDistance(DroppedItem.list[i]) < 32){
                        if(DroppedItem.list[i].isColliding({x:self.mouseX,y:self.mouseY,width:0,height:0,map:self.map,type:'Player'})){
                            if(self.inventory.hasSpace(DroppedItem.list[i].item,DroppedItem.list[i].amount).hasSpace){
                                self.inventory.addItem(DroppedItem.list[i].item,DroppedItem.list[i].amount);
                                self.keyPress.leftClick = false;
                                delete DroppedItem.list[i];
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    self.startTrade = function(tradingEntity){
        if(tradingEntity.tradingEntity === null && self.tradingEntity === null && tradingEntity.id + '' !== self.id + ''){
            tradingEntity.tradingEntity = self.id;
            tradingEntity.acceptedTrade = false;
            tradingEntity.finalAcceptedTrade = false;
            self.tradingEntity = tradingEntity.id;
            self.acceptedTrade = false;
            self.finalAcceptedTrade = false;
            for(var i = 0;i < 18;i++){
                self.inventory.items['trade' + i] = {};
            }
            for(var i = 0;i < 18;i++){
                tradingEntity.inventory.items['trade' + i] = {};
            }
            socket.emit('openTrade',tradingEntity.name);
            SOCKET_LIST[tradingEntity.id].emit('openTrade',self.name);
            self.sendMessage('[!] Started trade with ' + tradingEntity.name + '.');
        }
    }
    self.updateTrade = function(pack){
        if(self.tradingEntity){
            if(Player.list[self.tradingEntity]){
                SOCKET_LIST[self.tradingEntity].emit('updateTrade',pack);
            }
        }
    }
    self.startDialogue = function(message){
        if(message.message === undefined){
            self.endDialogue();
            return;
        }
        self.dialogueMessage = message;
        var option1 = '';
        var option2 = '';
        var option3 = '';
        var option4 = '';
        if(message.option1){
            if(message.option1.message){
                option1 = message.option1.message;
            }
            else{
                option1 = message.option1;
            }
        }
        if(message.option2){
            if(message.option2.message){
                option2 = message.option2.message;
            }
            else{
                option2 = message.option2;
            }
        }
        if(message.option3){
            if(message.option3.message){
                option3 = message.option3.message;
            }
            else{
                option3 = message.option3;
            }
        }
        if(message.option4){
            if(message.option4.message){
                option4 = message.option4.message;
            }
            else{
                option4 = message.option4;
            }
        }
        socket.emit('dialogue',{
            message:message.message.replace('<name>',self.name),
            option1:option1.replace('<name>',self.name),
            option2:option2.replace('<name>',self.name),
            option3:option3.replace('<name>',self.name),
            option4:option4.replace('<name>',self.name),
        });
        self.inDialogue = true;
    }
    self.endDialogue = function(){
        self.dialogueMessage = {};
        socket.emit('dialogue',{});
        self.inDialogue = false;
    }
    self.updateQuest = function(){}
    self.startQuest = function(quest){
        if(self.quest === false){
            self.quest = quest;
            self.questStage = 0;
            self.questTasks = [];
            if(quests[self.quest]){
                self.updateQuest = quests[self.quest].updateQuest;
                self.completeQuest = quests[self.quest].completeQuest;
                self.abandonQuest = quests[self.quest].abandonQuest;
            }
            else{
                player = self;
                require('./../client/data/quests/' + self.quest + '.js');
                self.updateQuest = quests[self.quest].updateQuest;
                self.completeQuest = quests[self.quest].completeQuest;
                self.abandonQuest = quests[self.quest].abandonQuest;
            }
            self.updateQuest(self);
        }
    }
    self.completeQuest = function(){

    }
    self.abandonQuest = function(){

    }
    self.setQuestTasks = function(tasks){
        self.questTasks = tasks;
        for(var i in self.questTasks){
            if(self.questTasks[i].amount !== undefined){
                if(self.questTasks[i].amount === '<current>'){
                    switch(self.questTasks[i].id){
                        case "obtain":
                            self.questTasks[i].amount = self.inventory.hasItem(self.questTasks[i].name,1);
                            break;
                    }
                }
            }
            if(self.questTasks[i].target !== undefined){
                if(self.questTasks[i].target === '<current>'){
                    switch(self.questTasks[i].id){
                        case "obtain":
                            self.questTasks[i].target = self.inventory.hasItem(self.questTasks[i].name,1);
                            break;
                    }
                }
                else if(self.questTasks[i].target + '' === self.questTasks[i].target){
                    if(self.questTasks[i].target.slice(0,10) === '<relative>'){
                        self.questTasks[i].target = parseInt(self.questTasks[i].target.substring(10)) + self.inventory.hasItem(self.questTasks[i].name,1);
                    }
                }
            }
            self.questTasks[i].completed = false;
        }
    }
    self.sendMessage = function(message){
        socket.emit('addToChat',{
            color:'#ff0000',
            message:message,
            debug:true,
        });
    }
    self.teleportToSpawn = function(){
        if(ENV.spawnpoints[self.worldRegion]){
            self.teleport(ENV.spawnpoints[self.worldRegion].x,ENV.spawnpoints[self.worldRegion].y,ENV.spawnpoints[self.worldRegion].map);
        }
    }
    self.doRegionChange = function(regionChanger){
        self.region = regionChanger.region;
        self.regionChanger = regionChanger;
        if(regionChanger.canAttack === false){
            self.canAttack = false;
        }
        else{
            self.canAttack = param.canAttack !== undefined ? param.canAttack : true;
        }
        socket.emit('regionChange',{region:regionChanger.region,mapName:regionChanger.mapName});
        if(self.map === 'World'){
            self.worldRegion = self.region;
        }
    }
    if(!self.advancements['Tutorial']){
        self.startQuest('Tutorial');
    }
    var getInitPack = self.getInitPack;
    self.getInitPack = function(){
        var pack = getInitPack();
        pack.xp = self.xp;
        pack.xpMax = self.xpMax;
        pack.level = self.level;
        pack.mana = self.mana;
        pack.manaMax = self.manaMax;
        pack.currentItem = self.currentItem;
        pack.worldRegion = self.worldRegion;
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
            if(!data){
                socket.disconnectUser();
                return;
            }
            if(typeof data !== 'object' || Array.isArray(data) || data === null){
                socket.disconnectUser();
                return;
            }
            if(Object.keys(data).length === 0){
                socket.disconnectUser();
                return;
            }
            if(!data.inputId){
                socket.disconnectUser();
                return;
            }
            if(!data.state && data.state !== false && data.inputId !== 'releaseAll'){
                socket.disconnectUser();
                return;
            }
            if(data.inputId === 'releaseAll'){
                player.keyPress = {
                    up:false,
                    down:false,
                    left:false,
                    right:false,
                    leftClick:false,
                    rightClick:false,
                };
            }
            if(player.hp <= 0){
                return;
            }
            if(data.inputId === player.keyMap.left || data.inputId === player.secondKeyMap.left || data.inputId === player.thirdKeyMap.left){
                socket.detectSpam('keyPress');
                player.keyPress.left = data.state;
            }
            if(data.inputId === player.keyMap.right || data.inputId === player.secondKeyMap.right || data.inputId === player.thirdKeyMap.right){
                socket.detectSpam('keyPress');
                player.keyPress.right = data.state;
            }
            if(data.inputId === player.keyMap.up || data.inputId === player.secondKeyMap.up || data.inputId === player.thirdKeyMap.up){
                socket.detectSpam('keyPress');
                player.keyPress.up = data.state;
            }
            if(data.inputId === player.keyMap.down || data.inputId === player.secondKeyMap.down || data.inputId === player.thirdKeyMap.down){
                socket.detectSpam('keyPress');
                player.keyPress.down = data.state;
            }
            if(data.inputId === player.keyMap.leftClick || data.inputId === player.secondKeyMap.leftClick || data.inputId === player.thirdKeyMap.leftClick){
                socket.detectSpam('gameClick');
                player.keyPress.leftClick = data.state;
                if(data.state === true){
                    player.pickUpItems();
                }
            }
            if(data.inputId === player.keyMap.rightClick || data.inputId === player.secondKeyMap.rightClick || data.inputId === player.thirdKeyMap.rightClick){
                socket.detectSpam('gameClick');
                player.keyPress.rightClick = data.state;
                if(data.state === true){
                    var entities = [];
                    for(var i in Player.list){
                        entities.push(Player.list[i]);
                    }
                    for(var i in Npc.list){
                        entities.push(Npc.list[i]);
                    }
                    function compare(a,b){
                        var ay = a.y;
                        var by = b.y;
                        if(ay < by){
                            return -1;
                        }
                        if(ay > by){
                            return 1;
                        }
                        return 0;
                    }
                    entities.sort(compare);
                    var interactingEntity = null;
                    for(var i in entities){
                        if(entities[i].isColliding({x:player.mouseX,y:player.mouseY,width:0,height:0,map:player.map,type:'Player'}) && entities[i].id !== player.id && entities[i].hp > 0){
                            interactingEntity = entities[i];
                        }
                    }
                    if(interactingEntity){
                        if(interactingEntity.type === 'Player'){
                            player.startTrade(interactingEntity);
                        }
                        else{
                            if(player.inDialogue){
                                return;
                            }
                            for(var i in player.questTasks){
                                if(player.questTasks[i].id === 'npc' && player.questTasks[i].name === interactingEntity.name){
                                    player.questTasks[i].completed = true;
                                    player.updateQuest(player);
                                    return;
                                }
                            }
                            var messages = [];
                            for(var i in interactingEntity.messages){
                                var requirementMet = true;
                                if(interactingEntity.messages[i].requirements){
                                    for(var j in interactingEntity.messages[i].requirements){
                                        if(interactingEntity.messages[i].requirements[j] === false){
                                            if(!player.advancements[j]){

                                            }
                                            else if(player.advancements[j] <= 0){

                                            }
                                            else{
                                                requirementMet = false;
                                            }
                                        }
                                        else{
                                            if(!player.advancements[j]){
                                                requirementMet = false;
                                            }
                                            else if(player.advancements[j] < interactingEntity.messages[i].requirements[j]){
                                                requirementMet = false;
                                            }
                                        }
                                    }
                                }
                                if(requirementMet === false){
                                    continue;
                                }
                                messages.push(interactingEntity.messages[i]);
                            }
                            var message = messages[Math.floor(Math.random() * messages.length)];
                            player.startDialogue(message);
                            player.dialogueMessage.npc = interactingEntity.id;
                        }
                    }
                }
            }
            if(data.inputId === 'direction'){
                if(!data.state){
                    socket.disconnectUser();
                    return;
                }
                if(!data.state.x && data.state.x !== 0){
                    socket.disconnectUser();
                    return;
                }
                if(!data.state.y && data.state.y !== 0){
                    socket.disconnectUser();
                    return;
                }
                player.direction = (Math.atan2(data.state.y,data.state.x) / Math.PI * 180);
                player.mouseX = data.state.x + player.x;
                player.mouseY = data.state.y + player.y;
            }
        });

        socket.on('acceptTrade',function(data){
            socket.detectSpam('game');
            if(player.tradingEntity){
                if(Player.list[player.tradingEntity]){
                    if(player.acceptedTrade){
                        player.finalAcceptedTrade = true;
                        SOCKET_LIST[player.tradingEntity].emit('traderAccepted',{final:true});
                        if(player.finalAcceptedTrade && Player.list[player.tradingEntity].finalAcceptedTrade){
                            for(var i in Player.list[player.tradingEntity].inventory.items){
                                if(i.slice(0,5) === 'trade' && parseInt(i.substring(5)) <= 8){
                                    player.inventory.addItem(Player.list[player.tradingEntity].inventory.items[i].id,Player.list[player.tradingEntity].inventory.items[i].amount);
                                }
                            }
                            for(var i = 0;i < 18;i++){
                                Player.list[player.tradingEntity].inventory.items['trade' + i] = {};
                            }
                            SOCKET_LIST[player.tradingEntity].emit('closeTrade');
                            for(var i in player.inventory.items){
                                if(i.slice(0,5) === 'trade' && parseInt(i.substring(5)) <= 8){
                                    Player.list[player.tradingEntity].inventory.addItem(player.inventory.items[i].id,player.inventory.items[i].amount);
                                }
                            }
                            for(var i = 0;i < 18;i++){
                                player.inventory.items['trade' + i] = {};
                            }
                            socket.emit('closeTrade');
                            SOCKET_LIST[player.tradingEntity].emit('closeTrade');
                            Player.list[player.tradingEntity].sendMessage('[!] Successfully traded with ' + player.name + '.');
                            Player.list[player.tradingEntity].tradingEntity = null;
                            player.sendMessage('[!] Successfully traded with ' + Player.list[player.tradingEntity].name + '.');
                            player.tradingEntity = null;
                        }
                    }
                    else{
                        player.acceptedTrade = true;
                        SOCKET_LIST[player.tradingEntity].emit('traderAccepted',{final:false});
                        if(player.acceptedTrade && Player.list[player.tradingEntity].acceptedTrade){
                            socket.emit('finalAccept');
                            SOCKET_LIST[player.tradingEntity].emit('finalAccept');
                        }
                    }
                }
            }
        });

        socket.on('declineTrade',function(data){
            socket.detectSpam('nonFrequent');
            if(player.tradingEntity){
                if(Player.list[player.tradingEntity]){
                    for(var i in Player.list[player.tradingEntity].inventory.items){
                        if(i.slice(0,5) === 'trade' && parseInt(i.substring(5)) <= 8){
                            Player.list[player.tradingEntity].inventory.addItem(Player.list[player.tradingEntity].inventory.items[i].id,Player.list[player.tradingEntity].inventory.items[i].amount);
                        }
                    }
                    for(var i = 0;i < 18;i++){
                        Player.list[player.tradingEntity].inventory.items['trade' + i] = {};
                    }
                    SOCKET_LIST[player.tradingEntity].emit('closeTrade');
                    Player.list[player.tradingEntity].tradingEntity = null;
                    Player.list[player.tradingEntity].sendMessage('[!] ' + player.name + ' declined the trade.');
                }
                for(var i in player.inventory.items){
                    if(i.slice(0,5) === 'trade' && parseInt(i.substring(5)) <= 8){
                        player.inventory.addItem(player.inventory.items[i].id,player.inventory.items[i].amount);
                    }
                }
                for(var i = 0;i < 18;i++){
                    player.inventory.items['trade' + i] = {};
                }
                socket.emit('closeTrade');
                player.sendMessage('[!] Declined trade with ' + Player.list[player.tradingEntity].name + '.');
                player.tradingEntity = null;
            }
        });

        socket.on('dialogueResponse',function(data){
            socket.detectSpam('nonFrequent');
            if(data !== 'option1' && data !== 'option2' && data !== 'option3' && data !== 'option4'){
                socket.disconnectUser();
                return;
            }
            if(player.dialogueMessage[data]){
                for(var i in player.questTasks){
                    if(player.questTasks[i].id === 'dialogue' && player.questTasks[i].option === data){
                        player.questTasks[i].completed = true;
                        if(player.questTasks[i].triggers === 'completeQuest'){
                            player.completeQuest(player);
                        }
                        else if(player.questTasks[i].triggers === 'abandonQuest'){
                            player.abandonQuest(player);
                        }
                        else if(player.questTasks[i].triggers === 'endConversation'){
                            player.endDialogue();
                        }
                        else if(player.questTasks[i].triggers === 'shopOpen'){
                            player.inventory.refreshShop(Npc.list[player.dialogueMessage.npc].name);
                            player.endDialogue();
                        }
                        else if(player.questTasks[i].triggers === 'startQuest'){
                            player.startQuest(player.questTasks[i].quest);
                        }
                        player.updateQuest(player,i);
                        return;
                    }
                }
                if(player.dialogueMessage[data].triggers === 'completeQuest'){
                    player.completeQuest(player);
                }
                else if(player.dialogueMessage[data].triggers === 'abandonQuest'){
                    player.abandonQuest(player);
                }
                else if(player.dialogueMessage[data].triggers === 'endConversation'){
                    player.endDialogue();
                }
                else if(player.dialogueMessage[data].triggers === 'shopOpen'){
                    player.inventory.refreshShop(Npc.list[player.dialogueMessage.npc].name);
                    player.endDialogue();
                }
                else if(player.dialogueMessage[data].triggers === 'startQuest'){
                    player.startQuest(player.dialogueMessage[data].quest);
                }
            }
        });

        socket.on('changePlayer',function(data){
            socket.detectSpam('nonFrequent');
            if(!data){
                socket.disconnectUser();
                return;
            }
            if(typeof data !== 'object' || Array.isArray(data) || data === null){
                socket.disconnectUser();
                return;
            }
            if(Object.keys(data).length === 0){
                socket.disconnectUser();
                return;
            }
            if(player.img[data.id] !== undefined){
                player.img[data.id] = data.type;
            }
            if(data.id === 'body'){
                if(data.type === 'Undead' || data.type === 'Orc'){
                    player.team = 'Undead';
                }
                else if(data.type === 'Human' || data.type === 'Avian' || data.type === 'Panda'){
                    player.team = 'Human';
                }
                else{
                    player.img[data.id] = 'Human';
                    player.team = 'Human';
                    socket.disconnectUser();
                }
            }
        });

        socket.on('respawn',function(data){
            socket.detectSpam('nonFrequent');
            if(player.hp > 0){
                addToChat('#ff0000',player.name + ' cheated using respawn.');
                Player.onDisconnect(SOCKET_LIST[player.id]);
                delete SOCKET_LIST[player.id];
                return;
            }
            player.hp = Math.round(player.hpMax / 2);
            player.teleportToSpawn();
            addToChat('#00ff00',player.name + ' respawned.');
        });

        socket.on('init',function(data){
            Player.getAllInitPack(socket);
        });

        socket.on('signInFinished',function(data){
            if(player.loggedOn === false){
                player.loggedOn = true;
                player.canMove = true;
                player.invincible = false;
                Player.getAllInitPack(socket);
                addToChat('#00ff00',player.name + " just logged on.");
            }
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
    if(Player.list[socket.id]){
        if(Player.list[socket.id].loggedOn){
            Player.list[socket.id].loggedOn = null;
            if(Player.list[socket.id].tradingEntity){
                if(Player.list[Player.list[socket.id].tradingEntity]){
                    for(var i in Player.list[Player.list[socket.id].tradingEntity].inventory.items){
                        if(i.slice(0,5) === 'trade' && parseInt(i.substring(5)) <= 8){
                            if(Player.list[Player.list[socket.id].tradingEntity].inventory.items[i].id){
                                Player.list[Player.list[socket.id].tradingEntity].inventory.addItem(Player.list[Player.list[socket.id].tradingEntity].inventory.items[i].id,Player.list[Player.list[socket.id].tradingEntity].inventory.items[i].amount);
                            }
                        }
                    }
                    for(var i in Player.list[socket.id].inventory.items){
                        if(i.slice(0,5) === 'trade' && parseInt(i.substring(5)) <= 8){
                            if(Player.list[socket.id].inventory.items[i].id){
                                Player.list[socket.id].inventory.addItem(Player.list[socket.id].inventory.items[i].id,Player.list[socket.id].inventory.items[i].amount);
                            }
                        }
                    }
                    if(SOCKET_LIST[Player.list[socket.id].tradingEntity]){
                        SOCKET_LIST[Player.list[socket.id].tradingEntity].emit('closeTrade');
                    }
                    Player.list[Player.list[socket.id].tradingEntity].tradingEntity = null;
                }
            }
            playerMap[Player.list[socket.id].map] -= 1;
            if(Player.list[socket.id].debug.invisible === false){
                addToChat('#ff0000',Player.list[socket.id].name + " logged off.");
            }
        }
        if(Player.list[socket.id].inventory.draggingItem.id){
            Player.list[socket.id].inventory.addItem(Player.list[socket.id].inventory.draggingItem.id,Player.list[socket.id].inventory.draggingItem.amount);
        }
        storeDatabase(Player.list);
        delete Player.list[socket.id];
    }
    else{
        storeDatabase(Player.list);
    }
    socket.disconnect();
}
Player.getAllInitPack = function(socket){
    try{
        var player = Player.list[socket.id];
        if(player){
            var pack = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
            for(var i in Player.list){
                if(Player.list[i].map === player.map){
                    if(Player.list[i].debug.invisible === false || i + '' === socket.id + ''){
                        if(player.getSquareDistance(Player.list[i]) < 32){
                            pack.player.push(Player.list[i].getInitPack());
                        }
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
    self.parentName = param.parentName;
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
    self.collisionType = param.collisionType === false ? self.collisionType : param.collisionType;
    self.collided = false;
    self.width *= 4;
    self.height *= 4;
    self.zindex = param.zindex;
    self.stats = param.stats;
    self.pierce = param.pierce;
    self.vertices = [];
    self.onHit = function(pt){
        self.pierce -= 1;
        if(self.pierce === 0){
            self.toRemove = true;
        }
    }
    self.update = function(){
        self.vertices = [];
        self.updatePattern();
        var calculations = Math.floor(Math.max(Math.max(Math.abs(self.spdX),Math.abs(self.spdY)) / 20,1));
        var spdX = self.spdX;
        var spdY = self.spdY;
        self.spdX /= calculations;
        self.spdY /= calculations;
        for(var i = 0;i < calculations;i++){
            self.updatePosition();
            self.updateGridPosition();
            self.x = Math.round(self.x);
            self.y = Math.round(self.y);
            self.updateCollisions();
        }
        self.spdX = spdX;
        self.spdY = spdY;
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
        if(self.collided){
            return;
        }
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
        if(self.projectilePattern === 'heavysword'){
            self.x = entity.x;
            self.y = entity.y;
            self.direction = param.direction - 90 + (self.timer - 1) * 20;
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
                self.spdX += 2;
            }
            else if(entity.x < self.x){
                self.spdX -= 2;
            }
            if(entity.y > self.y){
                self.spdY += 2;
            }
            else if(entity.y < self.y){
                self.spdY -= 2;
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
                    self.direction += (direction - self.direction - 360) / 5;
                }
                else if(direction - self.direction < -180){
                    self.direction += (direction - self.direction - 360) / 5;
                }
                else{
                    self.direction += (direction - self.direction) / 5;
                }
                self.spdX = Math.cos(self.direction / 180 * Math.PI) * param.speed;
                self.spdY = Math.sin(self.direction / 180 * Math.PI) * param.speed;
            }
        }
    }
    self.updateCollisions = function(){
        var collisions = [];
        for(var i = Math.floor((self.x - self.width / 2 - self.height / 2) / 64);i <= Math.floor((self.x + self.width / 2 + self.height / 2) / 64);i++){
            for(var j = Math.floor((self.y - self.width / 2 - self.height / 2) / 64);j <= Math.floor((self.y + self.width / 2 + self.height / 2) / 64);j++){
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][self.zindex]){
                        if(Collision.list[self.map][self.zindex][i]){
                            if(Collision.list[self.map][self.zindex][i][j]){
                                var collision = Collision.list[self.map][self.zindex][i][j];
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
                self.spin = 0;
                self.collided = true;
            }
        }
    }
    self.updateCollisions();
    if(self.collided === true){
        return;
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
        pack.projectileType = self.projectileType;
        pack.parent = self.parent;
        pack.parentType = self.parentType;
        pack.relativeToParent = self.relativeToParent;
        pack.collisionType = self.collisionType;
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

    self.updated = true;

    self.targetX = 0;
    self.targetY = 0;

    self.trackX = 0;
    self.trackY = 0;
    self.trackTime = 100;
    self.targetLeftView = 0;
    self.circlingTarget = false;
    self.circleDirection = 1;
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
        if(pt.sameId === false){
            self.projectilesHit[pt.id] = 10;
        }
        if(self.attackState === 'passive'){
            if(pt.parentType === 'Player'){
                self.target = Player.list[pt.parent];
            }
            else if(pt.parentType === 'Monster'){
                self.target = Monster.list[pt.parent];
            }
            self.damaged = true;
            self.attackState = 'attack';
        }
    }
    self.retreat = function(){
        self.target = null;
        self.attackState = 'retreat';
        self.trackPos(self.randomPos.x,self.randomPos.y);
        self.maxSpeed *= 2;
        self.spdX = 0;
        self.spdY = 0;
    }
    self.update = function(){
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.trackTarget();
            self.updateMove();
            if(self.canMove){
                self.updatePosition();
            }
            self.updateGridPosition();
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
        if(self.attackState === 'passive'){
            self.target = null;
            for(var i in Player.list){
                if(!self.target){
                    if(Player.list[i].map === self.map){
                        if(Player.list[i].team !== self.team){
                            if(Player.list[i].hp > 0){
                                if(self.getSquareDistance(Player.list[i]) < self.aggro && Player.list[i].getSquareDistance(self.randomPos) <= 16){
                                    if(self.canSee(Player.list[i])){
                                        if(Player.list[i]){
                                            self.target = Player.list[i];
                                            self.attackState = 'attack';
                                            self.damaged = false;
                                            self.targetLeftView = 0;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            for(var i in Monster.list){
                if(!self.target){
                    if(Monster.list[i].map === self.map){
                        if(Monster.list[i].team !== self.team){
                            if(Monster.list[i].hp > 0){
                                if(self.getSquareDistance(Monster.list[i]) < self.aggro && Monster.list[i].getSquareDistance(self.randomPos) <= 16){
                                    if(self.canSee(Monster.list[i])){
                                        if(Monster.list[i]){
                                            self.target = Monster.list[i];
                                            self.attackState = 'attack';
                                            self.damaged = false;
                                            self.targetLeftView = 0;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else if(self.attackState === 'attack'){
            if(self.target){
                if(self.target.hp <= 0){
                    self.retreat();
                }
                else if(self.target.team === self.team){
                    self.retreat();
                }
                else if(self.target.map !== self.map){
                    self.retreat();
                }
                else{
                    if(self.getSquareDistance(self.target) > self.aggro * 2 && self.damaged === false){
                        self.retreat();
                    }
                    else if(self.getSquareDistance(self.target) > self.aggro * 3){
                        self.retreat();
                    }
                    else if(self.getSquareDistance(self.randomPos) > 16){
                        self.retreat();
                    }
                    if(self.target){
                        if(self.canSee(self.target) === false){
                            self.targetLeftView += 1;
                            if(self.targetLeftView >= 100){
                                self.retreat();
                            }
                        }
                        else{
                            self.targetLeftView = 0;
                        }
                        if(self.target){
                            self.targetX = self.target.x;
                            self.targetY = self.target.y;
                        }
                    }
                }
                if(self.target){
                    if(self.target.type === 'Player' && !Player.list[self.target.id]){
                        self.retreat();
                    }
                    else if(self.target.type === 'Monster' && !Monster.list[self.target.id]){
                        self.retreat();
                    }
                }
            }
        }
    }
    self.trackTarget = function(){
        if(self.attackState === 'passive'){
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
            if(self.getSquareDistance(self.randomPos) > 8){
                self.trackPos(self.randomPos.x,self.randomPos.y);
            }
            if(self.collided.x){
                self.spdX = self.spdX * -1;
            }
            if(self.collided.y){
                self.spdY = self.spdY * -1;
            }
        }
        else if(self.attackState === 'attack'){
            if(self.target){
                self.spdX = 0;
                self.spdY = 0;
                var size = 33;
                var dx = Math.floor(self.x / 64 - self.width / 128) - size / 2 + 0.5;
                var dy = Math.floor(self.y / 64 - self.height / 128) - size / 2 + 0.5;
                var lastTrackX = self.trackX;
                var lastTrackY = self.trackY;
                if(self.targetLeftView === 0){
                    self.trackX = self.target.gridX - dx;
                    self.trackY = self.target.gridY - dy;
                }
                self.trackTime += 1;
                var distance = self.getDistance(self.target);
                if(distance < 192 && self.targetLeftView === 0){
                    self.circlingTarget = true;
                    if(distance < 64){
                        self.retreat();
                        return;
                    }
                }
                else if(distance > 256){
                    self.circlingTarget = false;
                }
                if(self.circlingTarget){
                    self.trackingPath = [];
                    var direction = Math.atan2(self.y - self.targetY,self.x - self.targetX) / Math.PI * 180;
                    direction = Math.floor(direction / 45 + 0.5);
                    if(distance < 128){
                        direction -= 1;
                    }
                    direction = direction % 8;
                    while(direction < 0){
                        direction += 8;
                    }
                    if(self.collided.x || self.collided.y || self.targetLeftView > 0){
                        self.circleDirection *= -1;
                    }
                    switch(direction){
                        case 0:
                            self.spdX = 0;
                            self.spdY = 1;
                            break;
                        case 1:
                            self.spdX = -1;
                            self.spdY = 1;
                            break;
                        case 2:
                            self.spdX = -1;
                            self.spdY = 0;
                            break;
                        case 3:
                            self.spdX = -1;
                            self.spdY = -1;
                            break;
                        case 4:
                            self.spdX = 0;
                            self.spdY = -1;
                            break;
                        case 5:
                            self.spdX = 1;
                            self.spdY = -1;
                            break;
                        case 6:
                            self.spdX = 1;
                            self.spdY = 0;
                            break;
                        case 7:
                            self.spdX = 1;
                            self.spdY = 1;
                            break;
                    }
                    self.spdX *= self.circleDirection;
                    self.spdY *= self.circleDirection;
                }
                else{
                    if(self.trackTime > 50 + 50 * Math.random()){
                        self.trackTime = 0;
                        var finder = new PF.BiAStarFinder({
                            allowDiagonal:true,
                            dontCrossCorners:true,
                        });
                        var grid = new PF.Grid(size,size);
                        for(var i = 0;i < size;i++){
                            for(var j = 0;j < size;j++){
                                var setWalkableAt = function(){
                                    for(var k = -self.width / 64 + 1;k < 1;k++){
                                        for(var l = -self.height / 64 + 1;l < 1;l++){
                                            if(i + k >= 0 && i + k < size && j + l >= 0 && j + l < size){
                                                grid.setWalkableAt(i + k,j + l,false);
                                            }
                                        }
                                    }
                                }
                                var x = dx + i;
                                var y = dy + j;
                                if(Collision.list[self.map]){
                                    if(Collision.list[self.map][self.zindex]){
                                        if(Collision.list[self.map][self.zindex][x]){
                                            if(Collision.list[self.map][self.zindex][x][y]){
                                                setWalkableAt();
                                            }
                                        }
                                    }
                                }
                                if(RegionChanger.list[self.map]){
                                    if(RegionChanger.list[self.map][x]){
                                        if(RegionChanger.list[self.map][x][y]){
                                            if(RegionChanger.list[self.map][x][y].noMonster){
                                                setWalkableAt();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        var nx = Math.floor(size / 2);
                        var ny = Math.floor(size / 2);
                        if(self.trackX < size && self.trackX > 0 && self.trackY < size && self.trackY > 0){
                            var grid2 = grid.clone();
                            var path = finder.findPath(nx,ny,self.trackX,self.trackY,grid);
                            if(path[0]){
                                self.trackingPath = PF.Util.compressPath(path);
                                for(var i in self.trackingPath){
                                    self.trackingPath[i][0] += dx;
                                    self.trackingPath[i][1] += dy;
                                }
                                self.trackingPath.shift();
                            }
                            else{
                                var path = finder.findPath(nx,ny,lastTrackX,lastTrackY,grid2);
                                if(path[0]){
                                    self.trackingPath = PF.Util.compressPath(path);
                                    for(var i in self.trackingPath){
                                        self.trackingPath[i][0] += dx;
                                        self.trackingPath[i][1] += dy;
                                    }
                                    self.trackingPath.shift();
                                }
                                else{
                                    self.retreat();
                                }
                            }
                        }
                    }
                }
                if(self.getSquareDistance(self.randomPos) > 16){
                    self.retreat();
                }
            }
            else{
                self.retreat();
            }
        }
        else if(self.attackState === 'retreat'){
            if(self.getSquareDistance(self.randomPos) <= 2){
                self.attackState = 'passive';
                self.maxSpeed = monsterData[self.monsterType].maxSpeed;
            }
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
        self.direction = Math.atan2(self.targetY - self.y,self.targetX - self.x) / Math.PI * 180;
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
    self.hp = 100;
    self.hpMax = 100;
    self.type = 'Npc';
    for(var i in npcData[self.name]){
        if(i === 'img'){
            for(var j in npcData[self.name].img){
                self.img[j] = npcData[self.name].img[j];
            }
        }
        else{
            self[i] = npcData[self.name][i];
        }
    }
    self.changeSize();
    self.update = function(){
        self.mapChange += 1;
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateMove();
            if(self.canMove){
                self.updatePosition();
            }
            self.updateGridPosition();
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
            zindex:self.zindex,
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
                    zindex:self.zindex,
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
                zindex:self.zindex,
            },self.collisionId);
        }
        self.timer = Math.floor(2400 + 1200 * Math.random());
    }
    var getInitPack = self.getInitPack;
    self.getInitPack = function(){
        var pack = getInitPack();
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
    for(var i = 0;i < 100;i++){
        self.x = param.x + 128 * Math.random() - 64;
        self.y = param.y + 128 * Math.random() - 64;
        self.gridX = Math.floor(self.x / 64);
        self.gridY = Math.floor(self.y / 64);
        var collisions = [];
        for(var i = Math.floor((self.x - self.width / 2) / 64);i <= Math.floor((self.x + self.width / 2) / 64);i++){
            for(var j = Math.floor((self.y - self.height / 2) / 64);j <= Math.floor((self.y + self.height / 2) / 64);j++){
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][0]){
                        if(Collision.list[self.map][0][i]){
                            if(Collision.list[self.map][0][i][j]){
                                var collision = Collision.list[self.map][0][i][j];
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
        if(!collisions[0]){
            break;
        }
    }
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
        if(!Player.list[self.parent] && self.allPlayers === false){
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