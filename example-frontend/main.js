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

let downloadStuff = (link, id) => {
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

let showInformation = async(data, handler) => {
    if (handler == 'Album') {
        for (let i = 0; i < data.length; i++) { // Start progress bar
            if (data[i].artists.length == 0) { // If there are no artists in the album
                Content.append(` 
                    <div class="itemContainer" style="display:flex; margin: 16px;">
                        <img src="${data[i].thumbnails[0].url}" alt="${data[i].name} album cover...">
                        <div style="flex-direction:column;">
                            <p style="padding-bottom: 10px;"> Various Artists - ${data[i].name} (${data[i].year}) </p>
                            <a id="progress-bar-${i}" href="#" onclick="downloadStuff('/api/download/album/${data[i].playlistId}?artist=Various Artists&album=${data[i].name}&year=${data[i].year}&cover=${data[i].thumbnails[3].url}', 'progress-bar-${i}')"> Download </a>
                        </div>
                    </div>
                `)
            } else {
                Content.append(`
                    <div class="itemContainer" style="display:flex; margin: 16px;">
                        <img src="${data[i].thumbnails[0].url}" alt="${data[i].name} album cover...">
                        <div style="flex-direction:column;">
                            <p style="padding-bottom: 10px;"> ${data[i].artists[0].name} - ${data[i].name} (${data[i].year}) </p>
                            <a id="progress-bar-${i}" href="#" onclick="downloadStuff('/api/download/album/${data[i].playlistId}?artist=${data[i].artists[0].name}&album=${data[i].name}&year=${data[i].year}&cover=${data[i].thumbnails[3].url}', 'progress-bar-${i}')"> Download </a>
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
                            <a id="progress-bar-${i}" href="#" onclick="downloadStuff('/api/download/song/${data[i].videoId}?artist=Various Artists&title=${data[i].name}&album=${data[i].album.name}&cover=${cover}', 'progress-bar-${i}')"> Download </a>
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
                            <a id="progress-bar-${i}" href="#" onclick="downloadStuff('/api/download/song/${data[i].videoId}?artist=${data[i].artists[0].name}&title=${data[i].name}&album=${data[i].album.name}&cover=${cover}', 'progress-bar-${i}')"> Download </a>
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
