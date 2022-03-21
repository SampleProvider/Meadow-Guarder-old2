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
debuffData = require('./../client/data/debuffs.json');
weatherData = require('./../client/data/weather.json');
harvestableNpcData = require('./../client/data/harvestableNpcs.json');

currentWeather = 'none';
weatherLastChanged = 0;

quests = {};

require('./clan');
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
            if(pt.boss === true){
                var message = pt.name + ' has been defeated!\nTop Damagers:';
                var leaderboard = [];
                var clans = {};
                var clanLeaderboard = [];
                for(var i in pt.playersDamaged){
                    if(Player.list[i]){
                        leaderboard.push({name:Player.list[i].name,damage:pt.playersDamaged[i]});
                        if(Player.list[i].clan){
                            if(clans[Player.list[i].clan]){
                                clans[Player.list[i].clan].damage += pt.playersDamaged[i];
                                clans[Player.list[i].clan].membersDamaged += 1;
                                clans[Player.list[i].clan].luck += Player.list[i].luck;
                            }
                            else{
                                clans[Player.list[i].clan] = {
                                    damage:pt.playersDamaged[i],
                                    membersDamaged:1,
                                    luck:Player.list[i].luck,
                                };
                                clanLeaderboard.push(Player.list[i].clan);
                            }
                        }
                    }
                }
                for(var i in clans){
                    clans[i].xp = Math.round((clans[i].damage * Math.sqrt(clans[i].membersDamaged) * clans[i].luck / clans[i].membersDamaged * (0.8 + Math.random() * 0.4)) / 250000);
                    Clan.list[i].addXp(clans[i].xp);
                }
                var compare = function(a,b){
                    if(a.damage > b.damage){
                        return -1;
                    }
                    else if(b.damage > a.damage){
                        return 1;
                    }
                    else{
                        return 0;
                    }
                }
                leaderboard.sort(compare);
                var clanCompare = function(a,b){
                    if(clans[a].xp > clans[b].xp){
                        return -1;
                    }
                    else if(clans[b].xp > clans[a].xp){
                        return 1;
                    }
                    else{
                        return 0;
                    }
                }
                clanLeaderboard.sort(clanCompare);
                for(var i = 0;i < 5;i++){
                    if(leaderboard[i]){
                        message += '\n' + (i + 1) + ': ' + leaderboard[i].name + ' (' + leaderboard[i].damage + ' Damage)';
                    }
                }
                message += '\nTop Clans:';
                for(var i = 0;i < 5;i++){
                    if(clanLeaderboard[i]){
                        message += '\n' + (i + 1) + ': ' + clanLeaderboard[i] + ' (' + clans[clanLeaderboard[i]].damage + ' Damage, ' + clans[clanLeaderboard[i]].xp + ' Xp)';
                    }
                }
                globalChat('#990099',message);
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
	self.getRhombusDistance = function(pt){
		return Math.abs(Math.floor(self.x - pt.x)) + Math.abs(Math.floor(self.y - pt.y));
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
    self.updateGridPosition();
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
    self.transporter = {};

    self.collided = {x:false,y:false};

    self.trackingPath = [];

    self.drawSize = 'medium';

    self.name = param.name || 'null';

    self.maxSpeed = 10;
    self.stepsLeft = 10;

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

    self.knockbackX = 0;
    self.knockbackY = 0;
    self.knockbackResistance = 0;

    self.projectilesHit = {};

    self.playersDamaged = {};

    self.debuffs = {};

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
            if(self.x !== self.trackingPath[0][0] * 64 + self.width / 2){
                if(self.trackingPath[0][0] * 64 + self.width / 2 - self.x > self.width){
                    self.spdX = self.width;
                }
                else if(self.trackingPath[0][0] * 64 + self.width / 2 - self.x < -self.width){
                    self.spdX = -self.width;
                }
                else{
                    self.spdX = self.trackingPath[0][0] * 64 + self.width / 2 - self.x;
                }
            }
            else{
                self.spdX = 0;
            }
            if(self.y !== self.trackingPath[0][1] * 64 + self.height / 2){
                if(self.trackingPath[0][1] * 64 + self.height / 2 - self.y > self.height){
                    self.spdY = self.height;
                }
                else if(self.trackingPath[0][1] * 64 + self.height / 2 - self.y < -self.height){
                    self.spdY = -self.height;
                }
                else{
                    self.spdY = self.trackingPath[0][1] * 64 + self.height / 2 - self.y;
                }
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
            var x = pt.gridX;
        }
        else{
            var x = self.gridX;
        }
        var distance = Math.abs(self.gridX - pt.gridX);
        for(var i = 0;i <= distance;i++){
            if(x === self.gridX && x === pt.gridX){
                var y1 = self.gridY;
                var y2 = pt.gridY;
            }
            if(self.gridX > pt.gridX){
                if(x === pt.gridX){
                    var y1 = pt.gridY;
                }
                else{
                    var y1 = Math.floor(getYValue(x * 64) / 64);
                }
            }
            else{
                if(x === self.gridX){
                    var y1 = self.gridY;
                }
                else{
                    var y1 = Math.floor(getYValue(x * 64) / 64);
                }
            }
            if(self.gridX > pt.gridX){
                if(x === self.gridX){
                    var y2 = self.gridY;
                }
                else{
                    var y2 = Math.floor(getYValue(x * 64 + 64) / 64);
                }
            }
            else{
                if(x === pt.gridX){
                    var y2 = pt.gridY;
                }
                else{
                    var y2 = Math.floor(getYValue(x * 64 + 64) / 64);
                }
            }
            x += 1;
            var yDirection = 1;
            if(y1 > y2){
                yDirection = -1;
            }
            var y = y1;
            var distance2 = Math.abs(y1 - y2);
            for(var j = 0;j <= distance2;j++){
                y += yDirection;
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][self.zindex]){
                        if(Collision.list[self.map][self.zindex][x]){
                            if(Collision.list[self.map][self.zindex][x][y]){
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }
    self.trackPos = function(x,y){
        var size = 33;
        if(self.getSquareDistance({x:x,y:y}) > 16){
            size = 65;
        }
        if(self.getSquareDistance({x:x,y:y}) > 32){
            size = 97;
        }
        if(self.getSquareDistance({x:x,y:y}) > 48){
            size = 129;
        }
        if(self.getSquareDistance({x:x,y:y}) > 64){
            size = 161;
        }
        if(self.getSquareDistance({x:x,y:y}) > 80){
            size = 193;
        }
        if(self.getSquareDistance({x:x,y:y}) > 96){
            size = 225;
        }
        var nx = Math.floor(size / 2);
        var ny = Math.floor(size / 2);
        var dx = Math.floor(self.x / 64 - (self.width / 64 - 1) / 2) - nx;
        var dy = Math.floor(self.y / 64 - (self.height / 64 - 1) / 2) - ny;
        if(Collision.list[self.map]){
            if(Collision.list[self.map][self.zindex]){
                if(Collision.list[self.map][self.zindex][dx + nx]){
                    if(Collision.list[self.map][self.zindex][dx + nx][dy + ny]){
                        var lastDx = dx;
                        var lastDy = dy;
                        var distance = -1;
                        for(var i = 2;i > -Math.round(self.width / 64) - 2;i--){
                            for(var j = 2;j > -Math.round(self.height / 64) - 2;j--){
                                if(Collision.list[self.map][self.zindex][lastDx + nx + i]){
                                    if(Collision.list[self.map][self.zindex][lastDx + nx + i][lastDy + ny + j]){
                                        continue;
                                    }
                                }
                                self.x -= (self.width - 64) / 2;
                                self.y -= (self.height - 64) / 2;
                                if(self.getRhombusDistance({x:self.gridX * 64 + i * 64 + 32,y:self.gridY * 64 + j * 64 + 32}) < distance || distance === -1){
                                    distance = self.getRhombusDistance({x:self.gridX * 64 + i * 64 + 32,y:self.gridY * 64 + j * 64 + 32});
                                    dx = lastDx + i;
                                    dy = lastDy + j;
                                }
                                self.x += (self.width - 64) / 2;
                                self.y += (self.height - 64) / 2;
                            }
                        }
                    }
                }
            }
        }
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
                    for(var k = -Math.round(self.width / 64) + 1;k < 1;k++){
                        for(var l = -Math.round(self.height / 64) + 1;l < 1;l++){
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
        if(tx < size && tx > 0 && ty < size && ty > 0){
            if(grid.nodes[ty][tx].walkable === false){
                var x = tx;
                var y = ty;
                var distance = -1;
                for(var i = -2;i < 3;i++){
                    for(var j = -2;j < 3;j++){
                        if(x + i >= 0 && x + i < size && y + j >= 0 && y + j < size){
                            if(grid.nodes[y + j][x + i].walkable === true && (Math.abs(i) + Math.abs(j) < distance || distance === -1)){
                                tx = x + i;
                                ty = y + j;
                                distance = Math.abs(i) + Math.abs(j);
                            }
                        }
                    }
                }
            }
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
    self.detectCollisions = function(){
        var x = self.x;
        var y = self.y;
        var width = self.width;
        var height = self.height;
        self.width += Math.abs(self.x - self.lastX);
        self.height += Math.abs(self.y - self.lastY);
        self.x = (self.x + self.lastX) / 2;
        self.y = (self.y + self.lastY) / 2;
        for(var i = Math.floor((self.x - self.width / 2) / 64);i <= Math.floor((self.x + self.width / 2) / 64);i++){
            for(var j = Math.floor((self.y - self.height / 2) / 64);j <= Math.floor((self.y + self.height / 2) / 64);j++){
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][self.zindex]){
                        if(Collision.list[self.map][self.zindex][i]){
                            if(Collision.list[self.map][self.zindex][i][j]){
                                var collision = Collision.list[self.map][self.zindex][i][j];
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
    }
    self.updateCollisions = function(){
        var collisions = [];
        var x = self.x;
        var y = self.y;
        var width = self.width;
        var height = self.height;
        self.width += Math.abs(self.x - self.lastX);
        self.height += Math.abs(self.y - self.lastY);
        self.x = (self.x + self.lastX) / 2;
        self.y = (self.y + self.lastY) / 2;
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
        self.x = x;
        self.y = y;
        self.width = width;
        self.height = height;
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
                        if(self.type === 'Monster'){
                            self.circleDirection *= -1;
                        }
                    }
                    else{
                        self.collided = {x:false,y:true};
                        if(self.type === 'Monster'){
                            self.circleDirection *= -1;
                        }
                    }
                }
                else{
                    self.collided = {x:true,y:false};
                    if(self.type === 'Monster'){
                        self.circleDirection *= -1;
                    }
                }
            }
            else{
                self.collided = {x:false,y:false};
            }
        }
        else{
            self.collided = {x:false,y:false};
        }
    }
    self.updateKnockbackCollisions = function(){
        var collisions = [];
        var x = self.x;
        var y = self.y;
        var width = self.width;
        var height = self.height;
        self.width += Math.abs(self.x - self.lastX);
        self.height += Math.abs(self.y - self.lastY);
        self.x = (self.x + self.lastX) / 2;
        self.y = (self.y + self.lastY) / 2;
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
        self.x = x;
        self.y = y;
        self.width = width;
        self.height = height;
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
                        if(self.type === 'Monster'){
                            self.circleDirection *= -1;
                        }
                    }
                    else{
                        self.collided = {x:false,y:true};
                        if(self.type === 'Monster'){
                            self.circleDirection *= -1;
                        }
                    }
                }
                else{
                    self.collided = {x:true,y:false};
                    if(self.type === 'Monster'){
                        self.circleDirection *= -1;
                    }
                }
            }
            else{
                self.collided = {x:false,y:false};
                var y1 = self.y;
                self.y = self.lastY;
                var colliding = false;
                for(var i in collisions){
                    if(self.isColliding(collisions[i])){
                        colliding = true;
                    }
                }
                if(colliding){
                    self.x = self.lastX;
                    self.collided.x = true;
                    if(self.type === 'Monster'){
                        self.circleDirection *= -1;
                    }
                }
                self.y = y1;
                var x1 = self.x;
                self.x = self.lastX;
                var colliding = false;
                for(var i in collisions){
                    if(self.isColliding(collisions[i])){
                        colliding = true;
                    }
                }
                if(colliding){
                    self.y = self.lastY;
                    self.collided.y = true;
                    if(self.type === 'Monster'){
                        self.circleDirection *= -1;
                    }
                }
                self.x = x1;
            }
        }
        else{
            self.collided = {x:false,y:false};
        }
    }
    self.updateSlope = function(){
        if(Slope.list[self.map]){
            if(Slope.list[self.map][self.gridX]){
                if(Slope.list[self.map][self.gridX][self.gridY]){
                    self.zindex += Slope.list[self.map][self.gridX][self.gridY];
                }
            }
        }
    }
    self.updateTransporter = function(){
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
    self.teleport = function(x,y,map){
        if(playerMap[map] === undefined){
            return;
        }
        self.transporter = {
            teleport:map,
            teleportx:x,
            teleporty:y,
        };
        self.canMove = false;
        self.canAttack = false;
        self.invincible = true;
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
    self.updateRegion = function(){
        if(RegionChanger.list[self.map]){
            if(RegionChanger.list[self.map][self.gridX]){
                if(RegionChanger.list[self.map][self.gridX][self.gridY]){
                    var regionChanger = RegionChanger.list[self.map][self.gridX][self.gridY];
                    if(regionChanger.noMonster && self.type === 'Monster'){
                        self.x = self.lastX;
                        self.y = self.lastY;
                        self.collided.x = true;
                        self.collided.y = true;
                        self.circleDirection *= -1;
                    }
                    if(regionChanger.region !== self.region){
                        self.doRegionChange(regionChanger);
                    }
                }
            }
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
        self.knockbackX += pt.spdX / 4 * (1 - self.knockbackResistance);
        self.knockbackY += pt.spdY / 4 * (1 - self.knockbackResistance);
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
                        else{
                            Player.list[i].updateClientQuest();
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
                            if(Item.list[k].type === 'Material' && k !== 'greengrape'){
                                if(k !== 'coppercoin' && k !== 'silvercoin' && k !== 'goldcoin' && k !== 'meteoritecoin'){
                                    numItems += 1;
                                }
                            }
                        }
                        var randomItem = Math.floor(Math.random() * numItems);
                        numItems = 0;
                        for(var k in Item.list){
                            if(Item.list[k].type === 'Material' && k !== 'greengrape'){
                                if(k !== 'coppercoin' && k !== 'silvercoin' && k !== 'goldcoin' && k !== 'meteoritecoin'){
                                    if(numItems === randomItem){
                                        while(amount > 0){
                                            var amountRemoved = Math.ceil(Math.random() * amount / 4 + amount / 4);
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
                    }
                    else{
                        while(amount > 0){
                            var amountRemoved = Math.ceil(Math.random() * amount / 4 + amount / 4);
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
                        if(self.itemDrops[j].chance <= 0.01){
                            globalChat('#00ffff','RARE DROP! ' + Player.list[i].name + ' got ' + Item.list[j].name + '! ' + (self.itemDrops[j].chance * 100) + '% Drop Chance!');
                        }
                    }
                }
            }
            Player.list[i].xp += parseInt(Math.round((0.8 + Math.random() * 0.4) * self.xpDrop * playersPercentage[i]));
            var coins = parseInt(Math.round((0.8 + Math.random() * 0.4) * self.coinDrop * playersPercentage[i]));
            var coppercoins = coins % 100;
            var silvercoins = Math.floor(coins / 100) % 100;
            var goldcoins = Math.floor(coins / 10000) % 100;
            var meteoritecoins = Math.floor(coins / 1000000) % 100;
            if(coppercoins > 0){
                new DroppedItem({
                    x:self.x,
                    y:self.y,
                    map:self.map,
                    item:'coppercoin',
                    amount:coppercoins,
                    parent:i,
                    allPlayers:false,
                });
            }
            if(silvercoins > 0){
                new DroppedItem({
                    x:self.x,
                    y:self.y,
                    map:self.map,
                    item:'silvercoin',
                    amount:silvercoins,
                    parent:i,
                    allPlayers:false,
                });
            }
            if(goldcoins > 0){
                new DroppedItem({
                    x:self.x,
                    y:self.y,
                    map:self.map,
                    item:'goldcoin',
                    amount:goldcoins,
                    parent:i,
                    allPlayers:false,
                });
            }
            if(meteoritecoins > 0){
                new DroppedItem({
                    x:self.x,
                    y:self.y,
                    map:self.map,
                    item:'meteoritecoin',
                    amount:meteoritecoins,
                    parent:i,
                    allPlayers:false,
                });
            }
        }
    }
    self.onDamage = function(pt){
        if(self.invincible === true){
            return;
        }
        if(self.hp <= 0){
            return;
        }
        if(pt.sameId === false && self.projectilesHit[pt.id]){
            return;
        }
        if(pt.type === 'Projectile' && pt.collided){
            return;
        }
        var hp = self.hp;
        var crit = false;
        if(self.shieldProtection && self.shieldActive && Math.abs(pt.direction - self.direction) > 105){
            if(Math.random() < pt.stats.critChance){
                crit = true;
                self.hp -= Math.max(Math.floor((pt.stats.damage * (0.8 + Math.random() * 0.4) * (1 + pt.stats.critPower) * (1 - self.shieldProtection) - self.stats.defense)),0);
            }
            else{
                self.hp -= Math.max(Math.floor(pt.stats.damage * (0.8 + Math.random() * 0.4) * (1 - self.shieldProtection) - self.stats.defense),0);
            }
        }
        else{
            if(Math.random() < pt.stats.critChance){
                crit = true;
                self.hp -= Math.max(Math.floor((pt.stats.damage * (0.8 + Math.random() * 0.4) * (1 + pt.stats.critPower) - self.stats.defense)),0);
            }
            else{
                self.hp -= Math.max(Math.floor(pt.stats.damage * (0.8 + Math.random() * 0.4) - self.stats.defense),0);
            }
        }
        if(pt.type === 'Projectile'){
            if(pt.debuffs){
                for(var i in pt.debuffs){
                    self.addDebuff(i,pt.debuffs[i]);
                }
            }
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
                            if(Player.list[i].getSquareDistance(self) < SOCKET_LIST[i].renderDistance * 16){
                                SOCKET_LIST[i].emit('createParticle',{
                                    x:self.x,
                                    y:self.y,
                                    map:self.map,
                                    particleType:Math.round(hp - self.hp) > 0 ? crit === true ? 'critDamage' : 'damage' : 'heal',
                                    number:1,
                                    value:(Math.round(hp - self.hp) > 0 ? '-' : '+') + Math.abs(Math.round(hp - self.hp)),
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
            stats:param.stats !== undefined ? param.stats : self.stats,
            debuffs:param.debuffs !== undefined ? param.debuffs : {},
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
        if(self.trackingPath[0]){
            var direction = param.direction !== undefined ? param.direction / 180 * Math.PI + Math.atan2(self.trackingPath[0][1] * 64 + self.height / 2 - self.y,self.trackingPath[0][0] * 64 + self.width / 2 - self.x) : Math.atan2(self.trackingPath[0][1] * 64 + self.height / 2 - self.y,self.trackingPath[0][0] * 64 + self.width / 2 - self.x);
        }
        else{
            var direction = param.direction !== undefined ? param.direction / 180 * Math.PI + self.direction / 180 * Math.PI : self.direction / 180 * Math.PI;
        }
        direction += param.directionDeviation !== undefined ? Math.random() * param.directionDeviation / 180 * Math.PI - param.directionDeviation / 180 * Math.PI / 2 : 0;
        var dashX = Math.cos(direction);
        var dashY = Math.sin(direction);
        var dashDistance = param.dashDistance !== undefined ? param.dashDistance * 64 : 256;
        self.dashX = dashDistance / self.dashTime * dashX;
        self.dashY = dashDistance / self.dashTime * dashY;
    }
    self.roundStats = function(){
        for(var i in self.stats){
            self.stats[i] = Math.round(self.stats[i] * 100) / 100;
        }
        if(self.type === 'Player'){
            self.shieldProtection = Math.round(self.shieldProtection * 100) / 100;
            self.luck = Math.round(self.luck * 100) / 100;
        }
    }
    self.addDebuff = function(id,time){
        if(self.debuffs[id]){
            if(self.debuffs[id].time > time){

            }
            else{
                self.debuffs[id] = {time:time,totalTime:time};
            }
        }
        else{
            self.debuffs[id] = {time:time,totalTime:time};
            if(debuffData[id].hpMax !== undefined){
                self.hpMax += debuffData[id].hpMax;
                self.hp += debuffData[id].hpMax;
            }
            if(debuffData[id].hpRegen !== undefined){
                self.stats.hpRegen += debuffData[id].hpRegen;
            }
            if(debuffData[id].manaMax !== undefined){
                self.manaMax += debuffData[id].manaMax;
                self.mana += debuffData[id].manaMax;
            }
            if(debuffData[id].manaRegen !== undefined){
                self.stats.manaRegen += debuffData[id].manaRegen;
            }
            if(debuffData[id].damage !== undefined){
                self.stats.damage += debuffData[id].damage;
            }
            if(debuffData[id].critChance !== undefined){
                self.stats.critChance += debuffData[id].critChance;
            }
            if(debuffData[id].critPower !== undefined){
                self.stats.critPower += debuffData[id].critPower;
            }
            if(debuffData[id].defense !== undefined){
                self.stats.defense += debuffData[id].defense;
            }
            if(debuffData[id].movementSpeed !== undefined){
                self.maxSpeed += debuffData[id].movementSpeed;
            }
            if(debuffData[id].luck !== undefined){
                self.luck += debuffData[id].luck;
            }
            if(debuffData[id].attacks !== undefined){
                if(attackData[debuffData[id].attacks]){
                    for(var j in attackData[debuffData[id].attacks]){
                        if(self.mainAttackData[j]){
                            for(var k in attackData[debuffData[id].attacks][j]){
                                self.mainAttackData[j].push(attackData[debuffData[id].attacks][j][k]);
                            }
                        }
                        else{
                            self.mainAttackData[j] = Object.create(attackData[debuffData[id].attacks][j]);
                        }
                    }
                }
            }
            if(debuffData[id].passives !== undefined){
                if(attackData[debuffData[id].passives]){
                    for(var j in attackData[debuffData[id].passives]){
                        if(self.passiveAttackData[j]){
                            for(var k in attackData[debuffData[id].passives][j]){
                                self.passiveAttackData[j].push(attackData[debuffData[id].passives][j][k]);
                            }
                        }
                        else{
                            self.passiveAttackData[j] = Object.create(attackData[debuffData[id].passives][j]);
                        }
                    }
                }
            }
            self.roundStats();
        }
    }
    self.updateDebuffs = function(){
        for(var i in self.debuffs){
            self.debuffs[i].time -= 1;
            if(self.debuffs[i].time <= 0){
                delete self.debuffs[i];
                if(debuffData[i].hpMax !== undefined){
                    self.hpMax -= debuffData[i].hpMax;
                    self.hp -= debuffData[i].hpMax;
                }
                if(debuffData[i].hpRegen !== undefined){
                    self.stats.hpRegen -= debuffData[i].hpRegen;
                }
                if(debuffData[i].manaMax !== undefined){
                    self.manaMax -= debuffData[i].manaMax;
                    self.mana -= debuffData[i].manaMax;
                }
                if(debuffData[i].manaRegen !== undefined){
                    self.stats.manaRegen -= debuffData[i].manaRegen;
                }
                if(debuffData[i].damage !== undefined){
                    self.stats.damage -= debuffData[i].damage;
                }
                if(debuffData[i].critChance !== undefined){
                    self.stats.critChance -= debuffData[i].critChance;
                }
                if(debuffData[i].critPower !== undefined){
                    self.stats.critPower -= debuffData[i].critPower;
                }
                if(debuffData[i].defense !== undefined){
                    self.stats.defense -= debuffData[i].defense;
                }
                if(debuffData[i].movementSpeed !== undefined){
                    self.maxSpeed -= debuffData[i].movementSpeed;
                }
                if(debuffData[i].luck !== undefined){
                    self.luck -= debuffData[i].luck;
                }
                if(debuffData[i].attacks !== undefined || debuffData[i].passives !== undefined){
                    self.updateStats();
                }
                self.roundStats();
            }
        }
    }
    self.doAttack = function(data,reload){
        var runAttack = function(data){
            switch(data.id){
                case "projectile":
                    self.shootProjectile(data.projectileType,data.param);
                    break;
                case "monster":
                    for(var i = 0;i < data.amount;i++){
                        spawnMonster({
                            x:self.x,
                            y:self.y,
                            map:self.map,
                            spawnId:data.monsterType,
                        });
                    }
                    break;
                case "dash":
                    self.dash(data.param);
                    break;
                case "music":
                    for(var i in Player.list){
                        SOCKET_LIST[i].emit('musicBox',data.songName);
                    }
                    globalChat('#00ffff',self.name + ' started the music ' + songData[data.songName].name + '.');
                    break;
                case "debuff":
                    self.addDebuff(data.name,data.time);
                    break;
                case "nameChecker":
                    if(self.name === data.name){
                        for(var i in data.correct){
                            runAttack(data.correct[i]);
                        }
                    }
                    else{
                        for(var i in data.incorrect){
                            runAttack(data.incorrect[i]);
                        }
                    }
                    break;
            }
            if(data.xpGain){
                if(self.type === 'Player'){
                    self.xp += data.xpGain;
                }
            }
            if(data.hpCost){
                if(self.hp > data.hpCost){
                    self.hp -= data.hpCost;
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
        for(var i in data){
            if(reload % parseInt(i) === 0){
                for(var j = 0;j < data[i].length;j++){
                    if(data[i][j]){
                        runAttack(data[i][j]);
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
        pack.debuffs = self.debuffs;
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
    
    self.teleportStage = null;

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
    self.shieldProtection = 0;
    self.luck = 1;

    self.shieldActive = false;

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
    self.chatBanned = false;
    self.textColor = '#000000';
    if(param.chatBanned){
        self.chatBanned = param.chatBanned;
    }

    self.playTime = 0;

    self.clan = null;
    for(var i in Clan.list){
        for(var j in Clan.list[i].members){
            if(j === self.name){
                self.clan = i;
            }
        }
    }
    self.invitedClan = null;

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
                    self.inventory.items[i].cooldown = 0;
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
    if(param.database.playTime){
        self.playTime = param.database.playTime;
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
        pt.knockbackX = 0;
        pt.knockbackY = 0;
        pt.hp = 0;
        for(var i in SOCKET_LIST){
            if(Player.list[i]){
                if(Player.list[i].map === pt.map){
                    SOCKET_LIST[i].emit('createParticle',{
                        x:pt.x,
                        y:pt.y,
                        map:pt.map,
                        particleType:'death',
                        number:20,
                    });
                }
            }
        }
        if(SOCKET_LIST[pt.id]){
            SOCKET_LIST[pt.id].emit('death');
        }
        if(entity){
            if(entity === 'self'){
                var deathMessage = '';
                for(var i in pt.debuffs){
                    deathMessage = debuffData[i].deathMessage;
                }
                switch(deathMessage){
                    case "death":
                        globalChat('#ff0000',pt.name + ' realized nerfed death.');
                        break;
                    case "poison":
                        globalChat('#ff0000',pt.name + ' was poisoned to death.');
                        break;
                    case "radiation":
                        if(Math.random() < 0.001){
                            globalChat('#ff0000',pt.name + ' became Radioactive (64).');
                        }
                        else{
                            globalChat('#ff0000',pt.name + ' became radioactive.');
                        }
                        break;
                    case "fire":
                        globalChat('#ff0000',pt.name + ' went up in flames.');
                        break;
                    default:
                        globalChat('#ff0000',pt.name + ' committed suicide.');
                        break;
                }
            }
            else if(entity.name){
                globalChat('#ff0000',pt.name + ' was killed by ' + entity.name + '.');
            }
            else if(entity.parentName){
                globalChat('#ff0000',pt.name + ' was killed by ' + entity.parentName + '.');
            }
            else if(entity === 'tree'){
                globalChat('#ff0000',pt.name + ' was grown into a tree.');
            }
            else{
                globalChat('#ff0000',pt.name + ' died.');
            }
        }
        pt.debuffs = {};
        pt.updateStats();
    }
    self.update = function(){
        self.playTime += 1;
        self.stepsLeft = self.maxSpeed;
        var lastX = self.x;
        var lastY = self.y;
        self.updateDebug();
        self.updateCurrentItem();
        self.updateDebuffs();
        self.collided = {x:false,y:false};
        if(self.canMove && self.inDialogue === false){
            while(self.stepsLeft > 0){
                self.updateSpd();
                self.updateMove();
                var stepsLeft = self.stepsLeft;
                if(!self.dashing){
                    if(self.spdX !== 0 && self.spdY !== 0){
                        var minSpeed = Math.min(Math.min(Math.abs(self.spdX),Math.abs(self.spdY)),self.stepsLeft);
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
                        self.stepsLeft -= minSpeed;
                    }
                    else{
                        var maxSpeed = Math.min(Math.max(Math.abs(self.spdX),Math.abs(self.spdY)),self.stepsLeft);
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
                        self.stepsLeft -= maxSpeed;
                    }
                }
                else{
                    self.stepsLeft -= 1;
                }
                if(self.stepsLeft === stepsLeft){
                    break;
                }
                var spdX = self.spdX;
                var spdY = self.spdY;
                self.updatePosition();
                self.x = Math.round(self.x);
                self.y = Math.round(self.y);
                self.updateGridPosition();
                self.updateSlope();
                if(self.detectCollisions()){
                    self.x = self.lastX;
                    self.y = self.lastY;
                    self.stepsLeft = stepsLeft;
                    if(self.dashing){
                        self.dashing = false;
                        break;
                    }
                    self.collided = {x:false,y:false};
                    while(self.collided.x === false && self.collided.y === false){
                        if(spdX > 0){
                            self.spdX = 1;
                        }
                        else if(spdX < 0){
                            self.spdX = -1;
                        }
                        else{
                            self.spdX = 0;
                        }
                        if(spdY > 0){
                            self.spdY = 1;
                        }
                        else if(spdY < 0){
                            self.spdY = -1;
                        }
                        else{
                            self.spdY = 0;
                        }
                        self.updatePosition();
                        self.x = Math.round(self.x);
                        self.y = Math.round(self.y);
                        self.updateGridPosition();
                        self.updateSlope();
                        self.updateCollisions();
                        self.updateTransporter();
                        self.stepsLeft -= 1;
                        if(self.stepsLeft <= 0){
                            break;
                        }
                    }
                    if(self.collided.x && self.collided.y){
                        break;
                    }
                }
                self.updateTransporter();
            }
            self.spdX = self.x - lastX;
            self.spdY = self.y - lastY;
            if(self.knockbackX !== 0 || self.knockbackY !== 0){
                var spdX = self.spdX;
                var spdY = self.spdY;
                var xDistance = Math.abs(self.knockbackX);
                var yDistance = Math.abs(self.knockbackY);
                if(self.knockbackX !== 0){
                    var xDirection = xDistance / self.knockbackX;
                }
                else{
                    var xDirection = 0;
                }
                if(self.knockbackY !== 0){
                    var yDirection = yDistance / self.knockbackY;
                }
                else{
                    var yDirection = 0;
                }
                while(xDistance > 0 || yDistance > 0){
                    if(xDistance > yDistance){
                        self.spdX = Math.min(self.width,xDistance);
                        self.spdY = yDistance * self.spdX / xDistance;
                    }
                    else{
                        self.spdY = Math.min(self.height,yDistance);
                        self.spdX = xDistance * self.spdY / yDistance;
                    }
                    xDistance -= self.spdX;
                    yDistance -= self.spdY;
                    self.spdX *= xDirection;
                    self.spdY *= yDirection;
                    self.updatePosition();
                    self.updateGridPosition();
                    self.x = Math.round(self.x);
                    self.y = Math.round(self.y);
                    self.updateSlope();
                    if(self.detectCollisions()){
                        self.updateKnockbackCollisions();
                        if(self.collided.x && self.collided.y){
                            self.updateTransporter();
                            break;
                        }
                    }
                    self.updateTransporter();
                }
                if(self.knockbackX > 0){
                    self.knockbackX = Math.floor(self.knockbackX * 0.5);
                }
                else if(self.knockbackX < 0){
                    self.knockbackX = Math.ceil(self.knockbackX * 0.5);
                }
                if(self.knockbackY > 0){
                    self.knockbackY = Math.floor(self.knockbackY * 0.5);
                }
                else if(self.knockbackY < 0){
                    self.knockbackY = Math.ceil(self.knockbackY * 0.5);
                }
                self.spdX = spdX;
                self.spdY = spdY;
            }
        }
        self.updateRegion();
        if(self.inventory.updateStats){
            self.inventory.updateStats = false;
            self.updateStats();
        }
        self.updateXp();
        self.updateAnimation();
        self.updateAttack();
        self.updateHp();
        self.updateMana();
        self.lastChat -= 1;
    }
    self.updateSpd = function(){
        self.spdX = 0;
        self.spdY = 0;
        if(self.keyPress.up){
            self.spdY = -self.height;
        }
        if(self.keyPress.down){
            self.spdY = self.height;
        }
        if(self.keyPress.left){
            self.spdX = -self.width;
        }
        if(self.keyPress.right){
            self.spdX = self.width;
        }
        if(self.isDead){
            self.spdX = 0;
            self.spdY = 0;
        }
    }
    self.updateAttack = function(){
        if(self.keyPress.leftClick === true && self.canAttack && self.hp > 0 && self.shieldActive === false){
            self.passiveReload += 1;
            self.doAttack(self.passiveAttackData,self.passiveReload);
        }
        if(self.keyPress.leftClick === true && self.hp > 0 && self.shieldActive === false){
            if(self.inventory.items[self.inventory.hotbarSelectedItem]){
                if(self.inventory.items[self.inventory.hotbarSelectedItem].id){
                    if(Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].equip === 'consume' || Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].type === 'Tool' || Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].type === 'Music Box' || Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].type === 'Star' || self.canAttack){
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
                                    socket.emit('attack',Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].type);
                                    if(Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].manaCost){
                                        self.lastUsedMana = 0;
                                    }
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
    self.updateCurrentItem = function(){
        self.shieldActive = false;
        self.currentItem = '';
        if(self.keyPress.rightClick === true && self.inventory.items['shield'].id && (self.canAttack || self.map === 'World')){
            self.currentItem = self.inventory.items['shield'].id;
            self.shieldActive = true;
            self.stepsLeft = Math.ceil(self.stepsLeft / 5);
        }
        else if(self.inventory.items[self.inventory.hotbarSelectedItem]){
            if(self.inventory.items[self.inventory.hotbarSelectedItem].id){
                if(Item.list[self.inventory.items[self.inventory.hotbarSelectedItem].id].equip !== 'shield'){
                    self.currentItem = self.inventory.items[self.inventory.hotbarSelectedItem].id;
                }
            }
        }
    }
    self.updateStats = function(){
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
        self.shieldProtection = 0;
        self.luck = 1;

        self.pickaxePower = 0;
        self.axePower = 0;
        self.scythePower = 0;

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
                        if(item.luck !== undefined){
                            self.luck += item.luck;
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
                    if(item.shieldPower !== undefined){
                        self.shieldProtection += item.shieldPower;
                    }
                    if(item.luck !== undefined){
                        self.luck += item.luck;
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
        for(var i in self.debuffs){
            if(debuffData[i].hpMax !== undefined){
                self.hpMax += debuffData[i].hpMax;
                self.hp += debuffData[i].hpMax;
            }
            if(debuffData[i].hpRegen !== undefined){
                self.stats.hpRegen += debuffData[i].hpRegen;
            }
            if(debuffData[i].manaMax !== undefined){
                self.manaMax += debuffData[i].manaMax;
                self.mana += debuffData[i].manaMax;
            }
            if(debuffData[i].manaRegen !== undefined){
                self.stats.manaRegen += debuffData[i].manaRegen;
            }
            if(debuffData[i].damage !== undefined){
                self.stats.damage += debuffData[i].damage;
            }
            if(debuffData[i].critChance !== undefined){
                self.stats.critChance += debuffData[i].critChance;
            }
            if(debuffData[i].critPower !== undefined){
                self.stats.critPower += debuffData[i].critPower;
            }
            if(debuffData[i].defense !== undefined){
                self.stats.defense += debuffData[i].defense;
            }
            if(debuffData[i].movementSpeed !== undefined){
                self.maxSpeed += debuffData[i].movementSpeed;
            }
            if(debuffData[i].luck !== undefined){
                self.luck += debuffData[i].luck;
            }
            if(debuffData[i].attacks !== undefined){
                if(attackData[debuffData[i].attacks]){
                    for(var j in attackData[debuffData[i].attacks]){
                        if(self.mainAttackData[j]){
                            for(var k in attackData[debuffData[i].attacks][j]){
                                self.mainAttackData[j].push(attackData[debuffData[i].attacks][j][k]);
                            }
                        }
                        else{
                            self.mainAttackData[j] = Object.create(attackData[debuffData[i].attacks][j]);
                        }
                    }
                }
            }
            if(debuffData[i].passives !== undefined){
                if(attackData[debuffData[i].passives]){
                    for(var j in attackData[debuffData[i].passives]){
                        if(self.passiveAttackData[j]){
                            for(var k in attackData[debuffData[i].passives][j]){
                                self.passiveAttackData[j].push(attackData[debuffData[i].passives][j][k]);
                            }
                        }
                        else{
                            self.passiveAttackData[j] = Object.create(attackData[debuffData[i].passives][j]);
                        }
                    }
                }
            }
        }
        if(self.clan){
            if(Clan.list[self.clan].boosts.hpMax !== undefined){
                self.hpMax += Clan.list[self.clan].boosts.hpMax;
                self.hp += Clan.list[self.clan].boosts.hpMax;
            }
            if(Clan.list[self.clan].boosts.hpRegen !== undefined){
                self.stats.hpRegen += Clan.list[self.clan].boosts.hpRegen;
            }
            if(Clan.list[self.clan].boosts.manaMax !== undefined){
                self.manaMax += Clan.list[self.clan].boosts.manaMax;
                self.mana += Clan.list[self.clan].boosts.manaMax;
            }
            if(Clan.list[self.clan].boosts.manaRegen !== undefined){
                self.stats.manaRegen += Clan.list[self.clan].boosts.manaRegen;
            }
            if(Clan.list[self.clan].boosts.damage !== undefined){
                self.stats.damage += Clan.list[self.clan].boosts.damage;
            }
            if(Clan.list[self.clan].boosts.critChance !== undefined){
                self.stats.critChance += Clan.list[self.clan].boosts.critChance;
            }
            if(Clan.list[self.clan].boosts.critPower !== undefined){
                self.stats.critPower += Clan.list[self.clan].boosts.critPower;
            }
            if(Clan.list[self.clan].boosts.defense !== undefined){
                self.stats.defense += Clan.list[self.clan].boosts.defense;
            }
            if(Clan.list[self.clan].boosts.movementSpeed !== undefined){
                self.maxSpeed += Clan.list[self.clan].boosts.movementSpeed;
            }
            if(Clan.list[self.clan].boosts.slots !== undefined){
                self.inventory.maxSlots += Clan.list[self.clan].boosts.slots;
            }
            if(Clan.list[self.clan].boosts.shieldPower !== undefined){
                self.shieldProtection += Clan.list[self.clan].boosts.shieldPower;
            }
            if(Clan.list[self.clan].boosts.luck !== undefined){
                self.luck += Clan.list[self.clan].boosts.luck;
            }
            if(Clan.list[self.clan].boosts.attacks !== undefined){
                for(var i in Clan.list[self.clan].boosts.attacks){
                    if(attackData[Clan.list[self.clan].boosts.attacks[i]]){
                        for(var j in attackData[Clan.list[self.clan].boosts.attacks[i]]){
                            if(self.mainAttackData[j]){
                                for(var k in attackData[Clan.list[self.clan].boosts.attacks[i]][j]){
                                    self.mainAttackData[j].push(attackData[Clan.list[self.clan].boosts.attacks[i]][j][k]);
                                }
                            }
                            else{
                                self.mainAttackData[j] = Object.create(attackData[Clan.list[self.clan].boosts.attacks[i]][j]);
                            }
                        }
                    }
                }
            }
            if(Clan.list[self.clan].boosts.passives !== undefined){
                for(var i in Clan.list[self.clan].boosts.passives){
                    if(attackData[Clan.list[self.clan].boosts.passives[i]]){
                        for(var j in attackData[Clan.list[self.clan].boosts.passives[i]]){
                            if(self.passiveAttackData[j]){
                                for(var k in attackData[Clan.list[self.clan].boosts.passives[i]][j]){
                                    self.passiveAttackData[j].push(attackData[Clan.list[self.clan].boosts.passives[i]][j][k]);
                                }
                            }
                            else{
                                self.passiveAttackData[j] = Object.create(attackData[Clan.list[self.clan].boosts.passives[i]][j]);
                            }
                        }
                    }
                }
            }
        }
        self.roundStats();
        if(self.inventory.maxSlots !== maxSlots){
            self.inventory.refreshMenu(maxSlots);
        }

        if(hp > 0){
            self.hp += self.hpMax - hpMax;
        }

        self.mana += self.manaMax - manaMax;

        if(self.hp <= 0 && hp > 0){
            self.onDeath(self,'self');
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
                globalChat('#00ff00',self.name + ' is now level ' + self.level + '.');
                self.xp -= xpLevels[self.level - 1];
                self.updateStats();
            }
            else{
                self.xpMax = self.xp;
            }
        }
    }
    self.updateMana = function(){
        self.mana += self.stats.manaRegen / 20 * Math.min(self.lastUsedMana / 5,2);
        self.mana = Math.min(self.manaMax,self.mana);
        self.lastUsedMana += 1;
    }
    self.updateDebug = function(){
        if(self.debug.invincible){
            self.invincible = true;
        }
    }
    self.teleport = function(x,y,map){
        if(playerMap[map] === undefined){
            return;
        }
        self.transporter = {
            teleport:map,
            teleportx:x,
            teleporty:y,
        };
        self.canMove = false;
        self.canAttack = false;
        self.invincible = true;
        socket.emit('changeMap',self.transporter);
        self.teleportStage = 'fadeIn';
    }
    self.pickUpItems = function(id){
        if(self.canMove){
            if(DroppedItem.list[id]){
                if(DroppedItem.list[id].parent + '' === self.id + '' || DroppedItem.list[id].allPlayers){
                    if(self.getSquareDistance(DroppedItem.list[id]) < socket.renderDistance * 16){
                        if(DroppedItem.list[id].isColliding({x:self.mouseX,y:self.mouseY,width:0,height:0,map:self.map,type:'Player'})){
                            if(self.inventory.hasSpace(DroppedItem.list[id].item,DroppedItem.list[id].amount).hasSpace){
                                self.inventory.addItem(DroppedItem.list[id].item,DroppedItem.list[id].amount);
                                self.keyPress.leftClick = false;
                                delete DroppedItem.list[id];
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
    self.continueQuest = function(quest,questStage,questTasks){
        if(self.quest === false){
            self.quest = quest;
            self.questStage = questStage;
            self.questTasks = questTasks;
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
            self.startDialogue(quests[self.quest].json[self.questStage].dialogue);
            self.updateQuest(self);
        }
    }
    self.completeQuest = function(){

    }
    self.abandonQuest = function(){

    }
    self.updateClientQuest = function(){
        socket.emit('updateQuest',{quest:self.quest,tasks:self.questTasks});
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
        self.updateClientQuest();
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
        else{
            self.worldRegion = 'Altoris Island';
            if(ENV.spawnpoints[self.worldRegion]){
                self.teleport(ENV.spawnpoints[self.worldRegion].x,ENV.spawnpoints[self.worldRegion].y,ENV.spawnpoints[self.worldRegion].map);
            }
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
        pack.debuffs = self.debuffs;
        pack.type = self.type;
        return pack;
    }
    Player.list[self.id] = self;
    if(!self.advancements['Tutorial']){
        self.startQuest('Tutorial');
    }
    else if(param.database.quest){
        self.continueQuest(param.database.quest,param.database.questStage,param.database.questTasks);
    }
    self.updateGridPosition();
    self.updateRegion();
    return self;
}

Player.list = {};

Player.onConnect = function(socket,username,chatBanned){
    getDatabase(username,function(database){
        var player = Player({
            id:socket.id,
            username:username,
            database:database,
            chatBanned:chatBanned,
        },socket);
        for(var i in SOCKET_LIST){
            if(Player.list[i]){
                if(Player.list[i].map === player.map){
                    SOCKET_LIST[i].emit('initEntity',player.getInitPack());
                }
            }
        }
        
        if(Clan.list[player.clan]){
            socket.emit('selfId',{id:socket.id,name:player.name,img:player.img,worldRegion:player.worldRegion,weather:currentWeather,clan:Clan.list[player.clan]});
            if(Clan.list[player.clan].members[player.name] === 'leader' && Clan.list[player.clan].claimBoost){
                socket.emit('upgradeClan',clanData[Clan.list[player.clan].level].boosts);
            }
        }
        else{
            socket.emit('selfId',{id:socket.id,name:player.name,img:player.img,worldRegion:player.worldRegion,weather:currentWeather,clan:null});
        }

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
                    player.pickUpItems(data.selectedDroppedItem);
                }
            }
            if(data.inputId === player.keyMap.rightClick || data.inputId === player.secondKeyMap.rightClick || data.inputId === player.thirdKeyMap.rightClick){
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
                                for(var j in interactingEntity.messages[i].message){
                                    var message = Object.create(interactingEntity.messages[i]);
                                    message.message = interactingEntity.messages[i].message[j];
                                    messages.push(message);
                                }
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

        socket.on('createClan',function(data){
            if(!data){
                socket.disconnectUser();
                return;
            }
            if(typeof data !== 'string' || data === null){
                socket.disconnectUser();
                return;
            }
            if(player.clan !== null){
                return;
            }
            if(data[0] === ' '){
                player.sendMessage('[!] Your clan name may not start with a space.');
                return;
            }
            if(data[data.length - 1] === ' '){
                player.sendMessage('[!] Your clan name may not end with a space.');
                return;
            }
            if(data.includes('ㅤ')){
                player.sendMessage('[!] Your clan name may not contain a blank character.');
                return;
            }
            if(data.includes('‏‏‎ ‎')){
                player.sendMessage('[!] Your clan name may not contain a blank character.');
                return;
            }
            if(data.includes('--')){
                player.sendMessage('[!] Your clan name contains invalid characters.');
                return;
            }
            if(data.includes(';')){
                player.sendMessage('[!] Your clan name contains invalid characters.');
                return;
            }
            if(data.includes('<')){
                player.sendMessage('[!] Your clan name contains invalid characters.');
                return;
            }
            if(data.includes('>')){
                player.sendMessage('[!] Your clan name contains invalid characters.');
                return;
            }
            if(data.includes('\'')){
                player.sendMessage('[!] Your clan name contains invalid characters.');
                return;
            }
            if(data.length > 40){
                player.sendMessage('[!] Your clan name is too long.');
                return;
            }
            if(data.length < 4){
                player.sendMessage('[!] Your clan name is too short.');
                return;
            }
            for(var i in badwords){
                if(data.toLowerCase().includes(badwords[i])){
                    player.sendMessage('[!] Your clan name may not contain a bad word.');
                    return;
                }
            }
            if(Clan.list[data]){
                player.sendMessage('[!] There is already a clan with name ' + data + '.');
                return;
            }
            if(player.level < 5){
                player.sendMessage('[!] You need level 5 to create a clan.');
                return;
            }
            var clan = new Clan(data,{
                members:{},
                level:0,
                xp:0,
            });
            Database.addClan({name:clan.name,progress:JSON.stringify(clan)});
            clan.members[player.name] = 'leader';
            player.clan = data;
            socket.emit('updateClan',clan);
            player.sendMessage('[!] Created clan ' + data + '.');
        });
        socket.on('invitePlayer',function(data){
            if(!data){
                socket.disconnectUser();
                return;
            }
            if(typeof data !== 'string' || data === null){
                socket.disconnectUser();
                return;
            }
            if(player.clan === null){
                socket.disconnectUser();
                return;
            }
            if(Clan.list[player.clan]){
                if(Clan.list[player.clan].members[player.name] !== 'leader'){
                    return;
                }
                var numberOfMembers = 0;
                for(var i in Clan.list[player.clan].members){
                    numberOfMembers += 1;
                }
                if(Clan.list[player.clan].maxMembers <= numberOfMembers){
                    player.sendMessage('[!] Your clan may not support any more members.');
                    return;
                }
            }
            else{
                return;
            }
            for(var i in Player.list){
                if(Player.list[i].name === data){
                    if(Player.list[i].clan === null){
                        Player.list[i].sendMessage('[!] ' + player.name + ' is inviting you to join clan ' + player.clan + '. Type /clanaccept to accept the invitation');
                        Player.list[i].invitedClan = player.clan;
                        player.sendMessage('[!] Invited player ' + data + '.');
                        return;
                    }
                    else{
                        player.sendMessage('[!] Player ' + data + ' is already in a clan.');
                        return;
                    }
                }
            }
            player.sendMessage('[!] No player with name ' + data + '.');
            return;
        });
        socket.on('kickMember',function(data){
            if(!data){
                socket.disconnectUser();
                return;
            }
            if(typeof data !== 'string' || data === null){
                socket.disconnectUser();
                return;
            }
            if(player.clan === null){
                socket.disconnectUser();
                return;
            }
            if(data === player.name){
                return;
            }
            if(Clan.list[player.clan]){
                if(Clan.list[player.clan].members[player.name] !== 'leader'){
                    return;
                }
                if(Clan.list[player.clan].members[data]){
                    var clan = player.clan;
                    delete Clan.list[player.clan].members[data];
                    for(var i in Player.list){
                        for(var j in Clan.list[clan].members){
                            if(Player.list[i].name === j){
                                Player.list[i].sendMessage('[!] ' + data + ' has been kicked off clan ' + clan + '.');
                                if(SOCKET_LIST[i]){
                                    SOCKET_LIST[i].emit('updateClan',Clan.list[clan]);
                                }
                            }
                        }
                        if(Player.list[i].name === data){
                            Player.list[i].sendMessage('[!] You have been kicked off clan ' + clan + '.');
                            Player.list[i].clan = null;
                            Player.list[i].updateStats();
                            if(SOCKET_LIST[i]){
                                SOCKET_LIST[i].emit('updateClan',null);
                            }
                        }
                    }
                    return;
                }
            }
            else{
                return;
            }
            player.sendMessage('[!] No player with name ' + data + '.');
            return;
        });
        socket.on('leaveClan',function(){
            if(Clan.list[player.clan]){
                if(Clan.list[player.clan].members[player.name] === 'leader'){
                    return;
                }
                if(Clan.list[player.clan].members[player.name]){
                    var clan = player.clan;
                    player.sendMessage('[!] You left clan ' + player.clan + '.');
                    player.clan = null;
                    socket.emit('updateClan',null);
                    player.updateStats();
                    delete Clan.list[clan].members[player.name];
                    for(var i in Player.list){
                        for(var j in Clan.list[clan].members){
                            if(Player.list[i].name === j){
                                Player.list[i].sendMessage('[!] ' + player.name + ' has left clan ' + clan + '.');
                                if(SOCKET_LIST[i]){
                                    SOCKET_LIST[i].emit('updateClan',Clan.list[clan]);
                                }
                            }
                        }
                    }
                    return;
                }
            }
            return;
        });
        socket.on('transferLeadership',function(data){
            if(!data){
                socket.disconnectUser();
                return;
            }
            if(typeof data !== 'string' || data === null){
                socket.disconnectUser();
                return;
            }
            if(player.clan === null){
                socket.disconnectUser();
                return;
            }
            if(data === player.name){
                return;
            }
            if(Clan.list[player.clan]){
                if(Clan.list[player.clan].members[player.name] !== 'leader'){
                    return;
                }
                if(Clan.list[player.clan].members[data]){
                    Clan.list[player.clan].members[player.name] = 'member';
                    Clan.list[player.clan].members[data] = 'leader';
                    for(var i in Player.list){
                        for(var j in Clan.list[player.clan].members){
                            if(Player.list[i].name === j){
                                if(Player.list[i].name === data){
                                    Player.list[i].sendMessage('[!] ' + player.name + ' has transfered leadership to you.');
                                }
                                else if(Player.list[i].name === player.name){
                                    Player.list[i].sendMessage('[!] You transfered leadership to ' + data + '.');
                                }
                                else{
                                    Player.list[i].sendMessage('[!] ' + player.name + ' has transfered leadership to ' + data + '.');
                                }
                                if(SOCKET_LIST[i]){
                                    SOCKET_LIST[i].emit('updateClan',Clan.list[player.clan]);
                                }
                            }
                        }
                    }
                    return;
                }
                return;
            }
            player.sendMessage('[!] No player with name ' + data + '.');
            return;
        });
        socket.on('disbandClan',function(){
            if(Clan.list[player.clan]){
                if(Clan.list[player.clan].members[player.name] !== 'leader'){
                    return;
                }
                if(Clan.list[player.clan].members[player.name]){
                    var clan = player.clan;
                    player.sendMessage('[!] You disbanded ' + player.clan + '.');
                    player.clan = null;
                    socket.emit('updateClan',null);
                    player.updateStats();
                    delete Clan.list[clan].members[player.name];
                    for(var i in Player.list){
                        for(var j in Clan.list[clan].members){
                            if(Player.list[i].name === j){
                                Player.list[i].clan = null;
                                Player.list[i].sendMessage('[!] ' + player.name + ' has disbanded clan ' + clan + '.');
                                if(SOCKET_LIST[i]){
                                    SOCKET_LIST[i].emit('updateClan',null);
                                }
                                Player.list[i].updateStats();
                            }
                        }
                    }
                    delete Clan.list[clan];
                    Database.removeClan(clan);
                    return;
                }
            }
            return;
        });
        socket.on('selectUpgrade',function(data){
            if(data !== 'upgrade1' && data !== 'upgrade2' && data !== 'upgrade3' && data !== 'upgrade4'){
                socket.disconnectUser();
                return;
            }
            if(!player.clan){
                return;
            }
            if(Clan.list[player.clan].claimBoost === false){
                return;
            }
            for(var i in Clan.list[player.clan].members){
                if(player.name === i && Clan.list[player.clan].members[i] === 'leader'){
                    if(clanData[Clan.list[player.clan].level].boosts[data]){
                        var boost = clanData[Clan.list[player.clan].level].boosts[data];
                        var clan = Clan.list[player.clan];
                        for(var j in boost){
                            if(j === 'name' || j === 'drawId' || j === 'rarity' || j === 'description' || j === 'effects' || j === 'buffs'){
                                continue;
                            }
                            if(j === 'maxMembers'){
                                clan.maxMembers += boost[j];
                                continue;
                            }
                            if(j === 'effectDescription'){
                                if(boost[j] === ''){
                                    continue;
                                }
                                if(clan.boosts[j]){
                                    clan.boosts[j] += '<br>' + boost[j];
                                }
                                else{
                                    clan.boosts[j] = boost[j];
                                }
                                continue;
                            }
                            if(j === 'attacks'){
                                if(attackData[boost[j]]){
                                    if(clan.boosts[j]){
                                        clan.boosts[j].push(boost[j]);
                                    }
                                    else{
                                        clan.boosts[j] = [boost[j]];
                                    }
                                }
                                continue;
                            }
                            if(j === 'passives'){
                                if(attackData[boost[j]]){
                                    if(clan.boosts[j]){
                                        clan.boosts[j].push(boost[j]);
                                    }
                                    else{
                                        clan.boosts[j] = [boost[j]];
                                    }
                                }
                                continue;
                            }
                            if(clan.boosts[j]){
                                clan.boosts[j] += boost[j];
                            }
                            else{
                                clan.boosts[j] = boost[j];
                            }
                        }
                        clan.claimBoost = false;
                        for(var j in Player.list){
                            for(var k in clan.members){
                                if(Player.list[j].name === k){
                                    if(j + '' === socket.id + ''){
                                        Player.list[j].sendMessage('[!] You have claimed the boost ' + boost.name + '.');
                                    }
                                    else{
                                        Player.list[j].sendMessage('[!] ' + player.name + ' has claimed the boost ' + boost.name + '.');
                                    }
                                    if(SOCKET_LIST[j]){
                                        SOCKET_LIST[j].emit('updateClan',clan);
                                    }
                                    Player.list[j].updateStats();
                                }
                            }
                        }
                        clan.addXp(0);
                    }
                }
            }
        });

        socket.on('changePlayer',function(data){
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
            if(player.hp > 0){
                return;
            }
            player.hp = Math.round(player.hpMax / 2);
            player.invincible = true;
            player.knockbackX = 0;
            player.knockbackY = 0;
            player.teleportToSpawn();
            globalChat('#00ff00',player.name + ' respawned.');
        });

        socket.on('init',function(data){
            Player.getAllInitPack(socket);
        });

        socket.on('teleportFadeIn',function(data){
            if(player.teleportStage === 'fadeIn'){
                var map = player.map;
                playerMap[player.map] -= 1;
                player.map = player.transporter.teleport;
                if(player.transporter.teleportx !== -1){
                    player.x = player.transporter.teleportx;
                }
                if(player.transporter.teleporty !== -1){
                    player.y = player.transporter.teleporty;
                }
                playerMap[player.map] += 1;
                if(map !== player.map){
                    Player.getAllInitPack(socket);
                    for(var i in Player.list){
                        if(SOCKET_LIST[i]){
                            if(Player.list[i].map === player.map){
                                SOCKET_LIST[i].emit('initEntity',player.getInitPack());
                            }
                            else{
                                SOCKET_LIST[i].emit('removePlayer',player.id);
                            }
                        }
                    }
                }
                player.updateGridPosition();
                player.updateRegion();
                player.teleportStage = 'fadeOut';
            }
        });
        socket.on('teleportFadeOut',function(data){
            if(player.teleportStage === 'fadeOut'){
                player.canMove = true;
                player.invincible = false;
                player.teleportStage = null;
            }
        });

        socket.on('signInFinished',function(data){
            if(player.loggedOn === false){
                player.loggedOn = true;
                player.canMove = true;
                player.invincible = false;
                Player.getAllInitPack(socket);
                globalChat('#00ff00',player.name + " just logged on.");
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
                    for(var i = 0;i < 18;i++){
                        Player.list[Player.list[socket.id].tradingEntity].inventory.items['trade' + i] = {};
                    }
                    if(SOCKET_LIST[Player.list[socket.id].tradingEntity]){
                        SOCKET_LIST[Player.list[socket.id].tradingEntity].emit('closeTrade');
                    }
                    for(var i in Player.list[socket.id].inventory.items){
                        if(i.slice(0,5) === 'trade' && parseInt(i.substring(5)) <= 8){
                            if(Player.list[socket.id].inventory.items[i].id){
                                Player.list[socket.id].inventory.addItem(Player.list[socket.id].inventory.items[i].id,Player.list[socket.id].inventory.items[i].amount);
                            }
                        }
                    }
                    for(var i = 0;i < 18;i++){
                        Player.list[socket.id].inventory.items['trade' + i] = {};
                    }
                    Player.list[Player.list[socket.id].tradingEntity].tradingEntity = null;
                }
            }
            playerMap[Player.list[socket.id].map] -= 1;
            if(Player.list[socket.id].debug.invisible === false){
                globalChat('#ff0000',Player.list[socket.id].name + " logged off.");
            }
        }
        if(Player.list[socket.id].inventory.draggingItem.id){
            Player.list[socket.id].inventory.addItem(Player.list[socket.id].inventory.draggingItem.id,Player.list[socket.id].inventory.draggingItem.amount);
        }
        storeDatabase();
        delete Player.list[socket.id];
    }
    else{
        storeDatabase();
    }
    socket.disconnect();
}
Player.getAllInitPack = function(socket){
    var player = Player.list[socket.id];
    if(player){
        var pack = {player:[],projectile:[],monster:[],npc:[],droppedItem:[],harvestableNpc:[]};
        for(var i in Player.list){
            if(Player.list[i].map === player.map){
                if(Player.list[i].debug.invisible === false || i + '' === socket.id + ''){
                    if(player.getSquareDistance(Player.list[i]) < socket.renderDistance * 16){
                        pack.player.push(Player.list[i].getInitPack());
                    }
                }
            }
        }
        for(var i in Projectile.list){
            if(Projectile.list[i].map === player.map){
                if(player.getSquareDistance(Projectile.list[i]) < socket.renderDistance * 16){
                    pack.projectile.push(Projectile.list[i].getInitPack());
                }
            }
        }
        for(var i in Monster.list){
            if(Monster.list[i].map === player.map){
                if(player.getSquareDistance(Monster.list[i]) < socket.renderDistance * 16){
                    pack.monster.push(Monster.list[i].getInitPack());
                }
            }
        }
        for(var i in Npc.list){
            if(Npc.list[i].map === player.map){
                if(player.getSquareDistance(Npc.list[i]) < socket.renderDistance * 16){
                    pack.npc.push(Npc.list[i].getInitPack());
                }
            }
        }
        for(var i in DroppedItem.list){
            if(DroppedItem.list[i].map === player.map){
                if(player.getSquareDistance(DroppedItem.list[i]) < socket.renderDistance * 16){
                    pack.droppedItem.push(DroppedItem.list[i].getInitPack());
                }
            }
        }
        for(var i in HarvestableNpc.list){
            if(HarvestableNpc.list[i].map === player.map){
                if(player.getSquareDistance(HarvestableNpc.list[i]) < socket.renderDistance * 16){
                    pack.harvestableNpc.push(HarvestableNpc.list[i].getInitPack());
                }
            }
        }
        socket.emit('update',pack);
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
    self.debuffs = param.debuffs;
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
        var calculations = Math.floor(Math.max(Math.max(Math.abs(self.spdX) / self.width,Math.abs(self.spdY) / self.height),1));
        var spdX = self.spdX;
        var spdY = self.spdY;
        if(self.collisionType === 'none'){
            calculations = 1;
        }
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
        self.direction = self.direction % 360;
        while(self.direction < 0){
            self.direction += 360;
        }
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
            if(!Player.list[self.parent] && self.projectilePattern === 'waraxe'){
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
            if(!Monster.list[self.parent] && self.projectilePattern === 'waraxe'){
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
            var nearestEntity = null;
            var nearestDirection = 0;
            var nearestDistance = 0;
            for(var i in Player.list){
                if(Player.list[i].team !== self.team && Player.list[i].map === self.map && Player.list[i].hp > 0){
                    var direction = Math.atan2(Player.list[i].y - self.y,Player.list[i].x - self.x) / Math.PI * 180 - self.direction;
                    direction = direction % 360;
                    while(direction < 0){
                        direction += 360;
                    }
                    if(direction > 180){
                        direction -= 360;
                    }
                    else if(direction < -180){
                        direction += 360;
                    }
                    if(nearestEntity === null){
                        nearestDirection = direction;
                        nearestDistance = self.getDistance(Player.list[i]);
                        nearestEntity = Player.list[i];
                    }
                    else if(Math.abs(direction) < Math.abs(nearestDirection) && self.getDistance(Player.list[i]) < nearestDistance * 3){
                        nearestDirection = direction;
                        nearestDistance = self.getDistance(Player.list[i]);
                        nearestEntity = Player.list[i];
                    }
                }
            }
            for(var i in Monster.list){
                if(Monster.list[i].team !== self.team && Monster.list[i].map === self.map && Monster.list[i].hp > 0){
                    var direction = Math.atan2(Monster.list[i].y - self.y,Monster.list[i].x - self.x) / Math.PI * 180 - self.direction;
                    direction = direction % 360;
                    while(direction < 0){
                        direction += 360;
                    }
                    if(direction > 180){
                        direction -= 360;
                    }
                    else if(direction < -180){
                        direction += 360;
                    }
                    if(nearestEntity === null){
                        nearestDirection = direction;
                        nearestDistance = self.getDistance(Monster.list[i]);
                        nearestEntity = Monster.list[i];
                    }
                    else if(Math.abs(direction) < Math.abs(nearestDirection) && self.getDistance(Monster.list[i]) < nearestDistance * 3){
                        nearestDirection = direction;
                        nearestDistance = self.getDistance(Monster.list[i]);
                        nearestEntity = Monster.list[i];
                    }
                }
            }
            if(nearestEntity){
                self.spdX += Math.cos(self.direction / 180 * Math.PI) * param.speed / 10;
                self.spdY += Math.sin(self.direction / 180 * Math.PI) * param.speed / 10;
            }
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
            var nearestDirection = 0;
            var nearestDistance = 0;
            for(var i in Player.list){
                if(Player.list[i].team !== self.team && Player.list[i].map === self.map && Player.list[i].hp > 0){
                    var direction = Math.atan2(Player.list[i].y - self.y,Player.list[i].x - self.x) / Math.PI * 180 - self.direction;
                    direction = direction % 360;
                    while(direction < 0){
                        direction += 360;
                    }
                    if(direction > 180){
                        direction -= 360;
                    }
                    else if(direction < -180){
                        direction += 360;
                    }
                    if(nearestEntity === null){
                        nearestDirection = direction;
                        nearestDistance = self.getDistance(Player.list[i]);
                        nearestEntity = Player.list[i];
                    }
                    else if(Math.abs(direction) < Math.abs(nearestDirection) && self.getDistance(Player.list[i]) < nearestDistance * 3){
                        nearestDirection = direction;
                        nearestDistance = self.getDistance(Player.list[i]);
                        nearestEntity = Player.list[i];
                    }
                }
            }
            for(var i in Monster.list){
                if(Monster.list[i].team !== self.team && Monster.list[i].map === self.map && Monster.list[i].hp > 0){
                    var direction = Math.atan2(Monster.list[i].y - self.y,Monster.list[i].x - self.x) / Math.PI * 180 - self.direction;
                    direction = direction % 360;
                    while(direction < 0){
                        direction += 360;
                    }
                    if(direction > 180){
                        direction -= 360;
                    }
                    else if(direction < -180){
                        direction += 360;
                    }
                    if(nearestEntity === null){
                        nearestDirection = direction;
                        nearestDistance = self.getDistance(Monster.list[i]);
                        nearestEntity = Monster.list[i];
                    }
                    else if(Math.abs(direction) < Math.abs(nearestDirection) && self.getDistance(Monster.list[i]) < nearestDistance * 3){
                        nearestDirection = direction;
                        nearestDistance = self.getDistance(Monster.list[i]);
                        nearestEntity = Monster.list[i];
                    }
                }
            }
            if(nearestEntity){
                self.direction += nearestDirection / 5;
                self.spdX = Math.cos(self.direction / 180 * Math.PI) * param.speed;
                self.spdY = Math.sin(self.direction / 180 * Math.PI) * param.speed;
            }
        }
    }
    self.updateCollisions = function(){
        if(self.collisionType === 'none'){
            return;
        }
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
                                        if(self.collisionType === 'remove'){
                                            self.toRemove = true;
                                            self.collided = true;
                                        }
                                        else if(self.collisionType === 'sticky'){
                                            self.spdX = 0;
                                            self.spdY = 0;
                                            self.x = self.lastX;
                                            self.y = self.lastY;
                                            self.spin = 0;
                                            self.collided = true;
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

    self.boss = false;
    self.bossMusic = 'none';
    
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
    self.targetType = null;
    self.damaged = false;

    self.type = 'Monster';

    self.attackState = 'passive';

    self.mainAttackData = self.phases[self.phase].mainAttackData;

    self.spawnId = param.spawnId;

    self.updated = true;

    self.targetX = 0;
    self.targetY = 0;

    self.trackSteps = 64;
    self.targetLeftView = 0;
    self.circlingTarget = false;
    self.circleDirection = 1;
    self.randomPos = {
        x:self.x,
        y:self.y,
        spdX:0,
        spdY:0,
        timeX:0,
        timeY:0,
    };

    self.mainReload = 0;
    self.passiveReload = 0;
    
    self.randomWalk(true);

    if(self.boss === true){
        globalChat('#990099',self.name + ' has spawned!');
    }
    
    self.onHit = function(pt){
        if(pt.sameId === false){
            self.projectilesHit[pt.id] = 10;
        }
        self.knockbackX += pt.spdX / 4 * (1 - self.knockbackResistance);
        self.knockbackY += pt.spdY / 4 * (1 - self.knockbackResistance);
        if(self.attackState === 'passive'){
            self.target = pt.parent;
            self.targetType = pt.parentType;
            self.damaged = true;
            self.attackState = 'attack';
            self.targetLeftView = 0;
        }
    }
    self.getTarget = function(){
        if(self.targetType === 'Player'){
            return Player.list[self.target];
        }
        else if(self.targetType === 'Monster'){
            return Monster.list[self.target];
        }
    }
    self.retreat = function(){
        self.target = null;
        self.targetType = null;
        self.attackState = 'retreat';
        self.trackPos(self.randomPos.x,self.randomPos.y);
        self.maxSpeed *= 2;
        self.spdX = 0;
        self.spdY = 0;
    }
    self.update = function(){
        self.stepsLeft = self.maxSpeed;
        var lastX = self.x;
        var lastY = self.y;
        var circleDirection = self.circleDirection;
        self.collided = {x:false,y:false};
        if(self.canMove){
            while(self.stepsLeft > 0){
                self.trackTarget();
                self.updateMove();
                var stepsLeft = self.stepsLeft;
                if(!self.dashing){
                    if(self.spdX !== 0 && self.spdY !== 0){
                        var minSpeed = Math.min(Math.min(Math.abs(self.spdX),Math.abs(self.spdY)),self.stepsLeft);
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
                        self.stepsLeft -= minSpeed;
                        self.trackSteps += minSpeed;
                    }
                    else{
                        var maxSpeed = Math.min(Math.max(Math.abs(self.spdX),Math.abs(self.spdY)),self.stepsLeft);
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
                        self.stepsLeft -= maxSpeed;
                        self.trackSteps += maxSpeed;
                    }
                }
                else{
                    self.stepsLeft -= 1;
                    self.trackSteps += Math.max(self.spdX,self.spdY);
                }
                if(self.stepsLeft === stepsLeft){
                    break;
                }
                var spdX = self.spdX;
                var spdY = self.spdY;
                self.updatePosition();
                self.x = Math.round(self.x);
                self.y = Math.round(self.y);
                self.updateGridPosition();
                self.updateSlope();
                self.updateRegion();
                if(self.detectCollisions()){
                    self.x = self.lastX;
                    self.y = self.lastY;
                    self.trackSteps -= self.stepsLeft - stepsLeft;
                    self.stepsLeft = stepsLeft;
                    if(self.dashing){
                        self.dashing = false;
                        break;
                    }
                    self.collided = {x:false,y:false};
                    while(self.collided.x === false && self.collided.y === false){
                        if(spdX > 0){
                            self.spdX = 1;
                        }
                        else if(spdX < 0){
                            self.spdX = -1;
                        }
                        else{
                            self.spdX = 0;
                        }
                        if(spdY > 0){
                            self.spdY = 1;
                        }
                        else if(spdY < 0){
                            self.spdY = -1;
                        }
                        else{
                            self.spdY = 0;
                        }
                        self.updatePosition();
                        self.x = Math.round(self.x);
                        self.y = Math.round(self.y);
                        self.updateGridPosition();
                        self.updateSlope();
                        self.updateRegion();
                        self.updateCollisions();
                        self.stepsLeft -= 1;
                        self.trackSteps += 1;
                        if(self.stepsLeft <= 0){
                            break;
                        }
                    }
                    if(self.collided.x && self.collided.y){
                        break;
                    }
                }
            }
            self.spdX = self.x - lastX;
            self.spdY = self.y - lastY;
            if(self.knockbackX !== 0 || self.knockbackY !== 0){
                var spdX = self.spdX;
                var spdY = self.spdY;
                var xDistance = Math.abs(self.knockbackX);
                var yDistance = Math.abs(self.knockbackY);
                if(self.knockbackX !== 0){
                    var xDirection = xDistance / self.knockbackX;
                }
                else{
                    var xDirection = 0;
                }
                if(self.knockbackY !== 0){
                    var yDirection = yDistance / self.knockbackY;
                }
                else{
                    var yDirection = 0;
                }
                while(xDistance > 0 || yDistance > 0){
                    if(xDistance > yDistance){
                        self.spdX = Math.min(self.width,xDistance);
                        self.spdY = yDistance * self.spdX / xDistance;
                    }
                    else{
                        self.spdY = Math.min(self.height,yDistance);
                        self.spdX = xDistance * self.spdY / yDistance;
                    }
                    xDistance -= self.spdX;
                    yDistance -= self.spdY;
                    self.spdX *= xDirection;
                    self.spdY *= yDirection;
                    self.updatePosition();
                    self.updateGridPosition();
                    self.x = Math.round(self.x);
                    self.y = Math.round(self.y);
                    self.updateSlope();
                    self.updateRegion();
                    if(self.detectCollisions()){
                        self.updateKnockbackCollisions();
                        if(self.collided.x && self.collided.y){
                            break;
                        }
                    }
                }
                if(self.knockbackX > 0){
                    self.knockbackX = Math.floor(self.knockbackX * 0.5);
                }
                else if(self.knockbackX < 0){
                    self.knockbackX = Math.ceil(self.knockbackX * 0.5);
                }
                if(self.knockbackY > 0){
                    self.knockbackY = Math.floor(self.knockbackY * 0.5);
                }
                else if(self.knockbackY < 0){
                    self.knockbackY = Math.ceil(self.knockbackY * 0.5);
                }
                self.spdX = spdX;
                self.spdY = spdY;
            }
        }
        self.updateTarget();
        self.updateAnimation();
        self.updatePhase();
        self.updateAttack();
        self.updateDebuffs();
        self.updateHp();
        if(self.targetLeftView > 0){
            self.circleDirection = circleDirection * -1;
        }
    }
    self.updateTarget = function(){
        if(self.attackState === 'passive'){
            self.target = null;
            self.targetType = null;
            for(var i in Player.list){
                if(Player.list[i].map === self.map){
                    if(Player.list[i].team !== self.team){
                        if(Player.list[i].hp > 0){
                            if(Player.list[i].regionChanger.noMonster === false){
                                if(self.getSquareDistance(Player.list[i]) < 8 && Player.list[i].getSquareDistance(self.randomPos) <= 48){
                                    if(self.canSee(Player.list[i])){
                                        if(Player.list[i]){
                                            self.target = i;
                                            self.targetType = 'Player';
                                            self.attackState = 'attack';
                                            self.damaged = false;
                                            self.targetLeftView = 0;
                                            return;
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
            if(self.getTarget()){
                if(self.getTarget().hp <= 0){
                    self.retreat();
                    return;
                }
                else if(self.getTarget().team === self.team){
                    self.retreat();
                    return;
                }
                else if(self.getTarget().map !== self.map){
                    self.retreat();
                    return;
                }
                if(self.getSquareDistance(self.getTarget()) > 12 && self.damaged === false){
                    self.retreat();
                    return;
                }
                else if(self.getSquareDistance(self.getTarget()) > 32){
                    self.retreat();
                    return;
                }
                else if(self.getSquareDistance(self.randomPos) > 48){
                    self.retreat();
                    return;
                }
                if(self.canSee(self.getTarget()) === false){
                    self.targetLeftView += 1;
                    if(self.targetLeftView >= 100){
                        self.retreat();
                        return;
                    }
                }
                else{
                    self.targetLeftView = 0;
                }
                self.targetX = self.getTarget().x;
                self.targetY = self.getTarget().y;
                if(self.getTarget().regionChanger){
                    if(self.getTarget().regionChanger.noMonster === true){
                        self.retreat();
                        return;
                    }
                }
            }
            else{
                self.retreat();
                return;
            }
        }
    }
    self.trackTarget = function(){
        if(self.attackState === 'passive'){
            if(self.randomPos.spdX === 0 && self.randomPos.timeX <= 0){
                self.randomPos.spdX = Math.round(Math.random() * 2 - 1);
                self.randomPos.timeX = 50 * Math.random() + 50;
            }
            else if(self.randomPos.spdX !== 0 && self.randomPos.timeX <= 0){
                self.randomPos.spdX = 0;
                self.randomPos.timeX = 50 * Math.random() + 50;
            }
            if(self.randomPos.spdY === 0 && self.randomPos.timeY <= 0){
                self.randomPos.spdY = Math.round(Math.random() * 2 - 1);
                self.randomPos.timeY = 50 * Math.random() + 50;
            }
            else if(self.randomPos.spdY !== 0 && self.randomPos.timeY <= 0){
                self.randomPos.spdY = 0;
                self.randomPos.timeY = 50 * Math.random() + 50;
            }
            self.spdX = self.randomPos.spdX;
            self.spdY = self.randomPos.spdY;
            self.randomPos.timeX -= 1;
            self.randomPos.timeY -= 1;
            if(self.getSquareDistance(self.randomPos) > 8 && self.trackingPath.length === 0){
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
            if(self.getTarget()){
                self.spdX = 0;
                self.spdY = 0;
                var size = 33;
                if(self.getSquareDistance(self.getTarget()) > 16){
                    size = 65;
                }
                if(self.getSquareDistance(self.getTarget()) > 32){
                    size = 97;
                }
                if(self.getSquareDistance(self.getTarget()) > 48){
                    size = 129;
                }
                var nx = Math.floor(size / 2);
                var ny = Math.floor(size / 2);
                var dx = Math.floor(self.x / 64 - (self.width / 64 - 1) / 2) - nx;
                var dy = Math.floor(self.y / 64 - (self.height / 64 - 1) / 2) - ny;
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][self.zindex]){
                        if(Collision.list[self.map][self.zindex][dx + nx]){
                            if(Collision.list[self.map][self.zindex][dx + nx][dy + ny]){
                                var lastDx = dx;
                                var lastDy = dy;
                                var distance = -1;
                                for(var i = 2;i > -Math.round(self.width / 64) - 2;i--){
                                    for(var j = 2;j > -Math.round(self.height / 64) - 2;j--){
                                        if(Collision.list[self.map][self.zindex][lastDx + nx + i]){
                                            if(Collision.list[self.map][self.zindex][lastDx + nx + i][lastDy + ny + j]){
                                                continue;
                                            }
                                        }
                                        self.x -= (self.width - 64) / 2;
                                        self.y -= (self.height - 64) / 2;
                                        if(self.getRhombusDistance({x:self.gridX * 64 + i * 64 + 32,y:self.gridY * 64 + j * 64 + 32}) < distance || distance === -1){
                                            distance = self.getRhombusDistance({x:self.gridX * 64 + i * 64 + 32,y:self.gridY * 64 + j * 64 + 32});
                                            dx = lastDx + i;
                                            dy = lastDy + j;
                                        }
                                        self.x += (self.width - 64) / 2;
                                        self.y += (self.height - 64) / 2;
                                    }
                                }
                            }
                        }
                    }
                }
                var tx = self.getTarget().gridX - dx;
                var ty = self.getTarget().gridY - dy;
                var distance = self.getDistance(self.getTarget());
                if(distance < self.circleDistance * 3 / 4 && self.targetLeftView === 0){
                    self.circlingTarget = true;
                }
                else if(distance > self.circleDistance){
                    self.circlingTarget = false;
                }
                if(self.circlingTarget){
                    self.trackingPath = [];
                    var direction = Math.atan2(self.y - self.targetY,self.x - self.targetX) / Math.PI * 180;
                    direction = Math.floor(direction / 45 + 0.5);
                    if(distance < self.circleDistance / 2){
                        direction -= 1;
                    }
                    direction = direction % 8;
                    while(direction < 0){
                        direction += 8;
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
                    if(self.trackSteps >= 64 || self.trackingPath.length === 0){
                        self.trackSteps = 0;
                        var finder = new PF.BiAStarFinder({
                            allowDiagonal:true,
                            dontCrossCorners:true,
                        });
                        var grid = new PF.Grid(size,size);
                        for(var i = 0;i < size;i++){
                            for(var j = 0;j < size;j++){
                                var setWalkableAt = function(){
                                    for(var k = -Math.round(self.width / 64) + 1;k < 1;k++){
                                        for(var l = -Math.round(self.height / 64) + 1;l < 1;l++){
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
                        if(tx < size && tx > 0 && ty < size && ty > 0){
                            if(grid.nodes[ty][tx].walkable === false){
                                var x = tx;
                                var y = ty;
                                var distance = -1;
                                for(var i = -2;i < 3;i++){
                                    for(var j = -2;j < 3;j++){
                                        if(x + i >= 0 && x + i < size && y + j >= 0 && y + j < size){
                                            if(grid.nodes[y + j][x + i].walkable === true && (Math.abs(i) + Math.abs(j) < distance || distance === -1)){
                                                tx = x + i;
                                                ty = y + j;
                                                distance = Math.abs(i) + Math.abs(j);
                                            }
                                        }
                                    }
                                }
                            }
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
                self.retreat();
            }
        }
        else if(self.attackState === 'retreat'){
            if(self.getSquareDistance(self.randomPos) <= 2){
                self.attackState = 'passive';
                self.maxSpeed = Math.round(self.maxSpeed / 2);
            }
            if(!self.trackingPath[0]){
                self.trackPos(self.randomPos.x,self.randomPos.y);
            }
        }
    }
    self.changePhase = function(){
        self.phase = self.phases[self.phase].changePhase.nextPhases[Math.floor(Math.random() * self.phases[self.phase].changePhase.nextPhases.length)];
        self.mainAttackData = self.phases[self.phase].mainAttackData;
    }
    self.updatePhase = function(){
        if(self.phases[self.phase].changePhase.hp >= self.hp){
            self.changePhase();
        }
    }
    self.updateAttack = function(){
        if(!self.getTarget()){
            return;
        }
        if(!self.canAttack){
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
        pack.boss = self.boss;
        pack.bossMusic = self.bossMusic;
        pack.type = self.type;
        return pack;
    }
    Monster.list[self.id] = self;
    return self;
}
Monster.list = {};

Npc = function(param){
    var self = Actor(param);
    self.animationDirection = param.animationDirection;
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
        // self.stepsLeft = self.maxSpeed;
        // for(var i = 0;i < self.stepsLeft;i++){
        //     self.updateMove();
        //     if(self.canMove){
        //         self.updatePosition();
        //     }
        //     self.updateGridPosition();
        //     self.updateCollisions();
        //     self.updateRegion();
        // }
        // self.x = Math.round(self.x);
        // self.y = Math.round(self.y);
        // self.updateAnimation();
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
                },self.collisionId,self.deathMessage);
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
                if(self.itemDrops[i].chance <= 0.01){
                    globalChat('#00ffff','RARE DROP! ' + Player.list[pt].name + ' got ' + Item.list[i].name + '! ' + (self.itemDrops[i].chance * 100) + '% Drop Chance!');
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
    var isColliding = function(){
        for(var i = Math.floor((self.x - self.width / 2) / 64);i <= Math.floor((self.x + self.width / 2) / 64);i++){
            for(var j = Math.floor((self.y - self.height / 2) / 64);j <= Math.floor((self.y + self.height / 2) / 64);j++){
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][0]){
                        if(Collision.list[self.map][0][i]){
                            if(Collision.list[self.map][0][i][j]){
                                var collision = Collision.list[self.map][0][i][j];
                                for(var k in collision){
                                    if(self.isColliding(collision[k])){
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
    var foundSpot = false;
    for(var index = 0;index < 100;index++){
        self.x = Math.round(param.x + 128 * Math.random() - 64);
        self.y = Math.round(param.y + 128 * Math.random() - 64);
        if(isColliding()){
            continue;
        }
        else{
            foundSpot = true;
            break;
        }
    }
    if(foundSpot === false){
        var availablePositions = [];
        for(var x = -64;x <= 64;x++){
            for(var y = -64;y < 64;y++){
                if(availablePositions[x]){
                    availablePositions[x][y] = 1;
                }
                else{
                    availablePositions[x] = [];
                    availablePositions[x][y] = 1;
                }
            }
        }
        for(var i = Math.floor((self.x - 64) / 64);i <= Math.floor((self.x + 64) / 64);i++){
            for(var j = Math.floor((self.y - 64) / 64);j <= Math.floor((self.y + 64) / 64);j++){
                if(Collision.list[self.map]){
                    if(Collision.list[self.map][0]){
                        if(Collision.list[self.map][0][i]){
                            if(Collision.list[self.map][0][i][j]){
                                var collision = Collision.list[self.map][0][i][j];
                                for(var k in collision){
                                    for(var l = collision[k].x - collision[k].width / 2 - self.width / 2;l < collision[k].x + collision[k].width / 2 + self.width / 2;l++){
                                        if(availablePositions[l]){
                                            for(var m = collision[k].x - collision[k].width / 2 - self.width / 2;m < collision[k].x + collision[k].width / 2 + self.width / 2;m++){
                                                if(availablePositions[l][m]){
                                                    availablePositions[l][m] = 0;
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
        }
        var numberOfPositions = 0;
        for(var x in availablePositions){
            for(var y in availablePositions[x]){
                if(availablePositions[x][y]){
                    numberOfPositions += 1;
                }
            }
        }
        if(numberOfPositions === 0){
            self.x += Math.floor(Math.random() * 128 - 64);
            self.y += Math.floor(Math.random() * 128 - 64);
        }
        else{
            var randomNumber = Math.floor(Math.random() * numberOfPositions);
            var currentPosition = 0;
            for(var x in availablePositions){
                for(var y in availablePositions[x]){
                    if(availablePositions[x][y]){
                        if(currentPosition === randomNumber){
                            self.x += parseInt(x);
                            self.y += parseInt(y);
                        }
                        currentPosition += 1;
                    }
                }
            }
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