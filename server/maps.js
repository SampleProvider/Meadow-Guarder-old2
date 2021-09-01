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
                        for(var l in json.tilesets[0].tiles){
                            if(json.tilesets[0].tiles[l].id === tile_idx){
                                if(json.tilesets[0].tiles[l].objectgroup && json.layers[i].name !== 'NoCollisions'){
                                    for(var m in json.tilesets[0].tiles[l].objectgroup.objects){
                                        new Collision({
                                            x:s_x + json.tilesets[0].tiles[l].objectgroup.objects[m].x * 4 + json.tilesets[0].tiles[l].objectgroup.objects[m].width * 2,
                                            y:s_y + json.tilesets[0].tiles[l].objectgroup.objects[m].y * 4 + json.tilesets[0].tiles[l].objectgroup.objects[m].height * 2,
                                            width:json.tilesets[0].tiles[l].objectgroup.objects[m].width * 4,
                                            height:json.tilesets[0].tiles[l].objectgroup.objects[m].height * 4,
                                            map:name,
                                            info:json.tilesets[0].tiles[l].type,
                                        });
                                    }
                                }
                                else if(harvestableNpcData[json.tilesets[0].tiles[l].type]){
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
                            spawnId = json.layers[i].name.substr(8,json.layers[i].name.length - 9);
                            var spawner = new Spawner({
                                x:s_x + 32,
                                y:s_y + 32,
                                width:64,
                                height:64,
                                spawnId:spawnId,
                                map:name,
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 1){
                            var teleport = "";
                            var teleportj = 0;
                            var teleportx = "";
                            var teleportxj = 0;
                            var teleporty = "";
                            var teleportyj = 0;
                            var teleportdirection = "";
                            for(var l = 0;l < json.layers[i].name.length;l++){
                                if(json.layers[i].name[l] === ':'){
                                    if(teleport === ""){
                                        teleport = json.layers[i].name.substr(0,l);
                                        teleportj = l;
                                    }
                                    else if(teleportx === ""){
                                        teleportx = json.layers[i].name.substr(teleportj + 1,l - teleportj - 1);
                                        teleportxj = l;
                                    }
                                    else if(teleporty === ""){
                                        teleporty = json.layers[i].name.substr(teleportxj + 1,l - teleportxj - 1);
                                        teleportyj = l;
                                    }
                                    else if(teleportdirection === ""){
                                        teleportdirection = json.layers[i].name.substr(teleportyj + 1,l - teleportyj - 1);
                                    }
                                }
                            }
                            var transporter = new Transporter({
                                x:s_x + 32,
                                y:s_y + 32,
                                width:64,
                                height:64,
                                teleport:teleport,
                                teleportx:teleportx,
                                teleporty:teleporty,
                                teleportdirection:teleportdirection,
                                map:name,
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 2){
                            npcName = json.layers[i].name.substr(4,json.layers[i].name.length - 5);
                            var npc = new Npc({
                                x:s_x + 32,
                                y:s_y + 32,
                                map:name,
                                name:npcName,
                            });
                        }
                        else if(tile_idx + 1 === json.tilesets[1].firstgid + 3){
                            var regionChanger = new RegionChanger({
                                x:s_x + 32,
                                y:s_y + 32,
                                map:name,
                                region:json.layers[i].name,
                            });
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
loadMap('Cave of Light Floor 0');
loadMap('Cave of Light Floor 1');