console.log('Lets write some javaScript');

let currrentSong = new Audio();
let Songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "Loading...";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function GetSongs(folder) {
    currFolder = folder;

    // Fetch songs.json instead of parsing folder
    let res = await fetch(`./${folder}/songs.json`);
    let songsData = await res.json();

    Songs = songsData.map(song => song.path); // Extract file paths

    let SongUL = document.querySelector(".songlist ul");
    SongUL.innerHTML = "";

    songsData.forEach(song => {
        SongUL.innerHTML += `
        <li>
            <img class="music_icon" src="music_icon.svg" alt="">
            <div class="info">
                <div>${decodeURI(song.title)}</div>
                <div>${song.artist}</div>
            </div>
            <img class="play_button" src="play_icon.svg" alt="">
        </li>`;
    });

    Array.from(document.querySelector(".songlist li")).forEach((e, index) => {
        e.addEventListener("click", () => playMusic(Songs[index]));
    });

    return Songs;
}

const playMusic = (track, pause = false) => {
    currrentSong.src = track; // Direct path from JSON
    if (!pause) {
        currrentSong.play();
        play.src = "pause_icon.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track.split('/').pop());
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`./songs/`);
    let cardContainer = document.querySelector(".cardContainer");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`./songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <img class="play_button" src="playbutton_icon.svg" alt="">
                <img class="card_img" src="./songs/${folder}/cover.jpeg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            Songs = await GetSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(Songs[0]);
        });
    });
}

async function main() {
    Songs = await GetSongs("songs/Pranav");
    playMusic(Songs[0], true);
    displayAlbums();

    play.addEventListener("click", () => {
        if (currrentSong.paused) {
            currrentSong.play();
            play.src = "pause_icon.svg";
        } else {
            currrentSong.pause();
            play.src = "play_icon.svg";
        }
    });

    currrentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currrentSong.currentTime)}/${secondsToMinutesSeconds(currrentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currrentSong.currentTime / currrentSong.duration) * 100 + "%";
    });

    currrentSong.addEventListener("ended", () => {
        let currentTrack = currrentSong.src;
        let index = Songs.indexOf(currentTrack);
        playMusic(Songs[(index + 1) % Songs.length]);
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currrentSong.currentTime = (currrentSong.duration * percent) / 100;
    });

    document.querySelector(".menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = Songs.indexOf(currrentSong.src);
        playMusic(index > 0 ? Songs[index - 1] : Songs[0]);
    });

    next.addEventListener("click", () => {
        let index = Songs.indexOf(currrentSong.src);
        playMusic(Songs[(index + 1) % Songs.length]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currrentSong.volume = parseInt(e.target.value) / 100;
        document.querySelector(".volpercent").innerHTML = e.target.value;
    });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volumeon_icon.svg")) {
            e.target.src = e.target.src.replace("volumeon_icon.svg", "volumeoff_icon.svg");
            currrentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("volumeoff_icon.svg", "volumeon_icon.svg");
            currrentSong.volume = 0.5;
            document.querySelector(".range input").value = 50;
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            if (currrentSong.paused) {
                currrentSong.play();
                play.src = "pause_icon.svg";
            } else {
                currrentSong.pause();
                play.src = "play_icon.svg";
            }
        }
    });
}

main();
