var currentWeather = 'none';
weatherFade.style.opacity = 0;

changeWeather = function(weather){
    var darknessChange = (weatherData[weather].darkness - parseFloat(weatherFade.style.opacity)) / 10;
    currentWeather = weather;
    var weatherInterval = setInterval(function(){
        if(weather === currentWeather){
            weatherFade.style.opacity = parseFloat(weatherFade.style.opacity) + darknessChange;
            if(Math.abs(weatherData[weather].darkness - parseFloat(weatherFade.style.opacity)) < 0.01){
                weatherFade.style.opacity = weatherData[weather].darkness;
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
    weatherFade.style.opacity = weatherData[weather].darkness;
}
resetWeather = function(){
    weatherFade.style.opacity = 0;
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