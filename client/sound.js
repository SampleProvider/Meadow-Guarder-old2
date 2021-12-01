var songs = {
    theMeadow:new Audio('/client/websiteAssets/The Meadow - Official Meadow Guarder Song.mp3'),
    tenEyedOne:new Audio('/client/websiteAssets/Ten Eyed One - Official Meadow Guarder Song.mp3'),
}
for(var i in songs){
    songs[i].loop = true;
}
playSong = function(songName){
    songs[songName].play();
}
stopSong = function(songName){
    songs[songName].pause();
    songs[songName].currentTime = 0;
}
fadeInSong = function(songName){
    songs[songName].play();
    songs[songName].setVolume(0);
    var fade = 0;
    var interval = setInterval(function(){
        songs[songName].setVolume(fade);
        fade += 0.05;
        if(fade > 1){
            clearInterval(interval);
        }
    },100);
}
// setTimeout(function(){fadeInSong('tenEyedOne');},1000);
