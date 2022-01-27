var playerQuest = false;

updateQuest = function(quest){
    playerQuest = quest;
    if(playerQuest === false){
        currentQuest.innerHTML = 'None';
        currentQuestObjectiveDisplay.style.display = 'none';
        questImage.style.display = 'none';
        abandonQuestButton.style.display = 'none';
    }
    else{
        currentQuest.innerHTML = playerQuest.quest;
        currentQuestObjectiveDisplay.style.display = 'inline-block';
        currentQuestObjective.innerHTML = '';
        var existsTask = false;
        for(var i in playerQuest.tasks){
            if(playerQuest.tasks[i].id === 'npc'){
                if(existsTask){
                    currentQuestObjective.innerHTML += '<br>';
                }
                existsTask = true;
                if(playerQuest.tasks[i].completed){
                    currentQuestObjective.innerHTML += '<span style="color: #5ac54f;">';
                }
                else{
                    currentQuestObjective.innerHTML += '<span style="color: #ea323c;">';
                }
                currentQuestObjective.innerHTML += 'Talk to ' + playerQuest.tasks[i].name + '.</span>';
            }
            else if(playerQuest.tasks[i].id === 'monster'){
                if(existsTask){
                    currentQuestObjective.innerHTML += '<br>';
                }
                existsTask = true;
                if(playerQuest.tasks[i].completed){
                    currentQuestObjective.innerHTML += '<span style="color: #5ac54f;">';
                }
                else{
                    currentQuestObjective.innerHTML += '<span style="color: #ea323c;">';
                }
                currentQuestObjective.innerHTML += 'Kill ' + playerQuest.tasks[i].name + ' (' + playerQuest.tasks[i].amount + '/' + playerQuest.tasks[i].target + ').</span>';
            }
            else if(playerQuest.tasks[i].id === 'obtain'){
                if(existsTask){
                    currentQuestObjective.innerHTML += '<br>';
                }
                existsTask = true;
                if(playerQuest.tasks[i].completed){
                    currentQuestObjective.innerHTML += '<span style="color: #5ac54f;">';
                }
                else{
                    currentQuestObjective.innerHTML += '<span style="color: #ea323c;">';
                }
                currentQuestObjective.innerHTML += 'Obtain ' + Item.list[playerQuest.tasks[i].name].name + ' (' + playerQuest.tasks[i].amount + '/' + playerQuest.tasks[i].target + ').</span>';
            }
        }
        if(existsTask === false){
            currentQuestObjective.innerHTML = 'No quest objective.';
        }
        // questImage.style.display = 'inline-block';
        // questImage.src = '/client/data/quests/img/' + playerQuest.quest + '.png';
        abandonQuestButton.style.display = 'inline-block';
    }
}

socket.on('updateQuest',function(data){
    updateQuest(data);
});