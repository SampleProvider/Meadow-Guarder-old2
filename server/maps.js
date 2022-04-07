var parseName = function(name){
    var array = [];
    var lastIndex = 0;
    for(var i = 0;i < name.length;i++){
        if(name[i] === ':'){
            array.push(name.substring(lastIndex,i));
            lastIndex = i + 1;
        }
    }
    return array;
}

var loadMap = function(name){
    var json = require('./../client/maps/' + name + '.json');
    for(var i = 0;i < json.layers.length;i++){
        if(json.layers[i].type === 'tilelayer'){
            for(var j = 0;j < json.layers[i].chunks.length;j++){
                for(var k = 0;k < json.layers[i].chunks[j].data.length;k++){
                    var tileId = json.layers[i].chunks[j].data[k];
                    if(tileId !== 0){
                        tileId -= 1;
                        var size = 64;
                        var s_x = (k % 16) * size;
                        var s_y = ~~(k / 16) * size;
                        s_x += json.layers[i].chunks[j].x * 64;
                        s_y += json.layers[i].chunks[j].y * 64;
                        if(json.layers[i].offsetx){
                            s_x += json.layers[i].offsetx * 4;
                        }
                        if(json.layers[i].offsety){
                            s_y += json.layers[i].offsety * 4;
                        }
                        for(var l in json.tilesets[0].tiles){
                            if(json.tilesets[0].tiles[l].id === tileId){
                                if(json.tilesets[0].tiles[l].objectgroup && json.layers[i].name.includes('NoCollisions') === false){
                                    for(var m in json.tilesets[0].tiles[l].objectgroup.objects){
                                        new Collision({
                                            x:s_x + json.tilesets[0].tiles[l].objectgroup.objects[m].x * 4 + json.tilesets[0].tiles[l].objectgroup.objects[m].width * 2,
                                            y:s_y + json.tilesets[0].tiles[l].objectgroup.objects[m].y * 4 + json.tilesets[0].tiles[l].objectgroup.objects[m].height * 2,
                                            z:0,
                                            width:json.tilesets[0].tiles[l].objectgroup.objects[m].width * 4,
                                            height:json.tilesets[0].tiles[l].objectgroup.objects[m].height * 4,
                                            map:name,
                                            info:json.tilesets[0].tiles[l].type,
                                        });
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
loadMap('test');