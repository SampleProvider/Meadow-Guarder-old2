Collision = function(param){
    var self = {};
    self.map = param.map;
    self.x = param.x;
    self.y = param.y;
    self.id = "" + self.map + ":" + (Math.floor(self.x / 64) * 64) + ":" + (Math.floor(self.y / 64) * 64) + ":";
    self.width = param.width;
    self.height = param.height;
    self.info = param.info;
    self.type = 'Collision';
    if(Collision.list[self.id]){
        Collision.list[self.id].push(self);
    }
    else{
        Collision.list[self.id] = [self];
    }
    return self;
}
Collision.list = {};

Spawner = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + (Math.floor(self.x / 64) * 64) + ":" + (Math.floor(self.y / 64) * 64) + ":";
    self.spawned = false;
    self.toRemove = false;
    self.spawnId = param.spawnId;
    self.type = 'Spawner';
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    Spawner.list[self.id] = self;
    return self;
}
Spawner.list = {};

Transporter = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + Math.floor(self.x / 64) * 64 + ":" + Math.floor(self.y / 64) * 64 + ":";
    self.teleport = param.teleport;
    self.teleportx = parseInt(param.teleportx,10) * 64 + 32;
    self.teleporty = parseInt(param.teleporty,10) * 64 + 32;
    self.teleportdirection = param.teleportdirection;
    self.toRemove = false;
    self.type = 'Transporter';
    self.width = param.width;
    self.height = param.height;
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    Transporter.list[self.id] = self;
    return self;
}
Transporter.list = {};

RegionChanger = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + Math.floor(self.x / 64) * 64 + ":" + Math.floor(self.y / 64) * 64 + ":";
    self.region = param.region;
    self.toRemove = false;
    self.type = 'RegionChanger';
    self.width = param.width;
    self.height = param.height;
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    RegionChanger.list[self.id] = self;
    return self;
}
RegionChanger.list = {};

QuestInfo = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + Math.floor(self.x / 64) * 64 + ":" + Math.floor(self.y / 64) * 64 + ":";
    self.info = param.info;
    self.quest = param.quest;
    self.width = param.width;
    self.height = param.height;
    self.toRemove = false;
    self.type = 'QuestInfo';
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    QuestInfo.list[self.id] = self;
    return self;
}
QuestInfo.list = {};

WayPoint = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + Math.floor(self.x / 64) * 64 + ":" + Math.floor(self.y / 64) * 64 + ":";
    self.info = param.info;
    self.width = param.width;
    self.height = param.height;
    self.toRemove = false;
    self.type = 'WayPoint';
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    WayPoint.list[self.id] = self;
    return self;
}
WayPoint.list = {};