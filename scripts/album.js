/*
 * Variable definitions
 */

// Store state of playing songs
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

// Store references for quick access
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

/*
 * Event Handlers
 */

// Function for when we want to play or pause a song
var clickHandler = function() {
    var songNumber = parseInt($(this).attr('data-song-number'));

	if (currentlyPlayingSongNumber !== null) {
		// Revert to song number for currently playing song because user started playing new song.
		var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
		currentlyPlayingCell.html(currentlyPlayingSongNumber);
	}
    if (currentlyPlayingSongNumber !== songNumber) {
		// Switch from Play -> Pause button to indicate new song is playing.
		$(this).html(pauseButtonTemplate);
		setSong(songNumber);
        // Need to play the currentSoundFile here!
        currentSoundFile.play();
        updatePlayerBarSong();
	} else if (currentlyPlayingSongNumber === songNumber) {
		// Switch from Pause -> Play button to pause currently playing song.
		$(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
		// Need to get rid of setSong null replace with conditional statement to check if currentSoundFile is paused
        //setSong(null);
        if (currentSoundFile.isPaused()) {
            currentSoundFile.play();
            // icon in song row to pause
            // icon in play bar to pause
            $(this).html(pauseButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPauseButton);
        } else {
            currentSoundFile.pause();
            // content of song number cell to play
            //icon in play bar to play
            $(this).html(playButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPlayButton);
        }
	}
};

// Function for when we hover over a song row
// Obscolete - refactored into songHoverHandler
var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
};

// Function for when we no longer hover over song row
// Obscolete - refactored into songHoverHandler
var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
};

// Function to refactor the onHover and offHover into one handler
var songHoverHandler = function(event) {
    var songNumberCell = $(this).find('.song-item-number');
    var songNumber = parseInt(songNumberCell.attr('data-song-number'));
    
    // We're not hovering over the current song
    if (songNumber !== currentlyPlayingSongNumber) {
        if (event.type == "mouseenter") {
            // On hover over change to play icon
            songNumberCell.html(playButtonTemplate);
        } else {
            // On hover leave change back to the song number
            songNumberCell.html(songNumber);
        }
    }
};


// Play the next song
// Obscolete - replaced by skipSong
var nextSong = function(e) {
  //console.log(e.target.parentElement.className);
  if (currentlyPlayingSongNumber === null) { return; }
  var trackNo = trackIndex(currentAlbum,currentSongFromAlbum);
  var nextSong = (trackNo == currentAlbum.songs.length - 1) ? 0 : trackNo + 1;
  pickSong(nextSong);
};

// Play the previous song
// Obscolete - replaced by skipSong
var previousSong = function(e) {
  //console.log(e.target.parentElement.className);
  if (currentlyPlayingSongNumber === null) { return;}
  var trackNo = trackIndex(currentAlbum,currentSongFromAlbum);
  var previousSong = (trackNo == 0) ? currentAlbum.songs.length - 1 : trackNo - 1;
  pickSong(previousSong);
};


// Function to refactor previous and next song handlers into on
var skipSong = function(event) {
    // Do not do anything if nothing is playing
    if (currentlyPlayingSongNumber === null) { return; }
    
    // Get if we are next or previous
    var action = event.target.parentElement.className;
    var offset = 0;
    
    // Set the offset based upon the action
    if (action === 'next') {
        offset = 1;
    } else {
        offset = -1;
    }
    
    // Get the new song and fire the event
    pickSong(newTrackIndex(offset));
};


// Toggle the play/pause
var playPauseSong = function() {
    // We have not got anything playing - so play the first song
    if (currentlyPlayingSongNumber === null) { 
        pickSong(0); 
    }
    // Fire the click on the currently playing song
    // To fix as icon still there for play/pause not cleared by hover over
    else {
        pickSong(currentlyPlayingSongNumber - 1);
    } 
};

/*
 * HTML template functions
 */

// Creates a row for a given song and attaches handlers to it 
var createSongRow = function(songNumber, songName, songLength) {
     var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + songLength + '</td>'
      + '</tr>'
      ;
 
     var $row = $(template);
    
     // #1 Add click handler to the row
     $row.find('.song-item-number').click(clickHandler);
    
     // #2 Add hover functions to row
     //$row.hover(onHover, offHover);
     $row.hover(songHoverHandler);
    
     // #3 Return row
     return $row;
 };

// Populates the page with data for the current album
var setCurrentAlbum = function(album) {
     currentAlbum = album;
     var $albumTitle = $('.album-view-title');
     var $albumArtist = $('.album-view-artist');
     var $albumReleaseInfo = $('.album-view-release-info');
     var $albumImage = $('.album-cover-art');
     var $albumSongList = $('.album-view-song-list');
 
     // #2 Set values based upon the album details
     $albumTitle.text(album.title);
     $albumArtist.text(album.artist);
     $albumReleaseInfo.text(album.year + ' ' + album.label);
     $albumImage.attr('src', album.albumArtUrl);
 
     // #3 Clear out any existing song rows from almbumSongList
     $albumSongList.empty();
 
     // #4 Create new song rows and add them to the albumSongList
     for (var i = 0; i < album.songs.length; i++) {
         var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
         $albumSongList.append($newRow);
     }
};

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';


/*
 * Helper functions
 */ 

// Programatically fire the click on the song to avoid code duplcation 
var pickSong = function(songNumber) {
   // Get an array of the songs so we can fire events programatically
   var songs = $('.song-item-number');
    
   // Fire event
  songs[songNumber].click();
};


//new function to setSong
var setSong = function(songNumber) {
    if (currentSoundFile) {
         currentSoundFile.stop();
     }
    
    currentlyPlayingSongNumber = parseInt(songNumber);
    
    if (songNumber !== null) {
        currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    } else {
        currentSongFromAlbum = null;
    }
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
         // #2
         formats: [ 'mp3' ],
         preload: true
     });
    
     setVolume(currentVolume);
};


// Function to set the volume
var setVolume = function(volume) {
     if (currentSoundFile) {
         currentSoundFile.setVolume(volume);
     }
 };


// Get the table cell relating to the song number 
var getSongNumberCell = function(number) {
    // Revert to song number for currently playing song because user started playing new song.
    return $('.song-item-number[data-song-number="' + number + '"]');
};


// Return the index of the song in the album.songs array
var trackIndex = function(album, song) {
     return album.songs.indexOf(song);
};


// Return new track index based upon offset
var newTrackIndex = function(offset){
    var trackNo = trackIndex(currentAlbum,currentSongFromAlbum);
    var tracks = currentAlbum.songs.length;
    
    // Loop around (assumes singular offset)
    var newTrackIndex = ((trackNo + offset) < 0 ? (tracks - 1) : (trackNo + offset)) % tracks;
    
    return newTrackIndex;
};


// Updste the player bar based upon what is playing
var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);    
};


/*
 * Document ready call
 */

$(document).ready(function() {
    setCurrentAlbum(albumPicasso); 
    //$previousButton.click(previousSong);
    $previousButton.click(skipSong);
    //$nextButton.click(nextSong);
    $nextButton.click(skipSong);
    $playPauseButton.click(playPauseSong);
});
     