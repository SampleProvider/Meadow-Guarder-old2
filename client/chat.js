
var chatText = document.getElementById('chatText');
var chatInput = document.getElementById('chatInput');
var chatForm = document.getElementById('chatForm');
chatText.innerHTML = '<div>Welcome to Meadow Guarder ' + VERSION + '!</div>';
var chatPress = false;
var inChat = false;

var commandList = [];
var commandIndex = 0;

socket.on('addToChat',function(data){
    var scroll = false;
    if(chatText.scrollTop + chatText.clientHeight >= chatText.scrollHeight - 5){
        scroll = true;
    }
    var d = new Date();
    var m = '' + d.getMinutes();
    if(m.length === 1){
        m = '' + 0 + m;
    }
    if(m === '0'){
        m = '00';
    }
    var message = data.message;
    if(message.replace){
        message = message.replace(/</gi,'&lt;');
        message = message.replace(/>/gi,'&gt;');
        message = message.replace(/\n/gi,'<br>');
        message = message.replaceAll('|n','\n');
    }
    if(data.debug){
        message = '<div class="text command">[' + d.getHours() + ':' + m + '] ' + message + '</div>';
    }
    else{
        message = '<div class="text" style="color:' + data.color + '";>[' + d.getHours() + ':' + m + '] ' + message + '</div>';
    }
    message = message.replace(/  /gi,'&nbsp;&nbsp;');
    chatText.innerHTML += message;
    if(scroll){
        if(chatText.scrollHeight > 2000){
            var chat = chatText.innerHTML;
            var newLines = 0;
            for(var i = 0;i < chat.length;i++){
                if(chat[i] + chat[i + 1] + chat[i + 2] + chat[i + 3] + chat[i + 4] + chat[i + 5] === '</div>'){
                    newLines += 1;
                    if(newLines === 5){
                        chatText.innerHTML = chat.slice(i + 6);
                        break;
                    }
                }
            }
        }
        chatText.scrollTop = chatText.scrollHeight;
    }
});
chatForm.onsubmit = function(e){
    e.preventDefault();
    if(chatInput.value === ''){
        return;
    }
    socket.emit('chatMessage',chatInput.value);
    if(commandList[commandList.length - 1] !== chatInput.value){
        commandList.push(chatInput.value);
    }
    commandIndex = commandList.length;
    chatInput.value = '';
}
chatInput.onkeydown = function(e){
    chatPress = true;
}
chatInput.onmousedown = function(e){
    inChat = true;
    socket.emit('keyPress',{inputId:'releaseAll'});
}

craftInput.onkeydown = function(e){
    chatPress = true;
}
craftInput.onmousedown = function(e){
    inChat = true;
    socket.emit('keyPress',{inputId:'releaseAll'});
}

createClanInput.onkeydown = function(e){
    chatPress = true;
}
createClanInput.onmousedown = function(e){
    inChat = true;
    socket.emit('keyPress',{inputId:'releaseAll'});
}
createClanForm.onsubmit = function(e){
    e.preventDefault();
}