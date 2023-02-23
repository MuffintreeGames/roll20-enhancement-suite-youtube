import {R20Module} from '../../utils/R20Module'
//import {LIBRE_AUDIO_TRACK_KEY} from "./Constants";
import {R20} from "../../utils/R20";
import {DOM} from "../../utils/DOM";
import {findByIdAndRemove} from "../../utils/MiscUtils";
import YoutubeBoxDialogWidget from "./YoutubeBoxDialogWidget";

class YoutubeBox extends R20Module.OnAppLoadBase {
    constructor() {
        super(__dirname);
    }

    private youtubeBox_dialog: YoutubeBoxDialogWidget;

    _youtubeBoxWidgetId = "r20es-libre-audio-add-track-widget";

    uiInsertYoutubeBoxWidget = () => {
        const before_root = document.getElementById("addjukebox");
        if(!before_root) {
            console.error(" uiInsertYoutubeBoxWidget failed to find widget before_root (id: addjukebox)");
            return;
        }

        const widget = (
            <button id={this._youtubeBoxWidgetId} className="btn" onClick={this.uiOnClickOpenYoutubeBox}>YoutubeBox</button>
        );

        before_root.parentNode.insertBefore(widget, before_root);
    };

    uiRemoveYoutubeBoxWidget = () => {
        findByIdAndRemove(this._youtubeBoxWidgetId);
    };

    uiOnClickOpenYoutubeBox = () => {
        this.youtubeBox_dialog.show();
    };

    canPlaySound = (audio: Roll20.JukeboxSong) => {
        console.log("querying", audio);

        /*if(audio.attributes[LIBRE_AUDIO_TRACK_KEY]) {
            return true;
        }*/
        return false;
    };

    /*
    playSound= (audio: Roll20.JukeboxSong) => {
        console.log("playing", audio);
        const url = audio.attributes.track_id;
        R20.playAudio(url, url);
    };
    */

    ui_on_youtubeBox_dialog_close = (e) => {
        const data = this.youtubeBox_dialog.getData();
        if (!data) {
            return;
        }

        /*for(const track_data of data) {
            const created_track = R20.createSong({
                loop: false,
                playing: false,
                softstop: false,

                source: "My Audio",
                [LIBRE_AUDIO_TRACK_KEY]: true,

                title: track_data.title,
                track_id: track_data.url,
                volume: track_data.volume
            });

            R20.addTrackToPlaylist(created_track.id, track_data.playlist);
        }*/
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

