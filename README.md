# ytm-dlapi
A Youtube Music Downloader/API Running on Express

**Deploy in One Click**

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Thanatoslayer6/ytm-dlapi/)

![Example Frontend](/example-frontend/example-frontend.png)

**API Features**

/api/search/song/{Song name}

- Search for a song, receive json data

/api/search/album/{Album name}

- Search for an album, receive json data

/api/stream/song/${videoId}

- Streams a song when given a YouTube videoId

### Downloading

/api/download/song/${videoId}

- Downloads a song when given a videoId

returns attachment of song with proper filename and tags (Year, Album, Artist, Title, Cover)

/api/download/album/${playlistId}

- Downloads the album of an artist

returns a zipped attachment containing the tracks of an album with proper filename and tags
(Year, Album, Artist, Title, TrackNum, Cover)


