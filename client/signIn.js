
var loadJSON = function(json,cb){
    var request = new XMLHttpRequest();
    request.open('GET',"/client/data/" + json + ".json",true);
    request.onload = function(){
        if(this.status >= 200 && this.status < 400){
            var json = JSON.parse(this.response);
            cb(json);
        }
        else{
    
        }
    };
    request.onerror = function(){
        
    };
    request.send();
}

window.onload = function(){
    app.images['Human'] = new Image();
    app.images['Human'].src = '/client/images/player/bodies/Human.png';
    loadJSON('playerImages',function(json){
        for(var i in json){
            var type = '';
            for(var j = 0;j < i.length;j++){
                if(i[j] === '/'){
                    type = i.substring(j + 1);
                }
            }
            for(var j in json[i].types){
                for(var k in json[i].colors){
                    app.images[type + json[i].types[j] + ' ' + json[i].colors[k]] = new Image();
                    app.images[type + json[i].types[j] + ' ' + json[i].colors[k]].src = '/client/images/player/' + i + json[i].types[j] + ' ' + json[i].colors[k] + '.png';
                }
            }
        }
    });
}

signInButton.onclick = function(){
    app.socket.emit('signIn',{
        username:'asdf',
        password:'asdf',
    });
}

app.socket.on('signInResponse',function(data){
    if(data.response === 'success'){
        menuScreen.style.display = 'none';
        gameScreen.style.display = 'inline-block';
        app.player = data.player;
        window.requestAnimationFrame(app.tick);
    }
});