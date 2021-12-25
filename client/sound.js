var songs = {
    theMeadow:{
        audio:new Audio('/client/websiteAssets/The Meadow - Official Meadow Guarder Song.mp3'),
        state:"paused",
    },
    tenEyedOne:{
        audio:new Audio('/client/websiteAssets/Ten Eyed One - Official Meadow Guarder Song.mp3'),
        state:"paused",
    },
    theOasis:{
        audio:new Audio('/client/websiteAssets/The Oasis - Official Meadow Guarder Song.mp3'),
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
    if(songs[songName].state === 'paused'){
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
}
fadeOutSong = function(songName){
    if(songs[songName].state === 'playing'){
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
}
playRegionSong = function(region){
    if(region === 'Seashore Province'){
        fadeInSong('theOasis');
        fadeOutSong('theMeadow');
    }
    else if(region === 'Lightning Whelk Inn'){
        fadeInSong('theOasis');
        fadeOutSong('theMeadow');
    }
    else{
        fadeInSong('theMeadow');
        fadeOutSong('theOasis');
    }
}
startBossSong = function(songName){
    for(var i in songs){
        if(i === songName){
            fadeInSong(i);
        }
        else{
            fadeOutSong(i);
        }
    }
}
stopBossSong = function(songName){
    fadeOutSong(songName);
    playRegionSong(region);
}
stopAllSongs = function(){
    for(var i in songs){
        stopSong[i]
    }
}