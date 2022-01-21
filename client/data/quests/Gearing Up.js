quests[player.quest] = {};

quests[player.quest].json = require('./' + player.quest + '.json');

quests[player.quest].updateQuest = function(self,dialogueTask){
    for(var i in self.questTasks){
        if(self.questTasks[i].completed === false){
            if(dialogueTask !== undefined){
                if(self.questTasks[i].id === 'dialogue' && self.questTasks[i].option !== self.questTasks[dialogueTask].option){
                    continue;
                }
            }
            return;
        }
    }
    if(quests[self.quest].json[self.questStage].questStage){
        self.questStage += quests[self.quest].json[self.questStage].questStage;
    }
    if(dialogueTask !== undefined){
        if(self.questTasks[dialogueTask].questStage){
            self.questStage += self.questTasks[dialogueTask].questStage;
        }
    }
    switch(self.questStage){
        case 4:
            self.startDialogue(quests[self.quest].json[self.questStage].dialogue);
            self.setQuestTasks(quests[self.quest].json[self.questStage].tasks);
            self.inventory.addItem('coppershiv',1);
            break;
        default:
            self.startDialogue(quests[self.quest].json[self.questStage].dialogue);
            self.setQuestTasks(quests[self.quest].json[self.questStage].tasks);
            break;
    }
}

quests[player.quest].completeQuest = function(self){
    globalChat(self.textColor,self.name + ' completed the quest ' + self.quest + '.');
    if(self.advancements[self.quest] === undefined){
        self.advancements[self.quest] = 1;
    }
    else{
        self.advancements[self.quest] += 1;
    }
    self.quest = false;
    self.questTasks = [];
    self.endDialogue();
    self.updateQuest = function(){};
}
quests[player.quest].abandonQuest = function(self){
    self.quest = false;
    self.questTasks = [];
    self.endDialogue();
    self.updateQuest = function(){};
}