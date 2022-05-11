# ytm-dlapi

🎵 A Youtube Music Downloader/API Running on Express 🖥️

👇 **Deploy to Heroku in one click!** 👍

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Thanatoslayer6/ytm-dlapi/)

## A Quick Front-end that I created 😑
![Example Frontend](/example-frontend/example-frontend.png)

## API Features

#### Searching and Getting an Album/Song's Information

##### /api/song/search?q={Song name}

- Filters the search for only songs, receive JSON data just like a search request on YouTube-Music.
- Method: **GET**

##### /api/album/search?q={Album name}

- Search for an album, results are of the same search request on YouTube-Music, but filtered to only show albums/singles.
- Method: **GET**

##### /api/get/song/${videoId}

- Fetches the song's information, gives thumbnails, duration, year, etc.
- Method: **GET**

##### /api/get/album/${albumId}

- Returns the album's description, tracks (videoId, name), year, playlistId, thumbnails, etc.
- Method: **GET**
- Note: _Fetched tracks within this endpoint is not as accurate as getting the Official Audio for a song/track. For better results, use the endpoint `/api/get/album/playist/${playlistId}` for getting the proper tracks and their videoId's._

##### /api/get/album/playlist/${playlistId}

- Gets the album's tracks with their respective videoId's and some other information like year, thumbnails, track number, etc. Scrapes the unlisted playlist of the said album set by YouTube.
- Method: **GET**

#### Streaming

##### /api/stream/song/${videoId}

- Streams a song when given a YouTube videoId
- Method: **GET**

#### Downloading

##### /api/download/song/${videoId}

- Downloads a song when given a videoId

  Returns attachment of song with proper filename and tags, whenever parameters are added.

  *(Album, Artist, Title, Cover)*

  Example: (Downloading a song with tags)
  ```
  /api/download/song/lXcX5llJeko?artist=The Fray&title=How To Save A Life&album=How To Save A Life&cover=https://lh3.googleusercontent.com/sB9QbA0jMTQ_4xKJdqt7tUEm_GPazioRHhZ4WWRuTKt7k9yVIKiYbAlpjYKGymR5Ru14e6W0Ta9WbT34=w544-h544-l90-rj
  ```

##### /api/download/album/${playlistId}

- Downloads the album of an artist

  Returns a zipped attachment containing the tracks of an album with proper filename and tags

  *(Year, Album, Artist, Title, TrackNum, Cover)*

  Example: (Downloading an album with tags)
  ```
  /api/download/album/OLAK5uy_m-gO_Tg8nscLdoNdXORCpV4gHstHJ9J04?artist=Mac DeMarco&album=Salad Days&year=2014&cover=https://lh3.googleusercontent.com/kD050a9mq1WH-QF6KkZPxqG-FEOdp_W425-zUgrHsyTP8kLg4QRmzgnzcHve6fCY-Vz7_xdGXmxdvICQ=w544-h544-l90-rj
  ```
  
## Local Installation

_Requirements_
- [ffmpeg](https://ffmpeg.org/download.html)
- [nodejs](https://nodejs.org/en/download/) and [npm](https://nodejs.org/en/download/)

**Step 1:** 🤲 Clone this directory using `git` 🤝
```
  git clone https://github.com/Thanatoslayer6/ytm-dlapi.git
```
**Step 2:** 🏃 Go into the root directory and install required dependencies using npm ⌨️

```
  cd ytm-dlapi/
  npm install
```
**Step 3:** 🏆 Start and enjoy your new server 🏆

```
  node index.js
```

## Special Thanks to these wonderful projects: 👏 👏 👏

[ytdl-core](https://github.com/fent/node-ytdl-core)

[ytmusic-api](https://github.com/zS1L3NT/ts-npm-ytmusic-api)

[node-id3](https://github.com/Zazama/node-id3)

[adm-zip](https://github.com/cthackers/adm-zip)

😎 And other notable NodeJS Youtube Music projects 😎
