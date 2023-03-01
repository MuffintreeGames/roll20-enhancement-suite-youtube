import {DOM} from "../../utils/DOM";
import {DialogBase} from "../../utils/DialogBase";
import {Dialog, DialogBody, DialogFooter, DialogFooterContent, DialogHeader} from "../../utils/DialogComponents";
import {R20} from "../../utils/R20";
import {Optional} from "../../utils/TypescriptUtils";
import {nearly_format_file_url} from "../../utils/MiscUtils";
import {CommonStyle} from "../../utils/CommonStyle";

interface YoutubeBoxCreateRequest {
    url: string;
    title: string;
    volume: number;
    //playlist: Optional<string>;
}

interface ElementTable {
    remove: HTMLInputElement;
    url: HTMLInputElement;
    title: HTMLInputElement;
    volume: HTMLInputElement;
    current_volume: HTMLElement;
    status: HTMLElement;
}

interface InternalRequestData {
    can_auto_resolve_title: boolean,
    is_valid: boolean,
};

class YoutubeBoxSong {
    id: string;
    title: string
    track_id: string;
    volume: number;
    url: string;

    constructor(title, volume, url) {
        this.id = "temp";
        this.title = title;
        this.track_id = "temp";
        this.volume = volume;
        this.url = url;
    }
}

const LOCALSTORAGE_SONG_DATA_KEY = "vttes_userscript_songs";

var youtubeBox_songList;

const check_if_url_is_youtube = (url: string, request_id: number, ok_callback: (request_id: number) => void, err_callback: (request_id: number) => void) => {
    if (!url.startsWith("https://www.youtube.com/watch")) {
        err_callback(request_id);
        return;
    }
    ok_callback(request_id);
    /*const testElement = document.createElement("audio") as any;
    testElement.crossorigin = "anonymous";
    testElement.volume = 0;

    const removeEventListeners = () => {
        testElement.pause();
        testElement.removeEventListener("error", onError);
        testElement.removeEventListener("canplay", onCanPlay);
        testElement.src = "";
    };

    const onError = e => {
        removeEventListeners();
        console.error(e);

        err_callback(request_id);
    };

    const onCanPlay = e => {
        removeEventListeners();

        ok_callback(request_id);
    };

    testElement.addEventListener("error", onError);
    testElement.addEventListener("canplay", onCanPlay);

    testElement.src =  url;
    testElement.play();*/
};

/*async function fetch_youtubeInfo(url) {
	const resp = await fetch(url);

	const jsonResp = await resp.json();
    console.log("youtube response: " + jsonResp);
}*/

export default class YoutubeBoxDialogWidget extends DialogBase<YoutubeBoxCreateRequest[]> {

    public constructor() {
        super(undefined);
    }

    requests: {[id: number]: YoutubeBoxCreateRequest};
    ui_request_elements: {[id: number]: ElementTable};
    internal_request_data: {[id: number]: InternalRequestData};

    id_watermark = 0;
    ui_id_property = "data-request-id";
    ui_button_create: HTMLInputElement;
    //current_playlist: Optional<string> = null;
    //ui_new_playlist_name_input: HTMLInputElement;
    //playlist_id_new_playlist = "__r20es_new";

    public show() {
        let song_data = window.localStorage.getItem(LOCALSTORAGE_SONG_DATA_KEY);

        if (song_data) {
          try {
            console.log("loaded saved songs");
            youtubeBox_songList = JSON.parse(song_data);
          }
          catch(e) {
            console.error("Failed to parse vttes youtube song data", song_data, e);
            youtubeBox_songList = {};
          }
        } else {
          console.log("no saved songs");
            youtubeBox_songList = {};
          }
        this.requests = {};
        this.ui_request_elements = {};
        this.internal_request_data = {};
        //this.current_playlist = "";

        this.add_track_for_user_input();

        this.ui_button_create = (
            <input className="btn-success" type="button" onClick={this.ui_submit_click} value="Create" />
        );

        this.ui_set_submit_enabled_status(true);

        super.internalShow();
    }

    private ui_set_submit_enabled_status = (true_if_enabled: boolean) => {
        if(!this.ui_button_create) {
            return;
        }

        this.ui_button_create.disabled = !true_if_enabled;

        if(true_if_enabled) {
            this.ui_button_create.classList.remove("disabled");
            this.ui_button_create.style.opacity = "1";
        } else {
            this.ui_button_create.classList.add("disabled");
            this.ui_button_create.style.opacity = "0.5";
        }
    };

    private ui_get_corresponding_track_id_by_event = (e) => {
        const target = e.target;
        const id = target.getAttribute(this.ui_id_property);
        console.log(target, this.ui_id_property);

        if(id === undefined) {
            console.error("[YoutubeBox] ui_get_corresponding_track_id_by_event couldn't get id for", target);
            return null;
        }
        return id;
    };

    private ui_on_update_title_input = (e) => {
        const id = this.ui_get_corresponding_track_id_by_event(e);
        {
            const req = this.requests[id];
            req.title = e.target.value;
        }

        console.log(this.requests);
    };

    private ui_disable_ok_button_if_there_is_an_invalid_url_or_enable_it_if_there_are_none = () => {
        let num_checked = 0;

        for (const id in this.internal_request_data) {
            ++num_checked;
            const intern = this.internal_request_data[id];

            if (!intern.is_valid) {
                if(this.ui_button_create) {
                    this.ui_set_submit_enabled_status(false);
                    return;
                }
            }
        }

        if(num_checked === 0) {
            this.ui_set_submit_enabled_status(false);
        }
        else {
            this.ui_set_submit_enabled_status(true);
        }
    };

    private misc_on_url_checker_ok = (request_id: number) => {
        {
            console.log("calling OK function");
            const intern = this.internal_request_data[request_id];
            intern.is_valid = true;
        }
        {
            const elements = this.ui_request_elements[request_id];
            elements.status.innerText = "OK";
            DOM.apply_style(elements.status, CommonStyle.success_span);
        }

        this.ui_disable_ok_button_if_there_is_an_invalid_url_or_enable_it_if_there_are_none ();
    };

    private misc_on_url_checker_err = (request_id: number) => {
        console.log("calling error function");
        {
            const intern = this.internal_request_data[request_id];
            intern.is_valid = false;
        }
        {
            const elements = this.ui_request_elements[request_id];
            elements.status.innerText = "Invalid URL";
            DOM.apply_style(elements.status, CommonStyle.error_span);
        }

        this.ui_disable_ok_button_if_there_is_an_invalid_url_or_enable_it_if_there_are_none ();
    };

    private ui_on_update_url_input = (e) => {
        const id = this.ui_get_corresponding_track_id_by_event(e);
        const req = this.requests[id];
        const elements = this.ui_request_elements[id];

        const url = e.target.value;

        req.url= url;

        elements.status.innerText = "Checking...";
        DOM.apply_style(elements.status, CommonStyle.progress_span);

        check_if_url_is_youtube(url, id, this.misc_on_url_checker_ok, this.misc_on_url_checker_err);

        const intern = this.internal_request_data[id];
        /*if (intern.is_valid) {
            fetch_youtubeInfo(url);
        }*/
    };

    private ui_set_volume_status = (current_volume: HTMLElement, vol: number) => {
        current_volume.innerText = `${vol}%`;
    };

    private ui_on_update_volume_input = (e) => {
        const id = this.ui_get_corresponding_track_id_by_event(e);
        const volume = e.target.value;

        {
            const req = this.requests[id];
            req.volume = volume;
        }

        {
            const elements = this.ui_request_elements[id];
            this.ui_set_volume_status(elements.current_volume, volume);
        }

        console.log(this.requests);
    };

    private ui_on_remove_track = (e) => {
        const id = this.ui_get_corresponding_track_id_by_event(e);

        delete this.requests[id];
        delete this.ui_request_elements[id];
        delete this.internal_request_data[id];

        this.ui_disable_ok_button_if_there_is_an_invalid_url_or_enable_it_if_there_are_none ();
        this.rerender();
    };

    private add_track_for_user_input = () => {
        const id = this.id_watermark++;

        const request = {
            url: "",
            title: "",
            volume: 100,
            //playlist: this.current_playlist,
        };

        this.requests[id] = request;

        this.internal_request_data[id] = {
            can_auto_resolve_title: true,
            is_valid: false,
        };

        {
            const id_prop = {
                [this.ui_id_property]: id
            };

            const style = {
                marginRight: "8px"
            };

            const elements: ElementTable = {
                remove:         <input {...id_prop} style={{...style, width: "16px"}} type="button" value="x" onClick={this.ui_on_remove_track}/>,
                url:            <input style={style} {...id_prop} type="text" value={request.url} onChange={this.ui_on_update_url_input}/>,
                title:          <input style={style} {...id_prop} type="text" value={request.title} onChange={this.ui_on_update_title_input}/>,
                volume:         <input style={{width: "80%"}} {...id_prop} type="range" min="0" max="100" value={request.volume} onChange={this.ui_on_update_volume_input}/>,
                current_volume: <span style={{...style, width: "32px"}}></span>,
                status:         <span style={style}></span>
            };

            DOM.apply_style(elements.remove, CommonStyle.error_span);

            this.ui_request_elements[id] = elements;

            this.ui_set_volume_status(elements.current_volume, request.volume);
        }
    };

    private ui_submit_click = (e) => {
        e.stopPropagation();

        /*if(this.current_playlist === this.playlist_id_new_playlist) {
            const playlist = R20.createPlaylist(this.ui_new_playlist_name_input.value);

            for(const key in this.requests) {
                this.requests[key].playlist = playlist;
            }
        }*/

        const retval = [];
        for(const key in this.requests) {
            retval.push(this.requests[key]);
        }

        this.setData(retval);
        this.close();
    };

    private ui_add_track = (e) => {
        e.stopPropagation();

        this.add_track_for_user_input();
        this.ui_disable_ok_button_if_there_is_an_invalid_url_or_enable_it_if_there_are_none ();

        this.rerender();
    };

    protected render() {
        const padding_style = {
            marginRight: "8px"
        };

        /*const ui_playlist_elements = [
            <option value="">-- None --</option>,
            <option value={this.playlist_id_new_playlist }>-- New--</option>
        ];
        const r20_playlists = R20.getJukeboxPlaylists();
        for(const playlist of r20_playlists) {
            const option = (
                <option value={playlist.id}>{playlist.name}</option>
            );

            ui_playlist_elements.push(option);
        }

        const ui_playlist_select_widget = (
            <select value={this.current_playlist} onChange={this.ui_on_change_playlist}>
                {ui_playlist_elements}
            </select>
        );
*/
        return (
            <Dialog>
                <DialogHeader>
                    <h2>Add Tracks</h2>
                </DialogHeader>

                <DialogBody>

                    <div style={{width: "100%", display: "grid", gridTemplateColumns: "auto 1fr 1fr auto auto auto"}}>
                        <span style={padding_style}/>
                        <span style={padding_style}>URL</span>
                        <span style={padding_style}>Title</span>
                        <span style={padding_style}>Volume</span>
                        <span style={padding_style}/>
                        <span style={padding_style}>Status</span>

                        {this.ui_request_elements}
                    </div>

                </DialogBody>

                <DialogFooter>
                    <DialogFooterContent >
                        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr"}}>

                            <input style={padding_style} type="button" className="btn-danger" onClick={this.close} value="Cancel" />
                            <input style={padding_style} type="button" className="btn-info" value="Add Another Track" onClick={this.ui_add_track}/>
                            {this.ui_button_create}

                        </div>
                    </DialogFooterContent>
                </DialogFooter>
            </Dialog>

        );
    }
}
