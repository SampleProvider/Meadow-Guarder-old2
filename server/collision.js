Collision = function(param){
    var self = {};
    self.map = param.map;
    self.x = param.x;
    self.y = param.y;
    self.width = param.width;
    self.height = param.height;
    self.info = param.info;
    for(var i = app.floor((self.x - self.width / 2) / 64);i <= app.floor((self.x + self.width / 2) / 64);i++){
        if(i * 64 === self.x + self.width / 2){
            break;
        }
        for(var j = app.floor((self.y - self.height / 2) / 64);j <= app.floor((self.y + self.height / 2) / 64);j++){
            if(j * 64 === (self.y + self.height / 2)){
                break;
            }
            if(Collision.list[self.map]){
                if(Collision.list[self.map][param.z]){
                    if(Collision.list[self.map][param.z][i]){
                        if(Collision.list[self.map][param.z][i][j]){
                            Collision.list[self.map][param.z][i][j][globalId] = self;
                        }
                        else{
                            Collision.list[self.map][param.z][i][j] = [];
                            Collision.list[self.map][param.z][i][j][globalId] = self;
                        }
                    }
                    else{
                        Collision.list[self.map][param.z][i] = [];
                        Collision.list[self.map][param.z][i][j] = [];
                        Collision.list[self.map][param.z][i][j][globalId] = self;
                    }
                }
                else{
                    Collision.list[self.map][param.z] = [];
                    Collision.list[self.map][param.z][i] = [];
                    Collision.list[self.map][param.z][i][j] = [];
                    Collision.list[self.map][param.z][i][j][globalId] = self;
                }
            }
            else{
                Collision.list[self.map] = [];
                Collision.list[self.map][param.z] = [];
                Collision.list[self.map][param.z][i] = [];
                Collision.list[self.map][param.z][i][j] = [];
                Collision.list[self.map][param.z][i][j][globalId] = self;
            }
        }
    }
    globalId += 1;
    return self;
}
Collision.add = function(collision,id){
    for(var i = app.floor((collision.x - collision.width / 2) / 64);i <= app.floor((collision.x + collision.width / 2) / 64);i++){
        if(i * 64 === collision.x + collision.width / 2){
            break;
        }
        for(var j = app.floor((collision.y - collision.height / 2) / 64);j <= app.floor((collision.y + collision.height / 2) / 64);j++){
            if(j * 64 === collision.y + collision.height / 2){
                break;
            }
            if(Collision.list[collision.map]){
                if(Collision.list[collision.map][collision.z]){
                    if(Collision.list[collision.map][collision.z][i]){
                        if(Collision.list[collision.map][collision.z][i][j]){
                            Collision.list[collision.map][collision.z][i][j][id] = collision;
                        }
                        else{
                            Collision.list[collision.map][collision.z][i][j] = [];
                            Collision.list[collision.map][collision.z][i][j][id] = collision;
                        }
                    }
                    else{
                        Collision.list[collision.map][collision.z][i] = [];
                        Collision.list[collision.map][collision.z][i][j] = [];
                        Collision.list[collision.map][collision.z][i][j][id] = collision;
                    }
                }
                else{
                    Collision.list[collision.map][collision.z] = [];
                    Collision.list[collision.map][collision.z][i] = [];
                    Collision.list[collision.map][collision.z][i][j] = [];
                    Collision.list[collision.map][collision.z][i][j][id] = collision;
                }
            }
            else{
                Collision.list[collision.map] = [];
                Collision.list[collision.map][collision.z] = [];
                Collision.list[collision.map][collision.z][i] = [];
                Collision.list[collision.map][collision.z][i][j] = [];
                Collision.list[collision.map][collision.z][i][j][id] = collision;
            }
        }
    }
}
Collision.remove = function(collision,id){
    for(var i = app.floor((collision.x - collision.width / 2) / 64);i <= app.floor((collision.x + collision.width / 2) / 64);i++){
        if(i * 64 === collision.x + collision.width / 2){
            break;
        }
        for(var j = app.floor((collision.y - collision.height / 2) / 64);j <= app.floor((collision.y + collision.height / 2) / 64);j++){
            if(j * 64 === collision.y + collision.height / 2){
                break;
            }
            if(Collision.list[collision.map]){
                if(Collision.list[collision.map][collision.z]){
                    if(Collision.list[collision.map][collision.z][i]){
                        if(Collision.list[collision.map][collision.z][i][j]){
                            if(Collision.list[collision.map][collision.z][i][j][id]){
                                delete Collision.list[collision.map][collision.z][i][j][id];
                                var collisionExists = false;
                                for(var k in Collision.list[collision.map][collision.z][i][j]){
                                    collisionExists = true;
                                    break;
                                }
                                if(!collisionExists){
                                    Collision.list[collision.map][collision.z][i][j] = undefined;
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