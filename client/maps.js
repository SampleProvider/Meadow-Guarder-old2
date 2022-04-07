
var maps = {
    tileset:new Image(),
    loadTileset:function(){
        maps.tileset.src = '/client/maps/tileset.png';
        maps.tileset.loaded = false;
        maps.tileset.onload = function(){
            maps.tileset.loaded = true;
        };
    },
    loadMap:function(mapName){
        var request = new XMLHttpRequest();
        request.open('GET','/client/maps/' + mapName + '.json',true);
        request.onload = function(){
            if(this.status >= 200 && this.status < 400){
                var json = JSON.parse(this.response);
                maps.loadWorld(json,mapName);
            }
            else{
    
            }
        };
        request.onerror = function(){
    
        };
        request.send();
    },
    loadWorld:function(json,mapName){
        var x1 = 0;
        var y1 = 0;
        var x2 = 0;
        var y2 = 0;
        for(var i in json.layers){
            if(json.layers[i].type === 'tilelayer' && json.layers[i].visible && json.layers[i].name !== 'HarvestableNpc:'){
                for(var j in json.layers[i].chunks){
                    if(json.layers[i].chunks[j].x * 64 < x1){
                        x1 = json.layers[i].chunks[j].x * 64;
                    }
                    if(json.layers[i].chunks[j].y * 64 < y1){
                        y1 = json.layers[i].chunks[j].y * 64;
                    }
                    if(json.layers[i].chunks[j].x * 64 + 16 * 64 > x2){
                        x2 = json.layers[i].chunks[j].x * 64 + 16 * 64;
                    }
                    if(json.layers[i].chunks[j].y * 64 + 16 * 64 > y2){
                        y2 = json.layers[i].chunks[j].y * 64 + 16 * 64;
                    }
                }
            }
        }
        maps.json[mapName] = {
            x1:x1,
            y1:y1,
            x2:x2,
            y2:y2,
            width:x2 - x1,
            height:y2 - y1,
            json:json,
        }
    },
    renderChunks:function(mapName){
        var json = maps.json[mapName].json;
        var tile = json.tilesets[0];
        var size = json.tilewidth;
        for(var i = 0;i < json.layers.length;i++){
            if(json.layers[i].type === 'tilelayer' && json.layers[i].visible && json.layers[i].name !== 'HarvestableNpc:'){
                for(var j = 0;j < json.layers[i].chunks.length;j++){
                    if(Math.abs(Math.floor(Player.list[app.player].x / 1024) * 16 - json.layers[i].chunks[j].x) < settings.renderDistance * 16 && Math.abs(Math.floor(Player.list[app.player].y / 1024) * 16 - json.layers[i].chunks[j].y) < settings.renderDistance * 16){
                        var loadedCanvas = false;
                        if(maps.data[mapName]){
                            if(maps.data[mapName][json.layers[i].chunks[j].x]){
                                if(maps.data[mapName][json.layers[i].chunks[j].x][json.layers[i].chunks[j].y]){
                                    if(maps.data[mapName][json.layers[i].chunks[j].x][json.layers[i].chunks[j].y].loaded){
                                        continue;
                                    }
                                    var tempLower = maps.data[mapName][json.layers[i].chunks[j].x][json.layers[i].chunks[j].y].lower;
                                    var tempUpper = maps.data[mapName][json.layers[i].chunks[j].x][json.layers[i].chunks[j].y].upper;
                                    var glLower = tempLower.getContext('2d');
                                    var glUpper = tempUpper.getContext('2d');
                                    loadedCanvas = true;
                                }
                                else{
                                    maps.data[mapName][json.layers[i].chunks[j].x][json.layers[i].chunks[j].y] = {};
                                }
                            }
                            else{
                                maps.data[mapName][json.layers[i].chunks[j].x] = {};
                                maps.data[mapName][json.layers[i].chunks[j].x][json.layers[i].chunks[j].y] = {};
                            }
                        }
                        else{
                            maps.data[mapName] = {};
                            maps.data[mapName][json.layers[i].chunks[j].x] = {};
                            maps.data[mapName][json.layers[i].chunks[j].x][json.layers[i].chunks[j].y] = {};
                        }
                        if(loadedCanvas === false){
                            try{
                                var tempLower = new OffscreenCanvas(16 * 64,16 * 64);
                                var tempUpper = new OffscreenCanvas(16 * 64,16 * 64);
                                var glLower = tempLower.getContext('2d');
                                var glUpper = tempUpper.getContext('2d');
                            }
                            catch(err){
                                var tempLower = document.createElement('canvas');
                                var tempUpper = document.createElement('canvas');
                                var glLower = tempLower.getContext('2d');
                                var glUpper = tempUpper.getContext('2d');
                                glLower.canvas.width = 16 * 64;
                                glLower.canvas.height = 16 * 64;
                                glUpper.canvas.width = 16 * 64;
                                glUpper.canvas.height = 16 * 64;
                            }
                        }
                        app.resetCanvas(glLower);
                        app.resetCanvas(glUpper);
                        for(var k = 0;k < json.layers[i].chunks[j].data.length;k++){
                            var tileId = json.layers[i].chunks[j].data[k];
                            if(tileId !== 0){
                                tileId -= 1;
                                var imgX = (tileId % ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                                var imgY = app.floor(tileId / ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                                var s_x = (k % 16) * size;
                                var s_y = app.floor(k / 16) * size;
                                if(json.layers[i].offsetx){
                                    s_x += json.layers[i].offsetx;
                                }
                                if(json.layers[i].offsety){
                                    s_y += json.layers[i].offsety;
                                }
                                if(json.layers[i].name.includes('Roof') || json.layers[i].name.includes('Top')){
                                    glUpper.drawImage(maps.tileset,Math.round(imgX),Math.round(imgY),size,size,Math.round(s_x * 4),Math.round(s_y * 4),64,64);
                                }
                                else{
                                    glLower.drawImage(maps.tileset,Math.round(imgX),Math.round(imgY),size,size,Math.round(s_x * 4),Math.round(s_y * 4),64,64);
                                }
                            }
                        }
                        maps.data[mapName][json.layers[i].chunks[j].x][json.layers[i].chunks[j].y] = {
                            lower:tempLower,
                            upper:tempUpper,
                            loaded:false,
                        }
                    }
                }
            }
        }
        for(var i in maps.data[mapName]){
            for(var j in maps.data[mapName][i]){
                maps.data[mapName][i][j].loaded = true;
            }
        }
    },
    json:{},
    data:{},
};
maps.loadTileset();

maps.loadMap('test')