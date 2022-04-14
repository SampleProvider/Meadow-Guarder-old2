Collision = function(param){
    var self = {};
    self.map = param.map;
    self.x = param.x;
    self.y = param.y;
    self.width = param.width;
    self.height = param.height;
    self.info = param.info;
    for(var i = Math.floor(Math.round(self.x - self.width / 2) / 64);i <= Math.floor(Math.round(self.x + self.width / 2) / 64);i++){
        if(i * 64 === Math.round(self.x + self.width / 2)){
            break;
        }
        for(var j = Math.floor(Math.round(self.y - self.height / 2) / 64);j <= Math.floor(Math.round(self.y + self.height / 2) / 64);j++){
            if(j * 64 === Math.round(self.y + self.height / 2)){
                break;
            }
            if(Collision.list[self.map]){
                if(Collision.list[self.map][param.zindex]){
                    if(Collision.list[self.map][param.zindex][i]){
                        if(Collision.list[self.map][param.zindex][i][j]){
                            Collision.list[self.map][param.zindex][i][j][Math.random()] = self;
                        }
                        else{
                            Collision.list[self.map][param.zindex][i][j] = [];
                            Collision.list[self.map][param.zindex][i][j][Math.random()] = self;
                        }
                    }
                    else{
                        Collision.list[self.map][param.zindex][i] = [];
                        Collision.list[self.map][param.zindex][i][j] = [];
                        Collision.list[self.map][param.zindex][i][j][Math.random()] = self;
                    }
                }
                else{
                    Collision.list[self.map][param.zindex] = [];
                    Collision.list[self.map][param.zindex][i] = [];
                    Collision.list[self.map][param.zindex][i][j] = [];
                    Collision.list[self.map][param.zindex][i][j][Math.random()] = self;
                }
            }
            else{
                Collision.list[self.map] = [];
                Collision.list[self.map][param.zindex] = [];
                Collision.list[self.map][param.zindex][i] = [];
                Collision.list[self.map][param.zindex][i][j] = [];
                Collision.list[self.map][param.zindex][i][j][Math.random()] = self;
            }
        }
    }
    return self;
}
Collision.add = function(collision,id,deathMessage){
    for(var i = Math.floor(Math.round(collision.x - collision.width / 2) / 64);i <= Math.floor(Math.round(collision.x + collision.width / 2) / 64);i++){
        if(i * 64 === Math.round(collision.x + collision.width / 2)){
            break;
        }
        for(var j = Math.floor(Math.round(collision.y - collision.height / 2) / 64);j <= Math.floor(Math.round(collision.y + collision.height / 2) / 64);j++){
            if(j * 64 === Math.round(collision.y + collision.height / 2)){
                break;
            }
            if(Collision.list[collision.map]){
                if(Collision.list[collision.map][collision.zindex]){
                    if(Collision.list[collision.map][collision.zindex][i]){
                        if(Collision.list[collision.map][collision.zindex][i][j]){
                            Collision.list[collision.map][collision.zindex][i][j][id] = collision;
                        }
                        else{
                            Collision.list[collision.map][collision.zindex][i][j] = [];
                            Collision.list[collision.map][collision.zindex][i][j][id] = collision;
                        }
                    }
                    else{
                        Collision.list[collision.map][collision.zindex][i] = [];
                        Collision.list[collision.map][collision.zindex][i][j] = [];
                        Collision.list[collision.map][collision.zindex][i][j][id] = collision;
                    }
                }
                else{
                    Collision.list[collision.map][collision.zindex] = [];
                    Collision.list[collision.map][collision.zindex][i] = [];
                    Collision.list[collision.map][collision.zindex][i][j] = [];
                    Collision.list[collision.map][collision.zindex][i][j][id] = collision;
                }
            }
            else{
                Collision.list[collision.map] = [];
                Collision.list[collision.map][collision.zindex] = [];
                Collision.list[collision.map][collision.zindex][i] = [];
                Collision.list[collision.map][collision.zindex][i][j] = [];
                Collision.list[collision.map][collision.zindex][i][j][id] = collision;
            }
        }
    }
    for(var i in Player.list){
        if(Player.list[i].isColliding(collision)){
            Player.list[i].onDeath(Player.list[i],deathMessage);
        }
    }
    for(var i in Monster.list){
        if(Monster.list[i].isColliding(collision)){
            Monster.list[i].toRemove = true;
        }
    }
}
Collision.remove = function(collision,id){
    for(var i = Math.floor(Math.round(collision.x - collision.width / 2) / 64);i <= Math.floor(Math.round(collision.x + collision.width / 2) / 64);i++){
        if(i * 64 === Math.round(collision.x + collision.width / 2)){
            break;
        }
        for(var j = Math.floor(Math.round(collision.y - collision.height / 2) / 64);j <= Math.floor(Math.round(collision.y + collision.height / 2) / 64);j++){
            if(j * 64 === Math.round(collision.y + collision.height / 2)){
                break;
            }
            if(Collision.list[collision.map]){
                if(Collision.list[collision.map][collision.zindex]){
                    if(Collision.list[collision.map][collision.zindex][i]){
                        if(Collision.list[collision.map][collision.zindex][i][j]){
                            if(Collision.list[collision.map][collision.zindex][i][j][id]){
                                delete Collision.list[collision.map][collision.zindex][i][j][id];
                                var collisionExists = false;
                                for(var k in Collision.list[collision.map][collision.zindex][i][j]){
                                    collisionExists = true;
                                    break;
                                }
                                if(!collisionExists){
                                    Collision.list[collision.map][collision.zindex][i][j] = undefined;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
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
    self.width = 64;
    self.height = 48;
    self.y -= 8;
    self.map = param.map;
    self.teleport = param.teleport;
    self.teleportx = parseFloat(param.teleportx,10) * 64 + 32;
    self.teleporty = parseFloat(param.teleporty,10) * 64 + 32;
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
    self.region = param.region;
    if(param.canAttack === 'true'){
        self.canAttack = true;
    }
    else{
        self.canAttack = false;
    }
    if(param.noMonster === 'true'){
        self.noMonster = true;
    }
    else{
        self.noMonster = false;
    }
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