startBossbar = function(name,hp,hpMax){
    if(bossbarDiv.style.display !== 'inline-block'){
        bossbarDiv.style.display = 'inline-block';
    }
    bossbarValue.style.width = hp / hpMax * 500 + 'px';
    bossbarText.innerHTML = name + ': ' + Math.round(hp) + ' / ' + hpMax;
}
stopBossbar = function(){
    bossbarDiv.style.display = 'none';
}