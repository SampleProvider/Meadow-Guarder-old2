var text = '';
var textIndex = 0;
var typeWriter = function(cb){
    if(textIndex < text.length){
        dialogueMessage.innerHTML += text.charAt(textIndex);
        textIndex += 1;
        setTimeout(function(){
            typeWriter(cb);
        },100 / settings.textSpeed);
    }
    else{
        cb();
    }
}

socket.on('dialogue',function(data){
    if(data.message){
        openDialogue();
        dialogueMessage.innerHTML = '';
        text = data.message;
        textIndex = 0;
        dialogueOption1.style.display = 'none';
        dialogueOption2.style.display = 'none';
        dialogueOption3.style.display = 'none';
        dialogueOption4.style.display = 'none';
        dialogueOption1.style.animationName = 'none';
        dialogueOption2.style.animationName = 'none';
        dialogueOption3.style.animationName = 'none';
        dialogueOption4.style.animationName = 'none';
        typeWriter(function(){
            if(data.option1){
                dialogueOption1.innerHTML = data.option1;
                dialogueOption1.style.display = 'inline-block';
                dialogueOption1.style.opacity = 0.7;
                dialogueOption1.style.animationName = 'fadeIn';
            }
            if(data.option2){
                dialogueOption2.innerHTML = data.option2;
                dialogueOption2.style.display = 'inline-block';
                dialogueOption2.style.opacity = 0.7;
                dialogueOption2.style.animationName = 'fadeIn';
            }
            if(data.option3){
                dialogueOption3.innerHTML = data.option3;
                dialogueOption3.style.display = 'inline-block';
                dialogueOption3.style.opacity = 0.7;
                dialogueOption3.style.animationName = 'fadeIn';
            }
            if(data.option4){
                dialogueOption4.innerHTML = data.option4;
                dialogueOption4.style.display = 'inline-block';
                dialogueOption4.style.opacity = 0.7;
                dialogueOption4.style.animationName = 'fadeIn';
            }
        });
    }
    else{
        closeDialogue();
    }
});

var dialogueResponse = function(response){
    socket.emit("dialogueResponse",response);
}