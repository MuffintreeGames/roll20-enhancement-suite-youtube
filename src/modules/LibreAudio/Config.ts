import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "libreAudio",
  name: "Libre Audio",
  description: "Allows creation and playback of tracks via their URL. Removes the 16 listener cap on My Audio Tracks. Refreshing the page is recommended after disabling/enabling this module in order to avoid issues.",
  category: VTTES.Module_Category.freedom,
  gmOnly: false,

  media: {
    "libre_audio.png": "Add by URL button",
  },

  mods: [
    {
      includes: "vtt.bundle.js",

      stencils: [
        {
          search_from: `Unable to play music...Flash blocked`,
          find: [`if(`, 2, `.get("playing")&&`, 2, `.get("softstop")==!1)`],
        },
        {
          search_from: `dismiss_myaudiocap`,
          find: [`\`/audio_library/play/\${campaign_id}/\${`, 1, `.split("-")[0]}\``],
          replace: [
            `((window.r20es && window.r20es.canPlaySound && window.r20es.canPlaySound(`, 2, `)) ? `, 1, ` : `, 0, `)`
          ]
        },
        {
          find: [ `"My Audio"){if(d20.Campaign.players.filter(`,3,`=>`,3,`.get("online")).length>15` ],
          replace: [ `"My Audio"){if(false` ],
        },
      ],
    },
  ]
};
