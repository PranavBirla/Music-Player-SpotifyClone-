

console.log('Lets write some javaScript');

let currrentSong = new Audio();

let Songs;
let currFolder


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Loading..."
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formatedMinutes = String(minutes).padStart(2, '0');
    const formatedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formatedMinutes}:${formatedSeconds}`;
}


async function GetSongs(folder) {
    currFolder = folder
    let a = await fetch(`./${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    let Songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            Songs.push(element.href.split(`/${folder}/`)[1])
        }

    }


    let SongUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    SongUL.innerHTML = ""

    for (const song of Songs) {
        SongUL.innerHTML = SongUL.innerHTML + `<li>
                                                    <img class="music_icon" src="music_icon.svg" alt="">
                                                    <div class="info">
                                                        <div>${decodeURI(song)}</div>
                                                        <div>Pranav</div>
                                                    </div>
                                                    <img class="play_button" src="play_icon.svg" alt="">
                                               </li>`
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    });

    return Songs;
}



const playMusic = (track, pause = false) => {
    currrentSong.src = `/Projects/Project%20Spotify/${currFolder}/` + track;
    if (!pause) {
        currrentSong.play()
        play.src = "pause_icon.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function displayAlbums() {
    let a = await fetch(`./songs/`)
    let cardContainer = document.querySelector(".cardContainer")
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];



        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]

            //get the metadata of the folder

            let a = await fetch(`./songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                                                                    <img class="play_button" src="playbutton_icon.svg" alt="">
                                                                    <img class="card_img" src="./songs/${folder}/cover.jpeg" alt="">
                                                                    <h2>${response.title}</h2>
                                                                    <p>${response.description}</p>
                                                                </div>`
        }


        Array.from(document.getElementsByClassName("card")).forEach((e) => {
            e.addEventListener("click", async item => {
                Songs = await GetSongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(Songs[0])
            })
        })

    }


}


async function main() {
    Songs = await GetSongs("songs/Pranav")
    playMusic(Songs[0], true)
    GetSongs()


    //For displaying all the albums in the page
    displayAlbums()




    play.addEventListener("click", () => {
        if (currrentSong.paused) {
            currrentSong.play()
            play.src = "pause_icon.svg"
        }

        else {
            currrentSong.pause()
            play.src = "play_icon.svg"
        }
    })


    currrentSong.addEventListener("timeupdate", () => {
        // console.log(currrentSong.currentTime, currrentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currrentSong.currentTime)}/${secondsToMinutesSeconds(currrentSong.duration)}`;
        document.querySelector(".circle").style.left = (currrentSong.currentTime) / (currrentSong.duration) * 100 + "%";
    })

    currrentSong.addEventListener("ended", () => {
        let currentTrack = currrentSong.src.split("/").pop() //This will give the file name of the current song
        let index = Songs.indexOf(currentTrack)

        if (index + 1 < Songs.length) {
            playMusic(Songs[index + 1]);
        }

        else {
            playMusic(Songs[0]);
        }

    })


    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currrentSong.currentTime = ((currrentSong.duration) * percent) / 100;
    })


    document.querySelector(".menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })


    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })



    previous.addEventListener("click", () => {

        let currentTrack = currrentSong.src.split("/").pop(); // just the filename
        let index = Songs.indexOf(currentTrack);

        if (index - 1 >= 0) {
            playMusic(Songs[index - 1])
        }

        else if (index - 1 == -1) {
            playMusic(Songs[0])
        }

    })

    next.addEventListener("click", () => {

        let currentTrack = currrentSong.src.split("/").pop(); // just the filename
        let index = Songs.indexOf(currentTrack);

        if (index + 1 < Songs.length) {
            playMusic(Songs[index + 1])
        }

        else {
            playMusic(Songs[length])
        }
    })


    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currrentSong.volume = parseInt(e.target.value) / 100;
        document.querySelector(".volpercent").innerHTML = e.target.value
    })


    //Add eventlistner to mute the track

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volumeon_icon.svg")) {
            e.target.src = e.target.src.replace("volumeon_icon.svg", "volumeoff_icon.svg")
            currrentSong.volume = parseInt(0)
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }

        else {
            e.target.src = e.target.src.replace("volumeoff_icon.svg", "volumeon_icon.svg")
            currrentSong.volume = 0.5
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }
    })


    document.addEventListener("keydown", (e) => {

        if (e.code === "Space") {
            e.preventDefault();

            if (currrentSong.paused) {
                currrentSong.play();
                play.src = "pause_icon.svg"
            }

            else {
                currrentSong.pause();
                play.src = "play_icon.svg";
            }
        }
    })

}


main()