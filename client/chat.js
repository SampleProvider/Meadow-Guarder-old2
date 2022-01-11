
var chatText = document.getElementById('chatText');
var chatInput = document.getElementById('chatInput');
var chatForm = document.getElementById('chatForm');
var chat = '<div>Welcome to Meadow Guarder ' + VERSION + '!</div>';
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
    if(data.debug){
        message = '<div class="text command">[' + d.getHours() + ':' + m + '] ' + message + '</div>';
    }
    else{
        if(message.replace){
            message = message.replace(/</gi,'&lt;');
            message = message.replace(/>/gi,'&gt;');
            message = message.replace(/\n/gi,'<br>');
        }
        message = '<div class="text" style="color:' + data.color + '";>[' + d.getHours() + ':' + m + '] ' + message + '</div>';
    }
    message = message.replace(/  /gi,'&nbsp;&nbsp;');
    chat += message;
    chatText.innerHTML = chat;
    if(scroll){
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