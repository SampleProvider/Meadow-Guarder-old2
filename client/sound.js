var audioContext = {};
var webAudio = false;
var songs = {};
var music = {};
var playingBossMusic = false;
initAudio = function(){
    if(webAudio){
        playSong = function(songName){
            if(music.name){
                return;
            }
            if(songs[songName].loaded === false){
                console.error('Song "' + songName + '" has not loaded yet.');
                return;
            }
            songs[songName].audio = audioContext.createBufferSource();
            songs[songName].audio.buffer = songs[songName].buffer;
            songs[songName].audio.loop = true;
            songs[songName].audio.connect(songs[songName].volume);
            songs[songName].audio.start();
            songs[songName].volume.gain.value = 1;
            songs[songName].state = 'playing';
        }
        stopSong = function(songName){
            if(songs[songName].loaded === false){
                console.error('Song "' + songName + '" has not loaded yet.');
                return;
            }
            songs[songName].volume.gain.value = 0;
            songs[songName].audio.stop();
            songs[songName].state = 'paused';
        }
        fadeInSong = function(songName){
            if(music.name){
                return;
            }
            if(songs[songName].loaded === false){
                console.error('Song "' + songName + '" has not loaded yet.');
                return;
            }
            if(songs[songName].state === 'paused' || songs[songName] === 'fadeOut'){
                songs[songName].audio = audioContext.createBufferSource();
                songs[songName].audio.buffer = songs[songName].buffer;
                songs[songName].audio.loop = true;
                songs[songName].audio.connect(songs[songName].volume);
                songs[songName].audio.start();
                songs[songName].state = 'fadeIn';
                var fade = songs[songName].volume.gain.value;
                var interval = setInterval(function(){
                    fade += 0.05;
                    songs[songName].volume.gain.value = Math.min(fade,1);
                    if(fade > 1){
                        clearInterval(interval);
                        songs[songName].state = 'playing';
                    }
                },100 * (fade + 0.2));
            }
        }
        fadeOutSong = function(songName){
            if(songs[songName].loaded === false){
                console.error('Song "' + songName + '" has not loaded yet.');
                return;
            }
            if(songs[songName].state === 'playing' || songs[songName] === 'fadeIn'){
                songs[songName].state = 'fadeOut';
                var fade = songs[songName].volume.gain.value;
                var interval = setInterval(function(){
                    fade -= 0.05;
                    songs[songName].volume.gain.value = Math.max(fade,0);
                    if(fade <= 0){
                        stopSong(songName);
                        clearInterval(interval);
                        songs[songName].state = 'paused';
                    }
                },100 * (1 - fade + 0.2));
            }
        }
        startMusic = function(songName){
            if(songName !== music.name){
                for(var i in songs){
                    stopSong(i);
                }
                if(music.audio){
                    if(music.audio.stop){
                        music.audio.onended = function(){};
                        music.audio.stop();
                    }
                }
                music = {
                    name:songName,
                    audio:audioContext.createBufferSource(),
                };
                music.audio.buffer = songs[songName].buffer;
                music.audio.connect(globalVolume);
                music.audio.start();
                music.audio.onended = function(){
                    music.name = null;
                    playRegionSong(worldRegion);
                }
            }
        }
    }
    else{
        playSong = function(songName){
            if(music.name){
                return;
            }
            if(songs[songName].loaded === false){
                console.error('Song "' + songName + '" has not loaded yet.');
                return;
            }
            songs[songName].audio.volume = settings.volumePercentage / 100;
            songs[songName].audio.play();
            songs[songName].state = 'playing';
        }
        stopSong = function(songName){
            if(songs[songName].loaded === false){
                console.error('Song "' + songName + '" has not loaded yet.');
                return;
            }
            songs[songName].audio.pause();
            songs[songName].audio.currentTime = 0;
            songs[songName].audio.volume = 0;
            songs[songName].state = 'paused';
        }
        fadeInSong = function(songName){
            if(music.name){
                return;
            }
            if(songs[songName].loaded === false){
                console.error('Song "' + songName + '" has not loaded yet.');
                return;
            }
            if(songs[songName].state === 'paused' || songs[songName] === 'fadeOut'){
                if(songs[songName] === 'paused'){
                    songs[songName].audio.currentTime = 0;
                }
                songs[songName].audio.play();
                songs[songName].state = 'fadeIn';
                var fade = songs[songName].audio.volume / settings.volumePercentage * 100;
                var interval = setInterval(function(){
                    fade += 0.05;
                    songs[songName].audio.volume = Math.min(fade * settings.volumePercentage / 100,1);
                    if(fade > 1){
                        clearInterval(interval);
                        songs[songName].state = 'playing';
                    }
                },100 * (fade + 0.2));
            }
        }
        fadeOutSong = function(songName){
            if(songs[songName].loaded === false){
                console.error('Song "' + songName + '" has not loaded yet.');
                return;
            }
            if(songs[songName].state === 'playing' || songs[songName] === 'fadeIn'){
                songs[songName].state = 'fadeOut';
                var fade = songs[songName].audio.volume / settings.volumePercentage * 100;
                var interval = setInterval(function(){
                    fade -= 0.05;
                    songs[songName].audio.volume = Math.max(fade * settings.volumePercentage / 100,0);
                    if(fade <= 0){
                        stopSong(songName);
                        clearInterval(interval);
                        songs[songName].state = 'paused';
                    }
                },100 * (1 - fade + 0.2));
            }
        }
        startMusic = function(songName){
            if(songName !== music.name){
                for(var i in songs){
                    stopSong(i);
                }
                if(music.audio){
                    if(music.audio.stop){
                        music.audio.onended = function(){};
                        music.audio.stop();
                    }
                }
                music = {
                    name:songName,
                    audio:new Audio(songs[songName].url),
                };
                music.audio.currentTime = 0;
                music.audio.play();
                music.audio.onended = function(){
                    music.name = null;
                    playRegionSong(worldRegion);
                }
            }
        }
    }
}
playRegionSong = function(region){
    if(music.name){
        return;
    }
    if(playingBossMusic){
        return;
    }
    if(region === 'Altoris Island'){
        playOneSong('theMeadow');
    }
    else if(region === 'Seashore Province'){
        playOneSong('theOasis');
    }
    else if(region === 'Seashell Village'){
        playOneSong('theOasis');
    }
    else if(region === 'Lujadih Mountain'){
        playOneSong('theOldDays');
    }
    else if(region === 'Lujadih Pass'){
        playOneSong('theOldDays');
    }
    else if(region === 'Lujadih Plateau'){
        playOneSong('theOldDays');
    }
    else if(region === 'Rocky Pass'){
        playOneSong('avalanche');
    }
    else if(region === 'The Eternal Forest'){
        playOneSong('dewdrop');
    }
    else if(region === 'Forest Fortress'){
        playOneSong('dewdrop');
    }
}
startBossSong = function(songName){
    if(music.name){
        return;
    }
    playingBossMusic = true;
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
    if(music.name){
        return;
    }
    playingBossMusic = false;
    fadeOutSong(songName);
    playRegionSong(worldRegion);
}
stopAllSongs = function(){
    if(music.audio){
        if(music.audio.stop){
            music.audio.onended = function(){};
            music.audio.stop();
        }
    }
    for(var i in songs){
        stopSong(i);
    }
}
playOneSong = function(songName){
    if(music.name){
        return;
    }
    for(var i in songs){
        if(i === songName){
            fadeInSong(i);
        }
        else{
            fadeOutSong(i);
        }
    }
}

socket.on('musicBox',function(songName){
    startMusic(songName);
});