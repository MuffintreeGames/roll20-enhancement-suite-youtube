import {R20Module} from '../../utils/R20Module'
//import {LIBRE_AUDIO_TRACK_KEY} from "./Constants";
import {R20} from "../../utils/R20";
import { DOM, SidebarSeparator, SidebarCategoryTitle } from '../../utils/DOM'
import {findByIdAndRemove} from "../../utils/MiscUtils";
import YoutubeBoxDialogWidget from "./YoutubeBoxDialogWidget";
import { create } from 'underscore';

class YoutubeBoxSong {
    id: number;
    title: string;
    volume: number;
    url: string;

    constructor(id, title, volume, url) {
        this.id = id;
        this.title = title;
        this.volume = volume;
        this.url = "";
        let position = url.search("\\?v=");
        position += 3;
        while (position < url.length && url[position] != "&") {
            this.url += url[position];
            position++;
        }
        console.error("calculated url from " + url + " to be " + this.url);
    }
}

class YoutubeBox extends R20Module.OnAppLoadBase {
    constructor() {
        super(__dirname);
    }

    private youtubeBox_dialog: YoutubeBoxDialogWidget;

    _youtubeBoxWidgetId = "r20es-youtubebox-widget";
    LOCALSTORAGE_SONG_DATA_KEY = "vttes_userscript_songs";
    songList;
    ifrm;
    playingID = "-1";
    playerSideURL = "";

    loadSongList = () => {
        let song_data = window.localStorage.getItem(this.LOCALSTORAGE_SONG_DATA_KEY);

        if (song_data) {
          try {
            this.songList = JSON.parse(song_data);
          }
          catch(e) {
            console.error("Failed to parse vttes youtube song data", song_data, e);
            this.songList = {};
          }
        } else {
          console.error("no saved songs");
            this.songList = {};
          }
    };

    wait1Second = () => {
    return new Promise(resolve => {
        setTimeout(() => {
          resolve('resolved');
        }, 1000);
      });
    };

    checkSong = async() => {
        const jukebox = document.getElementById("jukebox").getElementsByClassName("content")[0];
        while (true) {
            await this.wait1Second();
            var currentSong = R20.getCurrentPage().attributes.currentlyPlayingSong;
            if (currentSong == this.playerSideURL) {
            } else {

            if (this.playerSideURL != "") {
                const tubeFrame = document.getElementById("youtubeFrame");
                if (tubeFrame) {
                tubeFrame.remove();
                }
            } 

            if (currentSong != "") {
            this.ifrm = document.createElement("IFRAME");
            this.ifrm.setAttribute("src",currentSong);
            this.ifrm.setAttribute("id","youtubeFrame");
            this.ifrm.style.width="500px";
            this.ifrm.style.height="200px";
           jukebox.appendChild(this.ifrm);
            }

            this.playerSideURL = currentSong;
        }
    }
    };

    uiInsertYoutubeBoxWidget = () => {
        if (!window.is_gm) {
            this.checkSong();
            return;
        }

        const jukebox = document.getElementById("jukebox").getElementsByClassName("content")[0];
        if(!jukebox) {
            console.error(" uiInsertYoutubeBoxWidget failed to find jukebox");
            return;
        }

        var widget = <div id = {this._youtubeBoxWidgetId}>
            <SidebarSeparator />
            <div>
                <SidebarCategoryTitle>
                 YoutubeBox <button id={this._youtubeBoxWidgetId} className="btn" onClick={this.uiOnClickOpenYoutubeBox}>Add Songs</button>
                </SidebarCategoryTitle>
            </div>
            <div>
                <b><h3>Song List</h3></b>
                <div id = 'songStorage'>

                </div>
            </div>
            <SidebarSeparator big="1px" />
        </div>
       jukebox.appendChild(widget);
       this.loadSongList();
       this.createSongStorage();
    };

    createSongStorage = () => {
        this.loadSongList();
        const songStorage = document.getElementById("songStorage");
        if (!songStorage) {
            return;
        }

        for (let songID in this.songList) {
            const song = this.songList[songID];
            const songTitle = <b>{song.title}</b>
            var playButtonText = "Play";
            if (this.playingID == songID) {
                playButtonText = "Stop";
            }
            songStorage.appendChild(songTitle);
            const songWidget = <div id = {song.id} style = "display:table; ">
            <button id={"youtubePlay"} className="btn" style="float: none; display:table-cell; margin:5px; vertical-align: middle;" onClick={() => this.onClickPlay(songID)}>{playButtonText}</button> <button id={"youtubeDelete"} className="btn" style="float: none; display:table-cell; margin:5px; vertical-align: middle;" onClick={() => this.onClickDelete(songID)}>Delete</button> <br></br> <br></br>
         </div>
         songStorage.appendChild(songWidget);
        }
    };

    onClickDelete = (songID) => {
        console.error("deleting " + songID);
        delete this.songList[songID];
        this.save_youtubeSongList();
        this.clearSongStorage();
        this.createSongStorage();
    };

    onClickPlay = (songID) => {
        const page = R20.getCurrentPage();
        const youtubeid = this.songList[songID].url;
        const songStorage = document.getElementById("songStorage");
        var youtubeFrame = document.getElementById("youtubeFrame");
        if (youtubeFrame){
            songStorage.parentNode.removeChild(youtubeFrame);
        }
        if (this.playingID == songID) {
            this.playingID = "-1";
            this.clearSongStorage();
            this.createSongStorage();
            page.save({
                currentlyPlayingSong: "",
            })
            return;
        }
        var url = "https://www.youtube.com/embed/"+youtubeid+"?autoplay=1&loop=1&playlist="+youtubeid;
        this.ifrm = document.createElement("IFRAME");
        this.ifrm.setAttribute("src",url);
        this.ifrm.setAttribute("id","youtubeFrame");
        this.ifrm.style.width="500px";
        this.ifrm.style.height="200px";
        songStorage.parentNode.insertBefore(this.ifrm, songStorage);
        this.playingID = songID;
        page.save({
            currentlyPlayingSong: url,
        })
        this.clearSongStorage();
        this.createSongStorage();
    };

    clearSongStorage = () => {
        document.getElementById("songStorage").innerHTML = "";
    };

    uiRemoveYoutubeBoxWidget = () => {
        findByIdAndRemove(this._youtubeBoxWidgetId);
    };

    uiOnClickOpenYoutubeBox = () => {
        this.youtubeBox_dialog.show();
    };

    save_youtubeSongList = () => {    
        const str = JSON.stringify(this.songList, null, 0);
        window.localStorage.setItem(this.LOCALSTORAGE_SONG_DATA_KEY, str);
    };

    ui_on_youtubeBox_dialog_close = (e) => {
        const data = this.youtubeBox_dialog.getData();
        if (!data) {
            return;
        }
        this.loadSongList();
        for(const track_data of data) {
            var new_id = -1; 
            for (var x = 0; x < 1000; x++) {
                if (!(x in this.songList)) {
                    new_id = x;
                    x = 1000;
                }
            }
            if (new_id === -1) {
                console.error("failed to create new id for song!");
                return;
            } 
            const created_track = new YoutubeBoxSong(new_id, track_data.title, track_data.volume, track_data.url);
            this.songList[created_track.id] = created_track;
        }
        this.save_youtubeSongList();
        this.clearSongStorage();
        this.createSongStorage();
    };

    public earlySetup = () => {
        window.r20es["canPlaySound"] = this.canPlaySound;
    };

    public setup = () => {
        //window.Jukebox.playlist.backboneFirebase.reference.on("child_added", this.databaseOnAddJukeboxTrack);

        {
            this.youtubeBox_dialog = new YoutubeBoxDialogWidget();
            this.youtubeBox_dialog .getRoot().addEventListener("close", this.ui_on_youtubeBox_dialog_close);
        }

        this.uiInsertYoutubeBoxWidget();
    };

    public dispose = () => {

        if(this.youtubeBox_dialog) {
            this.youtubeBox_dialog.dispose()
        }

        {
            window.r20es["canPlaySound"] = undefined;
        }

        this.uiRemoveYoutubeBoxWidget();
    }
}

export default () => {
  new YoutubeBox().install();
};

