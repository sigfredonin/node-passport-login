const Album = require('./Album');

const getDurationFromMilliseconds = (ms) => {
  const msecs = ms % 1000;            // 7354320 % 1000 = 320 ms
  const secs_whole = ms / 1000;       // 7354320 / 1000 = 7354 secs
  const secs = secs_whole % 60;       // 7354 secs % 60 = 34 secs
  const mins_whole = secs_whole / 60; // 7354 secs / 60 = 122 mins
  const mins = mins_whole % 60;       // 122 mins % 60 = 2 mins
  const hours = mins_whole / 60;      // 122 mins / 60 = 2 hrs
  return ""
    + (hours < 10 ? "0" + hours : hours)
    + ":"
    + (mins < 10 ? "0" + mins : mins)
    + ":"
    + (secs < 10 ? "0" + secs : secs)
    + "."
    + (msecs < 100 ? "0" + (msecs < 10 ? "0" + msecs : msecs) : (msecs < 10 ? "0" + msecs : msecs));
}

class Track {
  constructor (albumJSON) {
    const { id, name, artists, external_urls, disc_number, track_number, duration_ms, album } = albumJSON;
    const artist_names = artists.map((artist) => {
      return artist.name;
    });
    const duration = getDurationFromMilliseconds(duration_ms);

    this.id = id;
    this.name = name;
    this.artists = artist_names;
    this.spotify_url = external_urls.spotify;
    this.image_url = album.images[0].url;
    this.release_date = album.release_date;
    this.disc_number = disc_number;
    this.track_number = track_number;
    this.duration = duration;
    this.album = new Album(album);
  }
};

module.exports = Track;
