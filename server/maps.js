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


var renderWorld = function(json,name){
    playerMap[name] = 0;
    for(var i = 0;i < json.layers.length;i++){
        if(json.layers[i].type === "tilelayer"){
            for(var j = 0;j < json.layers[i].chunks.length;j++){
                for(var k = 0;k < json.layers[i].chunks[j].data.length;k++){
                    tile_idx = json.layers[i].chunks[j].data[k];
                    if(tile_idx !== 0){
                        var s_x, s_y;
                        tile_idx -= 1;
                        var size = 64;
                        s_x = (k % 16) * size;
                        s_y = ~~(k / 16) * size;
                        s_x += json.layers[i].chunks[j].x * 64;
                        s_y += json.layers[i].chunks[j].y * 64;
                        if(json.layers[i].offsetx){
                            s_x += json.layers[i].offsetx * 4;
                        }
                        if(json.layers[i].offsety){
                            s_y += json.layers[i].offsety * 4;
                        }
                        for(var l in json.tilesets[0].tiles){
                            if(json.tilesets[0].tiles[l].id === tile_idx){
                                if(json.tilesets[0].tiles[l].objectgroup && json.layers[i].name.includes('NoCollisions') === false){
                                    for(var m in json.tilesets[0].tiles[l].objectgroup.objects){
                                        new Collision({
                                            x:s_x + json.tilesets[0].tiles[l].objectgroup.objects[m].x * 4 + json.tilesets[0].tiles[l].objectgroup.objects[m].width * 2,
                                            y:s_y + json.tilesets[0].tiles[l].objectgroup.objects[m].y * 4 + json.tilesets[0].tiles[l].objectgroup.objects[m].height * 2,
                                            width:json.tilesets[0].tiles[l].objectgroup.objects[m].width * 4,
                                            height:json.tilesets[0].tiles[l].objectgroup.objects[m].height * 4,
                                            map:name,
                                            info:json.tilesets[0].tiles[l].type,
                                            zindex:0,
                                        });
                                    }
                                }
                                if(harvestableNpcData[json.tilesets[0].tiles[l].type]){
                                    new HarvestableNpc({
                                        x:s_x + 32,
                                        y:s_y + 32,
                                        width:64,
                                        height:64,
                                        map:name,
                                        img:json.tilesets[0].tiles[l].type,
                                    });
                                }
                            }
                        }
                        if(tile_idx + 1 === json.tilesets[1].firstgid){
                            var array = parseName(json.layers[i].name);
                            var collision = new Collision({
                                x:s_x + 32,
                                y:s_y + 32,
                                width:64,
                                height:64,
                                map:name,
                                zindex:array[1],
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 1){
                            var array = parseName(json.layers[i].name);
                            var collision = new Collision({
                                x:s_x + 40,
                                y:s_y + 32,
                                width:48,
                                height:64,
                                map:name,
                                zindex:array[1],
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 2){
                            var array = parseName(json.layers[i].name);
                            var collision = new Collision({
                                x:s_x + 24,
                                y:s_y + 32,
                                width:48,
                                height:64,
                                map:name,
                                zindex:array[1],
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 3){
                            var array = parseName(json.layers[i].name);
                            var collision = new Collision({
                                x:s_x + 44,
                                y:s_y + 32,
                                width:40,
                                height:64,
                                map:name,
                                zindex:array[1],
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 4){
                            var array = parseName(json.layers[i].name);
                            var collision = new Collision({
                                x:s_x + 20,
                                y:s_y + 32,
                                width:40,
                                height:64,
                                map:name,
                                zindex:array[1],
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 5){
                            var array = parseName(json.layers[i].name);
                            var spawner = new Spawner({
                                x:s_x + 32,
                                y:s_y + 32,
                                width:64,
                                height:64,
                                spawnId:array[1],
                                map:name,
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 6){
                            var array = parseName(json.layers[i].name);
                            var transporter = new Transporter({
                                x:s_x + 32,
                                y:s_y + 32,
                                width:64,
                                height:64,
                                teleport:array[0],
                                teleportx:array[1],
                                teleporty:array[2],
                                teleportdirection:array[3],
                                map:name,
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 7){
                            npcName = json.layers[i].name.substr(4,json.layers[i].name.length - 5);
                            var npc = new Npc({
                                x:s_x + 32,
                                y:s_y + 32,
                                map:name,
                                name:npcName,
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 8){
                            var array = parseName(json.layers[i].name);
                            var regionChanger = new RegionChanger({
                                x:s_x + 32,
                                y:s_y + 32,
                                map:name,
                                region:array[0],
                                mapName:array[1],
                                noAttack:array[2],
                                noMonster:array[3],
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 9){
                            ENV.spawnpoint.x = s_x + 32;
                            ENV.spawnpoint.y = s_y + 32;
                            ENV.spawnpoint.map = name;
                        }
                    }
                }
            }
        }
    }
}
var loadMap = function(name){
    renderWorld(require('./../client/maps/' + name + '.json'),name);
}
loadMap('World');
loadMap('Sleeping Boar Inn');
loadMap('Altoris Forge');
loadMap('Altoris General Store');