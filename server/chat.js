const {Client,Intents} = require('discord.js');
const client = new Client({intents:[Intents.FLAGS.GUILDS]});

if(SERVER === 'localhost'){
    require('./CHAT_TOKEN');
}
else{
    chatToken = process.env.TOKEN;
}

client.login(chatToken);

addToChat = function(color,message){
    var d = new Date();
    var m = '' + d.getMinutes();
    var h = d.getHours() + 24;
    if(SERVER !== 'localhost'){
        h -= 5;
    }
    h = h % 24;
    h = '' + h;
    if(m.length === 1){
        m = '' + 0 + m;
    }
    if(m === '0'){
        m = '00';
    }
    console.error("[" + h + ":" + m + "] " + message);
    for(var i in Player.list){
        if(Player.list[i]){
            if(Player.list[i].loggedOn){
                if(SOCKET_LIST[i]){
                    SOCKET_LIST[i].emit('addToChat',{
                        color:color,
                        message:message,
                    });
                }
            }
        }
    }
    client.channels.fetch('923580123574329404').then(channel => channel.send("```[" + h + ":" + m + "] " + message.replace(/`/gi,'\'') + '```'));
}
sendClanMsg = function(color,message,clanName){
    var d = new Date();
    var m = '' + d.getMinutes();
    var h = d.getHours() + 24;
    if(SERVER !== 'localhost'){
        h -= 5;
    }
    h = h % 24;
    h = '' + h;
    if(m.length === 1){
        m = '' + 0 + m;
    }
    if(m === '0'){
        m = '00';
    }
    console.error("[" + h + ":" + m + "] " + message);
    for(var i in Player.list){
        if(Player.list[i]){
            if(Player.list[i].loggedOn){
                for(var j in Clan.list[clanName].members){
                    if(Player.list[i].name === j){
                        if(SOCKET_LIST[i]){
                            SOCKET_LIST[i].emit('addToChat',{
                                color:color,
                                message:clanName + " -> " + message,
                            });
                        }
                    }
                }
            }
        }
    }
    client.channels.fetch('927992766452072510').then(channel => channel.send("```[" + h + ":" + m + "] " + clanName + " -> " + message.replace(/`/gi,'\'') + '```'));
}

logError = function(err){
    client.channels.fetch('925382870208503828').then(channel => channel.send("```" + err + "```"));
}