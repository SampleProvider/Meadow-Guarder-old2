var json = require('./' + player.quest + '.json');

player.updateQuest = function(){
    switch(player.questStage){
        case 1:
            player.questNpcs = ['Wally'];
            player.setQuestTriggers(json[player.questStage].triggers);
            player.endDialogue();
            break;
        case 2:
            player.questNpcs = [];
            player.startDialogue(json[player.questStage].dialogue);
            break;
        case 4:
            player.questNpcs = ['Fleita'];
            player.setQuestTriggers(json[player.questStage].triggers);
            player.endDialogue();
            break;
        case 5:
            player.questNpcs = [];
            player.startDialogue(json[player.questStage].dialogue);
            break;
        case 8:
            player.completeQuest();
            break;
        default:
            player.startDialogue(json[player.questStage].dialogue);
            break;
    }
}

player.completeQuest = function(){
    addToChat(player.textColor,player.name + ' completed the quest ' + player.quest + '.');
    if(player.advancements[player.quest] === undefined){
        player.advancements[player.quest] = 1;
    }
    else{
        player.advancements[player.quest] += 1;
    }
    player.quest = false;
    player.endDialogue();
    player.updateQuest = function(){};
    player.questNpcs = [];
}
player.abandonQuest = function(){
    player.quest = false;
    player.endDialogue();
    player.updateQuest = function(){};
    player.questNpcs = [];
}