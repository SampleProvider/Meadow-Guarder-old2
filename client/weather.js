var currentWeather = 'none';
darknessFade.style.opacity = 0;

changeWeather = function(weather){
    var darknessChange = (weatherData[weather].darkness - parseFloat(darknessFade.style.opacity)) / 10;
    currentWeather = weather;
    if(settings.darknessEffects === false){
        return;
    }
    var weatherInterval = setInterval(function(){
        if(weather === currentWeather){
            darknessFade.style.opacity = parseFloat(darknessFade.style.opacity) + darknessChange;
            if(Math.abs(weatherData[weather].darkness - parseFloat(darknessFade.style.opacity)) < 0.01){
                darknessFade.style.opacity = weatherData[weather].darkness;
                clearInterval(weatherInterval);
            }
        }
        else{
            clearInterval(weatherInterval);
        }
    },100);
}
setWeather = function(weather){
    currentWeather = weather;
    if(settings.darknessEffects === false){
        return;
    }
    darknessFade.style.opacity = weatherData[weather].darkness;
}
resetWeather = function(){
    darknessFade.style.opacity = 0;
}

socket.on('changeWeather',function(data){
    if(Player.list[selfId].map === 'World'){
        changeWeather(data);
    }
    else{
        currentWeather = data;
        resetWeather();
    }
});