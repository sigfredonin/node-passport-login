class Album {
  constructor (albumJSON) {
    const { id, name, external_urls, images, release_date, total_tracks } = albumJSON;
    this.id = id;
    this.name = name
    this.album_url = external_urls.spotify;
    this.image_url = images[0].url;
    this.release_date = release_date;
    this.tracks = total_tracks;
  }
};


module.exports = Album;
