startBossbar = function(name,hp,hpMax){
    if(bossbarDiv.style.display !== 'inline-block'){
        bossbarDiv.style.display = 'inline-block';
    }
    bossbarValue.style.width = Math.max(hp,0) / hpMax * 500 + 'px';
    bossbarText.innerHTML = name + ': ' + Math.max(Math.round(hp),0) + ' / ' + hpMax;
}
stopBossbar = function(){
    bossbarDiv.style.display = 'none';
}