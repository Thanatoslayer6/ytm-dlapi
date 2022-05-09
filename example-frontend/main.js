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
        <label id="${id}-label" for="${id}" style="margin-left: 16px;"> </label>
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

let downloadAlbum = async (id, numOfTracks) => {
    let blobTrackURLS = [], properTrackURLS = [], link;
    $(`#${id}-tracks p a`).each((index, el) => { // Store every track's download link in array
        properTrackURLS.push(el.attributes[1].nodeValue)
    })

    for (let i = 0; i < numOfTracks; i++) { // Replace "Download Tracks" with a progress bar, and store all links in array
        $(`#progress-${id}-${i}`).replaceWith(`
        <label id="progress-${id}-${i}-label" for="progress-${id}-${i}" style="margin-left: 16px;"> </label>
        <progress id="progress-${id}-${i}" style="width: 100px;" value="0" max="100"></progress>
        `)
    }

    for (let i = 0; i < numOfTracks; i++) {
        fetch(properTrackURLS[i])
            .then(response => response.blob())
            .then(blob => {
                blobTrackURLS.push(URL.createObjectURL(blob))
            })
        
        // Push specific track blob url to array
        // CONTINUE HERE (add all blob files to zip file, find a way to show progress per donwload)
        // $.ajax({
        //     url: properTrackURLS[i],
        //     type: 'GET',
        //     xhrFields: {
        //         responseType: 'blob'
        //     },
        //     xhr: () => {
        //         let xhr = new window.XMLHttpRequest();
        //         xhr.onreadystatechange = () => {
        //             $(`#progress-${id}-${i}`).val(xhr.readyState * 25)
        //             if (xhr.readyState == 1) {
        //                 $(`#progress-${id}-${i}-label`).text("Processing (please wait): ")
        //             } else if (xhr.readyState == 2) {
        //                 $(`#progress-${id}-${i}-label`).text("Downloading: ")
        //             } else if (xhr.readyState == 3) {
        //                 $(`#progress-${id}-${i}-label`).text("Sending: ")
        //             } else {
        //                 $(`#progress-${id}-${i}-label`).text("Finished: ")
        //             }
        //         }
        //         return xhr
        //     },
        //     success: (blob, status, xhr) => {
        //         let filename = "";
        //         let disposition = xhr.getResponseHeader('Content-Disposition');
        //         if (disposition && disposition.indexOf('attachment') !== -1) {
        //             let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        //             let matches = filenameRegex.exec(disposition);
        //             if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        //         }
        //         if (typeof window.navigator.msSaveBlob !== 'undefined') {
        //             // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
        //             window.navigator.msSaveBlob(blob, filename);
        //         } else {
        //             let URL = window.URL || window.webkitURL;
        //             let downloadUrl = URL.createObjectURL(blob);
        //             // Push specific track blob url to array
        //             blobTrackURLS.push(downloadUrl)
        //         }
        //     },
        //     async: false
        // })
    }
    console.log(blobTrackURLS)
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

    toggleAlbumTracks(id)
    $(`#${id}`).after(`
        <div id="${id}-methods" style="margin-bottom: 8px;"> 
            <a onclick="toggleAlbumTracks('${id}')" style="font-size: 14px;" href="#"> Close </a> 
            <a onclick="downloadAlbum('${id}', ${data.length})" id="${id}-download" style="font-size: 14px;" href="#"> Download Album </a>
        </div>
        <div id="${id}-tracks"> 
        </div>
    `)

    for (let i = 0; i < data.length; i++) {
        let title = data[i].playlistVideoRenderer.title.runs[0].text;
        let videoId = data[i].playlistVideoRenderer.videoId;
        let link = `/api/download/song/${videoId}?artist=${artist}&album=${album}&title=${title}&cover=${cover}&year=${year}&track=${i + 1}`
        $(`#${id}-tracks`).append(`
            <p style="display:flex; font-size: 12px; width: 600px; gap:20px;"> 
                <b>Track: #${i + 1}</b> 
                ${title}
                <a style="margin: 0px" itemid="${link}" id="progress-${id}-${i}" href="#" onclick="downloadSong('${link}', 'progress-${id}-${i}')"> 
                    Download Track
                </a>
            </p>
        `)
    }
}

let showInformation = async(data, handler) => {
    if (handler == 'Album') {
        for (let i = 0; i < data.length; i++) { // Start progress bar
            if (data[i].artists.length == 0) { // If there are no artists in the album // ID, ARTIST, ALBUM, YEAR, COVER
                Content.append(` 
                    <div class="itemContainer" style="display:flex; margin: 16px;">
                        <img style="height:60px; width:60px;" src="${data[i].thumbnails[0].url}" alt="${data[i].name} album cover...">
                        <div style="flex-direction:column;">
                            <p style="padding-bottom: 10px;"> Various Artists - ${data[i].name} (${data[i].year}) </p>
                            <a id="showAlbumTracks-${i}" href="#" onclick="showAlbumTracks('/api/get/album/playlist/${data[i].playlistId}', 'showAlbumTracks-${i}', 'Various Artists', '${data[i].name}', '${data[i].year}', '${data[i].thumbnails[3].url}')"> Show Tracks </a>
                        </div>
                    </div>
                `)
            } else {
                Content.append(`
                    <div class="itemContainer" style="display:flex; margin: 16px;">
                        <img style="height:60px; width: 60px;" src="${data[i].thumbnails[0].url}" alt="${data[i].name} album cover...">
                        <div style="flex-direction:column;">
                            <p style="padding-bottom: 10px;"> ${data[i].artists[0].name} - ${data[i].name} (${data[i].year}) </p>
                            <a id="showAlbumTracks-${i}" href="#" onclick="showAlbumTracks('/api/get/album/playlist/${data[i].playlistId}', 'showAlbumTracks-${i}', '${data[i].artists[0].name}', '${data[i].name}', '${data[i].year}', '${data[i].thumbnails[3].url}')"> Show Tracks </a>
                        </div>
                    </div>
                `)
            }
        }
    } else if (handler == 'Song') {
        for (let i = 0; i < data.length; i++) {
            let cover = (data[i].thumbnails[0].url).replace(/w60-h60/, 'w544-h544') // Grab album cover with 544x544 size
            if (data[i].artists.length == 0) { // If there are no artists in the album
                Content.append(` 
                    <div class="itemContainer" style="display:flex; margin: 16px;">
                        <img src="${data[i].thumbnails[0].url}" alt="album cover...">
                        <div style="flex-direction:column;">
                            <p style="padding-bottom: 10px;"> Various Artists - ${data[i].name} </p>
                            <a id="progress-bar-${i}" href="#" onclick="downloadSong('/api/download/song/${data[i].videoId}?artist=Various Artists&title=${data[i].name}&album=${data[i].album.name}&cover=${cover}', 'progress-bar-${i}')"> Download </a>
                            <a id="streamButton-${i}" href="#" onclick="streamAudio('api/stream/song/${data[i].videoId}', '#streamButton-${i}')">Play Now</a>
                        </div>
                    </div>
                `)
            } else {
                Content.append(`
                    <div class="itemContainer" style="display:flex; margin: 16px;">
                        <img src="${data[i].thumbnails[0].url}" alt="album cover...">
                        <div style="flex-direction:column;">
                            <p style="padding-bottom: 10px;"> ${data[i].artists[0].name} - ${data[i].name} </p> 
                            <a id="progress-bar-${i}" href="#" onclick="downloadSong('/api/download/song/${data[i].videoId}?artist=${data[i].artists[0].name}&title=${data[i].name}&album=${data[i].album.name}&cover=${cover}', 'progress-bar-${i}')"> Download </a>
                            <a id="streamButton-${i}" href="#" onclick="streamAudio('api/stream/song/${data[i].videoId}', '#streamButton-${i}')">Play Now</a>
                        </div>
                    </div>
                `)
            }
        }
    }
}

// <a href="/api/download/song/${data[i].videoId}?artist=${data[i].artists[0].name}&title=${data[i].name}&album=${data[i].album.name}&cover=${cover}"> Download </a>

Methods.change(() => { // Empty everything
    Content.empty()
    SearchBox.val('')
})


SearchBox.keyup( (event) => {
    if (event.keyCode == 13) {
        Content.empty() // First we clear the content
        if (Methods.val() == 'Album') {
            fetch(`/api/search/album/${SearchBox.val()}`)
                .then(response => response.json())
                .then(data => showInformation(data, 'Album'))
        } else if (Methods.val() == 'Song') {
            fetch(`/api/search/song/${SearchBox.val()}`)
                .then(response => response.json())
                .then(data => showInformation(data, 'Song'))
        }
    }
})
