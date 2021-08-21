

var deletePasswordState = 0;
var changePasswordState = 0;

document.getElementById('signIn').onclick = function(){
    socket.emit('signIn',{username:document.getElementById('username').value,password:document.getElementById('password').value});
}
document.getElementById('createAccount').onclick = function(){
    socket.emit('createAccount',{username:document.getElementById('username').value,password:document.getElementById('password').value});
}
document.getElementById('deleteAccount').onclick = function(){
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
    if(changePasswordState === 0){
        changePasswordState += 1;
        document.getElementById('newPassword-label').style.display = 'inline-block';
        document.getElementById('newPassword').style.display = 'inline-block';
    }
    else if(changePasswordState === 1){
        changePasswordState = 0;
        socket.emit('changePassword',{username:document.getElementById('username').value,password:document.getElementById('password').value,newPassword:document.getElementById('newPassword').value});
        document.getElementById('newPassword-label').style.display = 'none';
        document.getElementById('newPassword').style.display = 'none';
    }
}
socket.on('signInResponse',function(data){
    if(data.success === 3){
        gameDiv.style.display = 'inline-block';
        disconnectedDiv.style.display = 'none';
        deathDiv.style.display = 'none';
        pageDiv.style.display = 'none';
    }
    else if(data.success === 2){
        alert("The account with username \'" + signDivUsername.value + "\' is already currently in game. The other account will be disconnected shortly. Please try to sign again.");
        pageDiv.style.display = 'inline-block';
        disconnectedDiv.style.display = 'none';
        deathDiv.style.display = 'none';
        gameDiv.style.display = 'none';
    }
    else if(data.success === 1){
        alert("Incorrect Password.");
        pageDiv.style.display = 'inline-block';
        disconnectedDiv.style.display = 'none';
        deathDiv.style.display = 'none';
        gameDiv.style.display = 'none';
    }
    else{
        alert("No account found with username \'" + signDivUsername.value + "\'.");
        pageDiv.style.display = 'inline-block';
        disconnectedDiv.style.display = 'none';
        deathDiv.style.display = 'none';
        gameDiv.style.display = 'none';
    }
});
socket.on('createAccountResponse',function(data){
    if(data.success === 1){
        alert("Account created with username \'" + signDivUsername.value + "\'.");
    }
    else if(data.success === 0){
        alert("Sorry, there is already an account with username \'" + signDivUsername.value + "\'.");
    }
    else if(data.success === 2){
        alert("Please use a username with 3+ characters.");
    }
    else if(data.success === 3){
        alert("Invalid characters.");
    }
    else if(data.success === 4){
        alert("Please use a shorter username / password.");
    }
});
socket.on('deleteAccountResponse',function(data){
    if(data.success === 3){
        alert("Deleted account created with username \'" + signDivUsername.value + "\'.");
    }
    else if(data.success === 2){
        alert("The account with username \'" + signDivUsername.value + "\' is currently in game. Disconnect this account to delete the account.");
    }
    else if(data.success === 1){
        alert("Incorrect Password.");
    }
    else{
        alert("No account found with username \'" + signDivUsername.value + "\'.");
    }
});
socket.on('changePasswordResponse',function(data){
    if(data.success === 3){
        alert("Changed password to \'" + document.getElementById('newPassword').value + "\'.");
    }
    else if(data.success === 2){
        alert("The account with username \'" + signDivUsername.value + "\' is currently in game. Disconnect this account to change the password.");
    }
    else if(data.success === 1){
        alert("Incorrect Password.");
    }
    else if(data.success === 4){
        alert("Invalid characters.");
    }
    else{
        alert("No account found with username \'" + signDivUsername.value + "\'.");
    }
    document.getElementById('newPassword').value = '';
});