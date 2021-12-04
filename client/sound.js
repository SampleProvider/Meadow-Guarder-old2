var songs = {
    theMeadow:{
        audio:new Audio('/client/websiteAssets/The Meadow - Official Meadow Guarder Song.mp3'),
        state:"paused",
    },
    tenEyedOne:{
        audio:new Audio('/client/websiteAssets/Ten Eyed One - Official Meadow Guarder Song.mp3'),
        state:"paused",
    },
}
for(var i in songs){
    songs[i].audio.loop = true;
}
playSong = function(songName){
    songs[songName].audio.volume = 1 * settings.volumePercentage / 100;
    songs[songName].audio.play();
    songs[songName].state = 'playing';
}
stopSong = function(songName){
    songs[songName].audio.pause();
    songs[songName].audio.currentTime = 0;
    songs[songName].state = 'paused';
}
fadeInSong = function(songName){
    songs[songName].audio.currentTime = 0;
    songs[songName].audio.volume = 0 * settings.volumePercentage / 100;
    songs[songName].audio.play();
    songs[songName].state = 'fadeIn';
    var fade = 0;
    var interval = setInterval(function(){
        songs[songName].audio.volume = fade * settings.volumePercentage / 100;
        fade += 0.05;
        if(fade > 1){
            clearInterval(interval);
            songs[songName].state = 'playing';
        }
    },100 * (fade + 0.2));
}
fadeOutSong = function(songName){
    songs[songName].audio.volume = 1 * settings.volumePercentage / 100;
    songs[songName].state = 'fadeOut';
    var fade = 1;
    var interval = setInterval(function(){
        songs[songName].audio.volume = fade * settings.volumePercentage / 100;
        fade -= 0.05;
        if(fade <= 0){
            stopSong(songName);
            clearInterval(interval);
            songs[songName].state = 'paused';
        }
    },100 * (1 - fade + 0.2));
}