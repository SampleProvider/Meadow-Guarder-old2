Collision = function(param){
    var self = {};
    self.map = param.map;
    self.x = param.x;
    self.y = param.y;
    self.width = param.width;
    self.height = param.height;
    self.info = param.info;
    if(Collision.list[self.map]){
        if(Collision.list[self.map][param.zindex]){
            if(Collision.list[self.map][param.zindex][Math.floor(self.x / 64)]){
                if(Collision.list[self.map][param.zindex][Math.floor(self.x / 64)][Math.floor(self.y / 64)]){
                    Collision.list[self.map][param.zindex][Math.floor(self.x / 64)][Math.floor(self.y / 64)].push(self);
                }
                else{
                    Collision.list[self.map][param.zindex][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = [self];
                }
            }
            else{
                Collision.list[self.map][param.zindex][Math.floor(self.x / 64)] = [];
                Collision.list[self.map][param.zindex][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = [self];
            }
        }
        else{
            Collision.list[self.map][param.zindex] = [];
            Collision.list[self.map][param.zindex][Math.floor(self.x / 64)] = [];
            Collision.list[self.map][param.zindex][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = [self];
        }
    }
    else{
        Collision.list[self.map] = [];
        Collision.list[self.map][param.zindex] = [];
        Collision.list[self.map][param.zindex][Math.floor(self.x / 64)] = [];
        Collision.list[self.map][param.zindex][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = [self];
    }
    return self;
}
Collision.list = {};

Slope = function(param){
    var self = {};
    self.map = param.map;
    self.x = param.x;
    self.y = param.y;
    self.slopeIncrease = param.slopeIncrease;
    if(Slope.list[self.map]){
        if(Slope.list[self.map][param.zindex]){
            if(Slope.list[self.map][param.zindex][Math.floor(self.x / 64)]){
                Slope.list[self.map][param.zindex][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
            }
            else{
                Slope.list[self.map][param.zindex][Math.floor(self.x / 64)] = [];
                Slope.list[self.map][param.zindex][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
            }
        }
        else{
            Slope.list[self.map][param.zindex] = [];
            Slope.list[self.map][param.zindex][Math.floor(self.x / 64)] = [];
            Slope.list[self.map][param.zindex][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
        }
    }
    else{
        Slope.list[self.map] = [];
        Slope.list[self.map][param.zindex] = [];
        Slope.list[self.map][param.zindex][Math.floor(self.x / 64)] = [];
        Slope.list[self.map][param.zindex][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
    }
    return self;
}
Slope.list = {};

Spawner = function(param){
    var self = {};
    self.x = param.x;
    self.y = param.y;
    self.map = param.map;
    self.spawned = false;
    self.spawnId = param.spawnId;
    Spawner.list.push(self);
    return self;
}
Spawner.list = [];

Transporter = function(param){
    var self = {};
    self.x = param.x;
    self.y = param.y;
    self.map = param.map;
    self.teleport = param.teleport;
    self.teleportx = parseInt(param.teleportx,10) * 64 + 32;
    self.teleporty = parseInt(param.teleporty,10) * 64 + 32;
    self.teleportdirection = param.teleportdirection;
    if(Transporter.list[self.map]){
        if(Transporter.list[self.map][Math.floor(self.x / 64)]){
            Transporter.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
        }
        else{
            Transporter.list[self.map][Math.floor(self.x / 64)] = [];
            Transporter.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
        }
    }
    else{
        Transporter.list[self.map] = [];
        Transporter.list[self.map][Math.floor(self.x / 64)] = [];
        Transporter.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
    }
    return self;
}
Transporter.list = {};

RegionChanger = function(param){
    var self = {}
    self.x = param.x;
    self.y = param.y;
    self.map = param.map;
    self.region = {
        region:param.region,
        noAttack:param.noAttack,
        noMonster:param.noMonster,
    };
    self.mapName = param.mapName;
    if(RegionChanger.list[self.map]){
        if(RegionChanger.list[self.map][Math.floor(self.x / 64)]){
            RegionChanger.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
        }
        else{
            RegionChanger.list[self.map][Math.floor(self.x / 64)] = [];
            RegionChanger.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
        }
    }
    else{
        RegionChanger.list[self.map] = [];
        RegionChanger.list[self.map][Math.floor(self.x / 64)] = [];
        RegionChanger.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
    }
    return self;
}
RegionChanger.list = {};

QuestInfo = function(param){
    var self = {};
    self.x = param.x;
    self.y = param.y;
    self.map = param.map;
    self.info = param.info;
    self.quest = param.quest;
    if(QuestInfo.list[self.map]){
        if(QuestInfo.list[self.map][Math.floor(self.x / 64)]){
            QuestInfo.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
        }
        else{
            QuestInfo.list[self.map][Math.floor(self.x / 64)] = [];
            QuestInfo.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
        }
    }
    else{
        QuestInfo.list[self.map] = [];
        QuestInfo.list[self.map][Math.floor(self.x / 64)] = [];
        QuestInfo.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
    }
    return self;
}
QuestInfo.list = {};

WayPoint = function(param){
    var self = {};
    self.x = param.x;
    self.y = param.y;
    self.map = param.map;
    self.info = param.info;
    if(WayPoint.list[self.map]){
        if(WayPoint.list[self.map][Math.floor(self.x / 64)]){
            WayPoint.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
        }
        else{
            WayPoint.list[self.map][Math.floor(self.x / 64)] = [];
            WayPoint.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
        }
    }
    else{
        WayPoint.list[self.map] = [];
        WayPoint.list[self.map][Math.floor(self.x / 64)] = [];
        WayPoint.list[self.map][Math.floor(self.x / 64)][Math.floor(self.y / 64)] = self;
    }
    return self;
}
WayPoint.list = {};