var loadedMap = {};
var mapData = {};
var numLoaded = 0;
var totalMaps = 21;
var tileset = new Image();
tileset.src = '/client/maps/tileset.png';
var tilesetLoaded = false;
tileset.onload = function(){
    tilesetLoaded = true;
};
var renderWorld = function(json,name){
    var tile = json.tilesets[0];
    var size = json.tilewidth;
    for(var i in json.tilesets[0].tiles){
        for(var j in harvestableNpcData){
            if(json.tilesets[0].tiles[i].type === j){
                var imgX = (json.tilesets[0].tiles[i].id % ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                var imgY = ~~(json.tilesets[0].tiles[i].id / ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                harvestableNpcData[j].imgX = imgX + 8;
                harvestableNpcData[j].imgY = imgY + 8;
            }
        }
    }
    for(var i = 0;i < json.layers.length;i++){
        if(json.layers[i].type === "tilelayer" && json.layers[i].visible && json.layers[i].name !== "HarvestableNpc:"){
            for(var j = 0;j < json.layers[i].chunks.length;j++){
                if(loadedMap[name + ':' + json.layers[i].chunks[j].x + ':' + json.layers[i].chunks[j].y + ':']){
                    var tempLower = loadedMap[name + ':' + json.layers[i].chunks[j].x + ':' + json.layers[i].chunks[j].y + ':'].lower;
                    var tempUpper = loadedMap[name + ':' + json.layers[i].chunks[j].x + ':' + json.layers[i].chunks[j].y + ':'].upper;
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
                for(var k = 0;k < json.layers[i].chunks[j].data.length;k++){
                    tile_idx = json.layers[i].chunks[j].data[k];
                    if(tile_idx !== 0){
                        var imgX, imgY, s_x, s_y;
                        tile_idx -= 1;
                        imgX = (tile_idx % ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                        imgY = ~~(tile_idx / ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                        s_x = (k % 16) * size;
                        s_y = ~~(k / 16) * size;
                        if(json.layers[i].offsetx){
                            s_x += json.layers[i].offsetx;
                        }
                        if(json.layers[i].offsety){
                            s_y += json.layers[i].offsety;
                        }
                        // s_x += json.layers[i].chunks[j].x * 64;
                        // s_y += json.layers[i].chunks[j].y * 64;
                        if(json.layers[i].name.includes('Roof') || json.layers[i].name.includes('Top')){
                            glUpper.drawImage(tileset,Math.round(imgX),Math.round(imgY),size,size,Math.round(s_x * 4),Math.round(s_y * 4),64,64);
                        }
                        else{
                            glLower.drawImage(tileset,Math.round(imgX),Math.round(imgY),size,size,Math.round(s_x * 4),Math.round(s_y * 4),64,64);
                        }
                    }
                }
                loadedMap[name + ':' + json.layers[i].chunks[j].x + ':' + json.layers[i].chunks[j].y + ':'] = {
                    lower:tempLower,
                    upper:tempUpper,
                }
            }
        }
    }
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    for(var i in json.layers){
        if(json.layers[i].type === "tilelayer" && json.layers[i].visible && json.layers[i].name !== "HarvestableNpc:"){
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
    mapData[name] = {
        x1:x1,
        y1:y1,
        x2:x2,
        y2:y2,
        width:x2 - x1,
        height:y2 - y1,
    }
    numLoaded += 1;
    var mapLoading = document.getElementById('mapLoading');
    mapLoading.innerHTML = '<span style="color: #55ff55">Loading maps... (' + Math.round(numLoaded / totalMaps * 100) + '%)</span>';
    if(numLoaded === totalMaps){
        totalLoading -= 1;
        if(totalLoading === 0){
            loadingComplete = true;
        }
    }
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
    loadMap('Sleeping Boar Inn');
    loadMap('Altoris Forge');
    loadMap('Altoris Forge Basement');
    loadMap('Altoris General Store');
    loadMap('Altoris General Store Upstairs');
    loadMap('Altoris Mapmakers Lodge');
    loadMap('PVP Arena');
    loadMap('Lightning Whelk Inn');
    loadMap('Lightning Whelk Inn Upstairs');
    loadMap('Shark Eye Sunhouse');
    loadMap('Coquina General Store');
    loadMap('Coquina General Store Upstairs');
    loadMap('Tulip Forge');
    loadMap('Pear Whelk Art Center');
    loadMap('Moon Snail Shack');
    loadMap('Forest Fortress Inn');
    loadMap('Maple Cabin');
    loadMap('Lumberjack General Store');
    loadMap('Lumberjack General Store Upstairs');
    loadMap('Forest Fortress Mining Hut');
}