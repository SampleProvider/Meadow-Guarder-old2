clanData = require('./../client/data/clan.json').clans;

Clan = function(name,param){
    var self = {};
    self.name = name;
    self.members = param.members === undefined ? [] : param.members;
    self.level = param.level === undefined ? 0 : param.level;
    self.xp = param.xp === undefined ? 0 : param.xp;
    self.xpMax = clanData[self.level].xp;
    self.maxMembers = param.maxMembers === undefined ? 5 : param.maxMembers;
    self.boosts = param.boosts === undefined ? {} : param.boosts;
    self.claimBoost = param.claimBoost === undefined ? false : param.claimBoost;
    self.addXp = function(xp){
        self.xp += xp;
        if(!clanData[self.level]){
            for(var i in Player.list){
                for(var j in self.members){
                    if(Player.list[i].name === j){
                        if(SOCKET_LIST[i]){
                            SOCKET_LIST[i].emit('updateClan',self);
                        }
                    }
                }
            }
            return;
        }
        if(self.xp >= self.xpMax){
            if(self.claimBoost){
                self.xp = self.xpMax;
                return;
            }
            if(!clanData[self.level + 1]){
                self.xp = self.xpMax;
                return;
            }
            self.xp = Math.min(self.xp - self.xpMax,clanData[self.level + 1].xp);
            self.level += 1;
            self.maxMembers += 1;
            self.xpMax = clanData[self.level].xp;
            addToChat('#00ff00','Clan ' + self.name + ' is now level ' + self.level + '.');
            self.claimBoost = true;
            if(clanData[self.level]){
                for(var i in Player.list){
                    for(var j in self.members){
                        if(Player.list[i].name === j){
                            if(SOCKET_LIST[i]){
                                SOCKET_LIST[i].emit('updateClan',self);
                                if(self.members[j] === 'leader'){
                                    Player.list[i].sendMessage('[!] Your clan can now hold 1 more member!');
                                    SOCKET_LIST[i].emit('upgradeClan',clanData[self.level].boosts);
                                }
                            }
                        }
                    }
                }
            }
        }
        else{
            for(var i in Player.list){
                for(var j in self.members){
                    if(Player.list[i].name === j){
                        if(SOCKET_LIST[i]){
                            SOCKET_LIST[i].emit('updateClan',self);
                        }
                    }
                }
            }
        }
    }
    Clan.list[self.name] = self;
    return self;
}
Clan.list = {};

getClans(function(data){
    for(var i in data){
        new Clan(i,data[i]);
    }
});