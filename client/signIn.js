var signError = document.getElementById('signError');
var signErrorText = '';

var deletePasswordState = 0;
var changePasswordState = 0;
var canSignIn = true;

var loadJSON = function(json,cb){
    var request = new XMLHttpRequest();
    request.open('GET',"/client/data/" + json + ".json",true);
    request.onload = function(){
        if(this.status >= 200 && this.status < 400){
            var json = JSON.parse(this.response);
            signErrorText = signError.innerHTML;
            cb(json);
        }
        else{
    
        }
    };
    request.onerror = function(){
        
    };
    request.send();
}

document.getElementById('signIn').onclick = function(){
    if(canSignIn === false){
        return;
    }
    if(document.getElementById('username').value === ''){
        return;
    }
    canSignIn = false;
    setTimeout(function(){
        canSignIn = true;
    },3000);
    signError.innerHTML = '<span style="color: #55ff55">Sent packet to server.</span><br>';
    setTimeout(function(){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #55ff55">Waiting for server response...</span><br>' + signErrorText;
        socket.emit('signIn',{username:document.getElementById('username').value,password:document.getElementById('password').value});
    },100)
    loadJSON('projectiles',function(json){
        var amount = 0;
        for(var i in json){
            amount += 1;
        }
        var currentAmount = 0;
        for(var i in json){
            Img[i] = new Image();
            Img[i].src = '/client/img/projectiles/' + i + '.png';
            currentAmount += 1;
            signError.innerHTML = '<span style="color: #55ff55">Loading projectiles... (' + currentAmount / amount * 100 + '%)</span><br>' + signErrorText;
        }
    });
    loadJSON('monsters',function(json){
        var amount = 0;
        for(var i in json){
            amount += 1;
        }
        var currentAmount = 0;
        for(var i in json){
            Img[i] = new Image();
            Img[i].src = '/client/img/monsters/' + i + '.png';
            currentAmount += 1;
            signError.innerHTML = '<span style="color: #55ff55">Loading monsters... (' + currentAmount / amount * 100 + '%)</span><br>' + signErrorText;
        }
    });
    loadJSON('item',function(json){
        var amount = 0;
        for(var i in json){
            amount += 1;
        }
        var currentAmount = 0;
        for(var i in json){
            Img[i] = new Image();
            Img[i].src = '/client/img/items/' + i + '.png';
            Img[i + 'select'] = new Image();
            Img[i + 'select'].src = '/client/img/items/' + i + 'select.png';
            currentAmount += 1;
            signError.innerHTML = '<span style="color: #55ff55">Loading items... (' + currentAmount / amount * 100 + '%)</span><br>' + signErrorText;
        }
    });
    loadJSON('harvestableNpcs',function(json){
        var amount = 0;
        for(var i in json){
            amount += 1;
        }
        var currentAmount = 0;
        for(var i in json){
            Img[i + '0'] = new Image();
            Img[i + '0'].src = '/client/img/harvestableNpcs/' + i + '0.png';
            Img[i + '1'] = new Image();
            Img[i + '1'].src = '/client/img/harvestableNpcs/' + i + '1.png';
            currentAmount += 1;
            signError.innerHTML = '<span style="color: #55ff55">Loading npcs... (' + currentAmount / amount * 100 + '%)</span><br>' + signErrorText;
        }
    });
    loadAllMaps();
}
document.getElementById('createAccount').onclick = function(){
    if(document.getElementById('username').value === ''){
        return;
    }
    socket.emit('createAccount',{username:document.getElementById('username').value,password:document.getElementById('password').value});
}
document.getElementById('deleteAccount').onclick = function(){
    if(document.getElementById('username').value === ''){
        return;
    }
    if(deletePasswordState === 0){
        document.getElementById('deleteAccount').innerHTML = 'Are you sure?';
        deletePasswordState = 1;
    }
    else{
        document.getElementById('deleteAccount').innerHTML = 'Delete Account';
        socket.emit('deleteAccount',{username:document.getElementById('username').value,password:document.getElementById('password').value});
        deletePasswordState = 0;
    }
}
document.getElementById('changePassword').onclick = function(){
    if(document.getElementById('username').value === ''){
        return;
    }
    if(changePasswordState === 0){
        changePasswordState += 1;
        document.getElementById('newPasswordLabel').style.display = 'inline-block';
        document.getElementById('newPassword').style.display = 'inline-block';
    }
    else if(changePasswordState === 1){
        changePasswordState = 0;
        socket.emit('changePassword',{username:document.getElementById('username').value,password:document.getElementById('password').value,newPassword:document.getElementById('newPassword').value});
        document.getElementById('newPasswordLabel').style.display = 'none';
        document.getElementById('newPassword').style.display = 'none';
    }
}
socket.on('signInResponse',function(data){
    if(data.success === 3){
        disconnectedDiv.style.display = 'none';
        deathDiv.style.display = 'none';
    }
    else if(data.success === 2){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: The account with username \'' + data.username + '\' is already currently in game. The other account will be disconnected shortly. Please try to sign again.</span><br>' + signErrorText;
        pageDiv.style.display = 'inline-block';
        disconnectedDiv.style.display = 'none';
        deathDiv.style.display = 'none';
        gameDiv.style.display = 'none';
    }
    else if(data.success === 1){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: Incorrect Password.</span><br>' + signErrorText;
        pageDiv.style.display = 'inline-block';
        disconnectedDiv.style.display = 'none';
        deathDiv.style.display = 'none';
        gameDiv.style.display = 'none';
    }
    else{
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: There is no account with username \'' + data.username + '\'.</span><br>' + signErrorText;
        pageDiv.style.display = 'inline-block';
        disconnectedDiv.style.display = 'none';
        deathDiv.style.display = 'none';
        gameDiv.style.display = 'none';
    }
});
socket.on('createAccountResponse',function(data){
    if(data.success === 1){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #55ff55">Successfully created an account with username \'' + data.username + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 0){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: There is already an account with username \'' + data.username + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 2){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: Your username must have more than 3 characters.</span><br>' + signErrorText;
    }
    else if(data.success === 3){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: Your username/password contains invalid characters.</span><br>' + signErrorText;
    }
    else if(data.success === 4){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: Your username/password may not exceed 40 characters.</span><br>' + signErrorText;
    }
    else if(data.success === 5){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: Your username may not be all spaces.</span><br>' + signErrorText;
    }
});
socket.on('deleteAccountResponse',function(data){
    if(data.success === 4){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: You cannot delete this account.</span><br>' + signErrorText;
    }
    else if(data.success === 3){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #55ff55">Successfully deleted the account \'' + data.username + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 2){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: The account with username \'' + data.username + '\' is currently in game. Disconnect this account to delete the account.</span><br>' + signErrorText;
    }
    else if(data.success === 1){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: Incorrect Password.</span><br>' + signErrorText;
    }
    else{
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: No account found with username \'' + data.username + '\'.</span><br>' + signErrorText;
    }
});
socket.on('changePasswordResponse',function(data){
    if(data.success === 3){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #55ff55">Successfully changed password to \'' + data.newPassword + '\'.</span><br>' + signErrorText;
    }
    else if(data.success === 2){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: The account with username \'' + data.username + '\' is currently in game. Disconnect this account to change this account\'s password.</span><br>' + signErrorText;
    }
    else if(data.success === 1){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: Incorrect Password.</span><br>' + signErrorText;
    }
    else if(data.success === 4){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: Your new password contains invalid characters.</span><br>' + signErrorText;
    }
    else if(data.success === 5){
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: Your new password must be at most 40 characters.</span><br>' + signErrorText;
    }
    else{
        signErrorText = signError.innerHTML;
        signError.innerHTML = '<span style="color: #ff0000">Error: No account found with username \'' + data.username + '\'.</span><br>' + signErrorText;
    }
    document.getElementById('newPassword').value = '';
});