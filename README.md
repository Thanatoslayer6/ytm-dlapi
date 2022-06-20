# ytm-dlapi

🎵 A Youtube Music Downloader/API Running on Express 🖥️

👇 **Deploy to Heroku in one click!** 👍

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Thanatoslayer6/ytm-dlapi/)

_Warning: Deploy at your own risk! (Your account might get banned/suspended for violating the TOS)_

### A Quick Front-End that I created 😑
![Example Frontend](/example-frontend/example-frontend.png)

## Searching and Getting an Album/Song's Information

### /api/song/search?q={Song name}

- Filters the search for only songs, receive JSON data just like a search request on YouTube-Music.
- Method: **GET**

### /api/album/search?q={Album name}

- Search for an album, results are of the same search request on YouTube-Music, but filtered to only show albums/singles.
- Method: **GET**

### /api/get/song/${videoId}

- Fetches the song's information, gives thumbnails, duration, year, etc.
- Method: **GET**

### /api/get/album/${albumId}

- Returns the album's description, tracks (videoId, name), year, playlistId, thumbnails, etc.
- Method: **GET**
- Note: _Fetched tracks within this endpoint is not as accurate as getting the Official Audio for a song/track. For better results, use the endpoint `/api/get/album/playist/${playlistId}` for getting the proper tracks and their videoId's._

### /api/get/album/playlist/${playlistId}

- Gets the album's tracks with their respective videoId's and some other information like year, thumbnails, track number, etc. Scrapes the unlisted playlist of the said album set by YouTube.
- Method: **GET**

## Streaming

### /api/stream/song/${videoId}

- Streams a song when given a YouTube videoId, returns a readableStream
- Method: **GET**

## Downloading

### /api/download/song/${videoId}

- Downloads a song when given a videoId. Returns a buffer of the song with proper filename and tags, whenever parameters are added.
- Method: **GET**

Parameters that can be used **(Album, Artist, Year, Track Number, Title, Cover)**

  #### Examples: 
  (Downloading a song with tags)
  ```
  /api/download/song/lXcX5llJeko?artist=The Fray&title=How To Save A Life&album=How To Save A Life&cover=https://lh3.googleusercontent.com/sB9QbA0jMTQ_4xKJdqt7tUEm_GPazioRHhZ4WWRuTKt7k9yVIKiYbAlpjYKGymR5Ru14e6W0Ta9WbT34=w544-h544-l90-rj
  ```
  (Downloading a song with full tags)
  ```
  /api/download/song/MT1j4LS8h8U?artist=Rick Astley&album=Together Forever EP&title=Together Forever (Reimagined)&cover=https://lh3.googleusercontent.com/zSpiBkVK0CY7wTa1xwmQCeAaF6196AFt456eTG6wonaYP_s7MxbkV6tvZ2oCAHLpRrqJXqIpxpTw8hFH=w544-h544-l90-rj&year=2022&track=2
  ```
  
# Local Installation

### Requirements
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

[JSZip](https://github.com/Stuk/jszip)

[FileSaver.js](https://github.com/eligrey/FileSaver.js)

😎 And other notable NodeJS Youtube Music projects 😎
