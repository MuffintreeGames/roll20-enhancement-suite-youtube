declare enum InitiativeOrdering {
    NumericAscending = 0,
    NumericDescending = 1,
    Alphabetical = 2,
    AlphabeticalDescending = 3,
    Card = 4,
}

declare enum CanvasLayer {
    Map = "map",
    PlayerTokens = "objects",
    GMTokens = "gmlayer",
    Lighting = "walls",
}

declare namespace Roll20 {


    export function generateUUID(): string;

    export class SyncObject<TAttribs> {
        save: (data: any) => TAttribs;
        get: <T>(attrib: string) => T;

        id: string;
        cid: string;
        attributes: TAttribs;
    }

    export class RollableTableAttributes {

    }

    export class RollableTable extends SyncObject<RollableTableAttributes> {
        // todo
    }

    export class PlayerAttributes {

    }

    export class MacroAttributes {
        action: string;
        id: string;
        istokenaction: boolean;
        name: string;
        visibleto: string;
    }

    export class Macro extends SyncObject<MacroAttributes> {

    }

    export class Player extends SyncObject<PlayerAttributes> {
        marcos: ObjectStorage<Macro>
    }

    export class HandoutAttributes {
        archived: boolean;
        avatar: string;
        controlledby: string;
        gmnotes: number;
        id: string;
        inplayerjournals: string;
        name: string;
        notes: number;
        tags: string;
    }

    export class Handout extends SyncObject<HandoutAttributes> {
        collection: ObjectStorage<Handout>;
    }

    export class CharacterAttributes {

    }

    export class Character extends SyncObject<CharacterAttributes> {
        // todo
    }

    export class CampaignAttributes {
        turnorder: string;
        playerpageid: string;
    }

    export class Campaign extends SyncObject<CampaignAttributes> {
        handouts: ObjectStorage<Handout>;
        characters: ObjectStorage<Character>;
        rollabletables: ObjectStorage<RollableTable>;
        initiativewindow: InitiativeTracker;

        activePage: () => Page;
    }

    export class CanvasObject extends SyncObject<CanvasObject> {
        model?: Character;
        top: number;
        left: number;
    }

    export class InitiativeData {
        _pageid: string;
        custom: string;
        id: string;
        pr: number; // initiative score
        formula?: string;
    }

    export class InitiativeTracker {
        nextTurn: () => void;
        addTokenToList: (uuid: string, name?: string, formula?: string) => void;
        cleanList: () => InitiativeData[];
        model: Campaign;
    }

    export class Chat {
        doChatInput: (message: string, callbackUUID?: string) => void;
    }

    export class RollCallbackData {
        // todo
    }

    export class PingData {
        left: number;
        top: number;
        radius: number;
        player: string; // id
        pageid: string;
        currentLayer: CanvasLayer;
    }

    export class LocalPingData {
        downx: number; // left
        downy: number; // top
    }

    export class Engine {
        selected: () => CanvasObject[];
        unselect: () => void;
        select: (obj: CanvasObject) => void;
        renderAll: () => void;
        renderTop: () => void;

        pings: { [uuid: string]: PingData };
        pinging: LocalPingData;

        mode: string; // current tool name todo
        canvas: Canvas;
        canvasZoom: number;
        canvasHeight: number;
        canvasWidth: number;
    }

    export class TokenEditor {
        removeRadialMenu: () => void;
        closeContextMenu: () => void;
    }

    export class PageAttributes {

    }

    export class Page extends SyncObject<PageAttributes> {

    }

    export class Canvas {
        getObjects: () => CanvasObject[];
        containsPoint: (e: MouseEvent, obj: CanvasObject) => boolean;
    }

    export class D20 {
        Campaign: Campaign;
        engine: Engine;
        token_editor: TokenEditor;
        textchat: Chat;
    }

    export class ObjectStorage<T> {
        length: number;
        models: T[];
        get: (uuid: string) => T;
        getByCid: (cid: string) => T;
        create: (initialState: T) => T;
    }

    export class R20ES {
        tokenDrawBg: (ctx: CanvasRenderingContext2D, graphic: CanvasObject) => void;
        setModePrologue: (mode: string) => void;
    }
}


interface Window {
    Campaign: Roll20.Campaign;
    d20: Roll20.D20;
    currentPlayer: Roll20.Player;
    is_gm: boolean;
    currentEditingLayer: CanvasLayer;
    generateUUID: () => string;
    r20es: Roll20.R20ES;
}

declare module 'roll20' {
    export = Roll20;
}

