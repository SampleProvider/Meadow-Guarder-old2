var loadedMap = {};
var mapData = {};
var numLoaded = 0;
var totalMaps = 1;
var tileset = new Image();
tileset.src = '/client/maps/tileset.png';
var tilesetLoaded = false;
tileset.onload = function(){
    tilesetLoaded = true;
};
var tileAnimation = 0;
var renderWorld = function(json,name){
    var tile = json.tilesets[0];
    for(var i = 0;i < 8;i++){
        for(var j = 0;j < json.layers.length;j++){
            if(json.layers[j].type === "tilelayer" && json.layers[j].visible){
                var size = json.tilewidth;
                for(var k = 0;k < json.layers[j].chunks.length;k++){
                    if(loadedMap[name + ':' + json.layers[j].chunks[k].x + ':' + json.layers[j].chunks[k].y + ':' + i + ':']){
                        var tempLower = loadedMap[name + ':' + json.layers[j].chunks[k].x + ':' + json.layers[j].chunks[k].y + ':' + i + ':'].lower;
                        var tempUpper = loadedMap[name + ':' + json.layers[j].chunks[k].x + ':' + json.layers[j].chunks[k].y + ':' + i + ':'].upper;
                    }
                    else{
                        if(isFirefox){
                            var tempLower = document.createElement('canvas');
                            var tempUpper = document.createElement('canvas');
                            tempLower.canvas.width = 16 * 64;
                            tempLower.canvas.height = 16 * 64;
                            tempUpper.canvas.width = 16 * 64;
                            tempUpper.canvas.height = 16 * 64;
                        }
                        else{
                            var tempLower = new OffscreenCanvas(16 * 64,16 * 64);
                            var tempUpper = new OffscreenCanvas(16 * 64,16 * 64);
                        }
                    }
                    var glLower = tempLower.getContext('2d');
                    var glUpper = tempUpper.getContext('2d');
                    resetCanvas(glLower);
                    resetCanvas(glUpper);
                    for(var l = 0;l < json.layers[j].chunks[k].data.length;l++){
                        tile_idx = json.layers[j].chunks[k].data[l];
                        if(tile_idx !== 0){
                            var img_x, img_y, s_x, s_y;
                            for(var m in tile.tiles){
                                if(tile.tiles[m].id === tile_idx - 1){
                                    if(tile.tiles[m].animation){
                                        tile_idx = tile.tiles[m].animation[i].tileid + 1;
                                    }
                                }
                            }
                            tile_idx -= 1;
                            img_x = (tile_idx % ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                            img_y = ~~(tile_idx / ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                            s_x = (l % 16) * size;
                            s_y = ~~(l / 16) * size;
                            if(json.layers[j].offsetx){
                                s_x += json.layers[j].offsetx;
                            }
                            if(json.layers[j].offsety){
                                s_y += json.layers[j].offsety;
                            }
                            // s_x += json.layers[j].chunks[k].x * 64;
                            // s_y += json.layers[j].chunks[k].y * 64;
                            if(json.layers[j].name.includes('Roof') || json.layers[j].name.includes('Top')){
                                glUpper.drawImage(tileset,Math.round(img_x),Math.round(img_y),size,size,Math.round(s_x * 4),Math.round(s_y * 4),64,64);
                            }
                            else{
                                glLower.drawImage(tileset,Math.round(img_x),Math.round(img_y),size,size,Math.round(s_x * 4),Math.round(s_y * 4),64,64);
                            }
                        }
                    }
                    loadedMap[name + ':' + json.layers[j].chunks[k].x + ':' + json.layers[j].chunks[k].y + ':' + i + ':'] = {
                        lower:tempLower,
                        upper:tempUpper,
                    }
                }
            }
        }
    }
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    for(var i in json.layers){
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
    mapData[name] = {
        x1:x1,
        y1:y1,
        x2:x2,
        y2:y2,
        width:json.layers[0].width * 64,
        height:json.layers[0].height * 64,
    }
    numLoaded += 1;
    var mapLoading = document.getElementById('mapLoading');
    mapLoading.innerHTML = '<span style="color: #55ff55">Loading maps... (' + Math.round(numLoaded / totalMaps * 100) + '%)</span>';
}
var loadTileset = function(json,name){
    if(tilesetLoaded){
        renderWorld(json,name);
    }
    else{
        setTimeout(function(){
            loadTileset(json,name);
        },10);
    }
}
var loadMap = function(name){
    var request = new XMLHttpRequest();
    request.open('GET',"/client/maps/" + name + ".json",true);
    request.onload = function(){
        if(this.status >= 200 && this.status < 400){
            var json = JSON.parse(this.response);
            loadTileset(json,name);
        }
        else{

        }
    };
    request.onerror = function(){

    };
    request.send();
}
var loadAllMaps = function(){
    numLoaded = 0;
    signError.innerHTML = '<div id="mapLoading"></div>' + signError.innerHTML;
    var mapLoading = document.getElementById('mapLoading');
    mapLoading.innerHTML = '<span style="color: #55ff55">Loading maps... (0%)</span>';
    loadMap('World');
    loadingComplete = true;
}