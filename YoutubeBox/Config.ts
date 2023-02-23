import TransformDirname from '../../utils/TransformDirname'

export default <VTTES.Module_Config> {
  filename: TransformDirname(__dirname),
  id: "YoutubeBox",
  name: "Youtube Jukebox",
  description: "Allows using Youtube URLs as playable music.",
  category: VTTES.Module_Category.exportImport,
  gmOnly: true,
};
