let SearchBox = $('input#SearchBox')
let Methods = $('select#Methods')
let Content = $('#Content')

let streamAudio = (link, id) => {
    $(`${id}`).replaceWith(`
        <audio controls>
            <source src="${link}" type="audio/mpeg">
            Update your browser. Your browser does not support HTML audio
        </audio>
    `)
}

let downloadSong = (link, id) => {
    $(`#${id}`).replaceWith(`
        <label id="${id}-label" for="${id}" style="margin: 0 2px 0 16px;"> </label>
        <progress id="${id}" style="width: 100px;" value="0" max="100"></progress>
    `)
    $.ajax({
        url: link,
        type: 'GET',
        xhrFields: {
            responseType: 'blob'
        },
        xhr: () => {
            let xhr = new window.XMLHttpRequest();
            xhr.onreadystatechange = () => {
                $(`#${id}`).val(xhr.readyState * 25)
                if (xhr.readyState == 1) {
                    $(`#${id}-label`).text("Processing (please wait): ")
                } else if (xhr.readyState == 2) {
                    $(`#${id}-label`).text("Downloading: ")
                } else if (xhr.readyState == 3) {
                    $(`#${id}-label`).text("Sending: ")
                } else {
                    $(`#${id}-label`).text("Finished: ")
                }
            }
            return xhr
        },
        success: (blob, status, xhr) => {
            let filename = "";
            let disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition && disposition.indexOf('attachment') !== -1) {
                let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                let matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
            }

            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                window.navigator.msSaveBlob(blob, filename);
            } else {
                let URL = window.URL || window.webkitURL;
                let downloadUrl = URL.createObjectURL(blob);

                if (filename) {
                    // use HTML5 a[download] attribute to specify filename
                    let a = document.createElement("a");
                    // safari doesn't support this yet
                    if (typeof a.download === 'undefined') {
                        window.location.href = downloadUrl;
                    } else {
                        a.href = downloadUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                    }
                } else {
                    window.location.href = downloadUrl;
                }
                setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
            }
        }
    }); 
}

let downloadAlbum = async (id, numOfTracks, artist, album, year, format) => {
    let storage = [], error = {}, zipped = null, x = 0, progressText = "Downloading Tracks";
    let zip = new JSZip()
    if (format == "Default") {
        zipped = zip.folder(`${artist} - ${album} (${year})`) // Create folder to store tracks
    } else if (format == "Jellyfin") {
        zipped = zip.folder(`${artist}/${album} (${year})`) // Create folder structure for jellyfin
    }

    $(`#${id}-tracks p a`).each((index, el) => { // Store every track's download link in array
        storage.push({
            downloadURL: el.attributes[0].nodeValue, // itemid
            track: el.attributes[1].nodeValue // data-title
        })
    })
    // Make sure the download button is not clickable, change its color and innerText
    $(`#${id}-download`).removeAttr("href").removeAttr("onclick").text(progressText).css('color', '#4e9d68')
    // Set up animation
    let loading_animation = setInterval(() => {
        x = ++x % 4;
        $(`#${id}-download`).text(progressText + Array(x + 1).join("."));
    }, 500)

    for (let i = 0; i < numOfTracks; i++) {
        error.status = false; // Set to false every iteration
        // Replace "Download Tracks" with a progress bar
        $(`#progress-${id}-${i}`).replaceWith(`
        <label id="progress-${id}-${i}-label" for="progress-${id}-${i}" style="margin: 0 2px 0 16px;"> </label>
        <progress id="progress-${id}-${i}" style="width: 100px;" value="0" max="100"></progress>
        `)
        $(`#progress-${id}-${i}`).val(25) // Put 25%
        $(`#progress-${id}-${i}-label`).text("Processing (please wait): ")
            await fetch(storage[i].downloadURL)
                .then(response => response.blob())
                .then(blob => {
                    $(`#progress-${id}-${i}`).val(50) // Put 50%
                    $(`#progress-${id}-${i}-label`).text("Getting blob: ")
                    storage[i].blob = blob // Store blob into array
                })
                .catch(err => {
                    console.error(`Error in iteration ${i}: ${err}`)
                    $(`#progress-${id}-${i}`).val(0)
                    $(`#progress-${id}-${i}-label`).text("Error fetching track: ")
                    error.status = true;
                    error.reason = err;
                })
            if (error.status) {
                continue;
            }
            $(`#progress-${id}-${i}`).val(75) // Put 75%
            $(`#progress-${id}-${i}-label`).text("Archiving file: ")
            if (format == "Default") { // Default Format
                zipped.file(`${artist} - ${storage[i].track}.mp3`, storage[i].blob) // Archive file
            } else if (format == "Jellyfin") { // Jellyfin format https://jellyfin.org/docs/general/server/media/music.html
                zipped.file(`${('0'+(i+1)).slice(-2)} - ${storage[i].track}.mp3`, storage[i].blob) // Archive file
            }
            $(`#progress-${id}-${i}`).val(100) // Put 100%
            $(`#progress-${id}-${i}-label`).text("Finished: ")
    }
    // Text animation
    progressText = "Archiving now";
    $(`#${id}-download`).css('color', '#008000')
    if (error.status) {
        console.log(`Reason for Error => ${error.reason}`) 
        alert(`${error.reason} : Please close this message to reload page and try again...`)
        window.location.reload()
    } else {
        zip.generateAsync({type:"blob"}).then(content => {
            saveAs(content, `${artist} - ${album} (${year}).zip`);
            console.log(`Done processing, serving now - [${artist} - ${album} (${year}).zip] -  No errors found...`)
            clearInterval(loading_animation); // disable the loading animation
            $(`#${id}-download`).text("Finished!").css('color', '#00FF00')
        })
    }
}

let toggleAlbumTracks = (el) => {
    if ($(`#${el}`).is(':visible')) { // If shown just hide 
        $(`#${el}-methods`).css('display', 'block') // Show methods
        $(`#${el}-tracks`).css('display', 'block') // Show Tracklist
        $(`#${el}`).css('display', 'none') // Hide element 
    } else { // If hidden, reveal it
        $(`#${el}-methods`).css('display', 'none') // Hide options
        $(`#${el}-tracks`).css('display', 'none') // Hide tracklist
        $(`#${el}`).css('display', 'block') // Show element
    }
}

let showAlbumTracks = async (playlistLink, id, artist, album, year, cover) => {
    let resp, data;
    if ($(`#${id}-tracks`).length) { // If the element exists no need to fetch to api again when reclicked button
        console.log(`Tracklist exists for element '#${id}-tracks' - No need to fetch API`)
        toggleAlbumTracks(id)
        return
    } else {
        resp = await fetch(playlistLink)
        data = await resp.json()
    }

    // Show album tracks
    toggleAlbumTracks(id)

    $(`#${id}`).after(`
        <div id="${id}-methods" style="margin-bottom: 8px;"> 
            <a onclick="toggleAlbumTracks('${id}')" style="font-size: 14px;" href="javascript:void(0)"> Close </a> 
            <a id="${id}-download" style="font-size: 14px;" href="javascript:void(0)"> Download Album </a>
        </div>
        <div style="margin: 12px 0 12px 16px;">
            <label for="${id}-download-format"> Format: </label>
            <select id="${id}-download-format">
                <option value="Default"> Default </option>
                <option value="Jellyfin"> Jellyfin </option>
            </select>
        </div>
        <div id="${id}-tracks"> 
        </div>
    `)
    // Attach onclick to the "Download Album" method, hide other method
    document.getElementById(`${id}-download`).onclick = () => {
        let format = document.getElementById(`${id}-download-format`).value;
        console.log(`User has chosen to download album with ${format} as format`)
        downloadAlbum(id, data.length, artist, album, year, format);
    }

    for (let i = 0; i < data.length; i++) {
        let title = data[i].playlistVideoRenderer.title.runs[0].text;
        let videoId = data[i].playlistVideoRenderer.videoId;
        let link = `/api/download/song/${videoId}?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&title=${encodeURIComponent(title)}&cover=${cover}&year=${year}&track=${i + 1}`
        $(`#${id}-tracks`).append(`
            <p style="display:flex; font-size: 12px; width: 600px;"> 
                <b style="margin-right: 20px;">Track: #${i + 1}</b> 
                <span style="width: 200px;"> ${title} </span>
                <a itemid="${link}" data-title="${title}" id="progress-${id}-${i}" href="javascript:void(0)" onclick="downloadSong('${link}', 'progress-${id}-${i}')"> 
                    Download Track
                </a>
            </p>
        `)
    }
}

let showInformation = async (data, handler) => {
    if (handler == 'Album') {
        for (let i = 0; i < data.length; i++) { // Start progress bar
            if (data[i].artists.length == 0) { // If there are no artists in the album // ID, ARTIST, ALBUM, YEAR, COVER
                Content.append(` 
                    <div class="itemContainer" style="display:flex; margin: 16px;">
                        <img referrerpolicy="no-referrer" style="height:60px; width:60px;" src="${data[i].thumbnails[0].url}" alt="${data[i].name} [Cover]">
                        <div style="flex-direction:column;">
                            <p style="padding-bottom: 10px;"> Various Artists - ${data[i].name} (${data[i].year}) </p>
                            <a id="showAlbumTracks-${i}" href="javascript:void(0)"> Show Tracks </a>
                        </div>
                    </div>
                `)
                document.getElementById(`showAlbumTracks-${i}`).onclick = () => { // Add onclick method to element
                    showAlbumTracks(`/api/get/album/playlist/${data[i].playlistId}`, `showAlbumTracks-${i}`, 'Various Artists', data[i].name, data[i].year, data[i].thumbnails[3].url)
                }
            } else {
                Content.append(`
                    <div class="itemContainer" style="display:flex; margin: 16px;">
                        <img referrerpolicy="no-referrer" style="height:60px; width: 60px;" src="${data[i].thumbnails[0].url}" alt="${data[i].name} [Cover]">
                        <div style="flex-direction:column;">
                            <p style="padding-bottom: 10px;"> ${data[i].artists[0].name} - ${data[i].name} (${data[i].year}) </p>
                            <a id="showAlbumTracks-${i}" href="javascript:void(0)"> Show Tracks </a>
                        </div>
                    </div>
                `)
                document.getElementById(`showAlbumTracks-${i}`).onclick = () => { // Add onclick method to element
                    showAlbumTracks(`/api/get/album/playlist/${data[i].playlistId}`, `showAlbumTracks-${i}`, data[i].artists[0].name, data[i].name, data[i].year, data[i].thumbnails[3].url)
                } 
            }
        }
    } else if (handler == 'Song') {
        for (let i = 0; i < data.length; i++) {
            let cover = (data[i].thumbnails[0].url).replace(/w60-h60/, 'w544-h544') // Grab album cover with 544x544 size
            if (data[i].artists.length == 0) { // If there are no artists in the album
                Content.append(` 
                    <div class="itemContainer" style="display:flex; margin: 16px;">
                        <img referrerpolicy="no-referrer" style="height:60px; width: 60px;" src="${data[i].thumbnails[0].url}" alt="Album [Cover]">
                        <div style="flex-direction:column;">
                            <p style="padding-bottom: 10px;"> Various Artists - ${data[i].name} </p>
                            <a id="progress-bar-${i}" href="javascript:void(0)" onclick="downloadSong('/api/download/song/${data[i].videoId}?artist=Various Artists&title=${encodeURIComponent(data[i].name)}&album=${encodeURIComponent(data[i].album.name)}&cover=${cover}', 'progress-bar-${i}')"> Download </a>
                            <a id="streamButton-${i}" href="javascript:void(0)" onclick="streamAudio('api/stream/song/${data[i].videoId}', '#streamButton-${i}')">Play Now</a>
                        </div>
                    </div>
                `)
            } else {
                Content.append(`
                    <div class="itemContainer" style="display:flex; margin: 16px;">
                        <img referrerpolicy="no-referrer" style="height:60px; width:60px;" src="${data[i].thumbnails[0].url}" alt="Album [Cover]">
                        <div style="flex-direction:column;">
                            <p style="padding-bottom: 10px;"> ${data[i].artists[0].name} - ${data[i].name} </p> 
                            <a id="progress-bar-${i}" href="javascript:void(0)" onclick="downloadSong('/api/download/song/${data[i].videoId}?artist=${encodeURIComponent(data[i].artists[0].name)}&title=${encodeURIComponent(data[i].name)}&album=${encodeURIComponent(data[i].album.name)}&cover=${cover}', 'progress-bar-${i}')"> Download </a>
                            <a id="streamButton-${i}" href="javascript:void(0)" onclick="streamAudio('api/stream/song/${data[i].videoId}', '#streamButton-${i}')">Play Now</a>
                        </div>
                    </div>
                `)
            }
        }
    }
}

Methods.change(() => { // Empty everything
    Content.empty()
    SearchBox.val('')
})


SearchBox.keyup( (event) => {
    if (event.keyCode == 13) {
        Content.empty() // First we clear the content
        if (Methods.val() == 'Album') {
            fetch(`/api/album/search?q=${encodeURIComponent(SearchBox.val())}`) // Fix for inputting ampersand and some special characters
                .then(response => response.json())
                .then(data => showInformation(data, 'Album'))
        } else if (Methods.val() == 'Song') {
            fetch(`/api/song/search?q=${encodeURIComponent(SearchBox.val())}`)
                .then(response => response.json())
                .then(data => showInformation(data, 'Song'))
        }
    }
})
