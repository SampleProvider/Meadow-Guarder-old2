var songs = {
    theMeadow:new Audio('/client/websiteAssets/The Meadow - Official Meadow Guarder Song.mp3'),
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