const COLOR_LOOKUP = {
  Acanthus: { label: 'Acanthus', before: '#e3e4de', after: '#658d85' },
  Aegean: { label: 'Aegean', before: '#e7e3e0', after: '#011f5d' },
  Barbary_Coast: { label: 'Barbary Coast', before: '#d6d6d6', after: '#616662' },
  Blue_green: { label: 'Blue Green', before: '#eee0d5', after: '#414431' },
  Brown_green: { label: 'Brown Green', before: '#ecd9ae', after: '#756c43' },
  Brunneous_brown: { label: 'Brunneous Brown', before: '#d28774', after: '#362d2e' },
  Devon: { label: 'Devon', before: '#ecd8ae', after: '#706843' },
  Griege: { label: 'Griege', before: '#ebe0da', after: '#937865' },
  Ivy: { label: 'Ivy', before: '#ece4d9', after: '#aab17b' },
  Kahuto: { label: 'Kahuto', before: '#c9d0c0', after: '#34592d' },
  Light_brown_Pinecone_vase: { label: 'Brown', before: '#ada8a4', after: '#140c0a' },
  Light_brown_Tree_of_Life: { label: 'Light Brown', before: '#d28573', after: '#675b4f' },
  Night_Tide: { label: 'Night Tide', before: '#b9c8cf', after: '#2e4d62' },
  Off_white: { label: 'Off-white', before: '#ede6e0', after: '#e2d6ca' },
  Sargasso_Surf: { label: 'Sargasso Surf', before: '#d3d3d3', after: '#4a7588' },
  Serenade: { label: 'Serenade', before: '#eee7e1', after: '#b2bbc2' },
  Spark: { label: 'Spark', before: '#ebe6e2', after: '#fcf0e4' },
  Tuscan_Gold: { label: 'Tuscan Gold', before: '#c18a75', after: '#8c6433' },
  White: { label: 'White', before: '#ece5df', after: '#eae6e3' },
  Woodland_green: { label: 'Woodland Green', before: '#e0e5de', after: '#727b66' },
};

const OBJECT_PALETTES = {
  PINECONE_VASE: [
    'Blue_green',
    'Brown_green',
    'Brunneous_brown',
    'Light_brown_Pinecone_vase',
    'Off_white',
    'Acanthus',
    'Spark',
    'Night_Tide',
    'Barbary_Coast',
    'Woodland_green',
    'White',
    'Ivy',
  ],
  TREE_OF_LIFE_TILE: [
    'Acanthus',
    'Griege',
    'Ivy',
    'Kahuto',
    'Light_brown_Tree_of_Life',
    'Sargasso_Surf',
    'Aegean',
    'Blue_green',
    'Night_Tide',
    'Serenade',
    'Brunneous_brown',
    'Off_white',
  ],
  ASHBEE_FLORA_TILE: [
    'Aegean',
    'Night_Tide',
    'Serenade',
    'Brown_green',
    'Light_brown_Tree_of_Life',
    'Woodland_green',
    'Kahuto',
    'Tuscan_Gold',
    'Acanthus',
    'Blue_green',
    'Ivy',
    'Sargasso_Surf',
  ],
  HERITAGE_MUG: [
    'Barbary_Coast',
    'Brown_green',
    'Night_Tide',
    'Sargasso_Surf',
    'Serenade',
    'Kahuto',
    'Light_brown_Pinecone_vase',
    'Light_brown_Tree_of_Life',
    'Brunneous_brown',
    'Blue_green',
    'Off_white',
    'Griege',
  ],
  PANEL_VASE_1926: [
    'Tuscan_Gold',
    'White',
    'Brown_green',
    'Light_brown_Pinecone_vase',
    'Light_brown_Tree_of_Life',
    'Griege',
    'Blue_green',
    'Woodland_green',
    'Serenade',
    'Ivy',
    'Spark',
    'Brunneous_brown',
  ],
  EMILIA_VASE: [
    'Spark',
    'Woodland_green',
    'Barbary_Coast',
    'Acanthus',
    'Aegean',
    'Griege',
    'Kahuto',
    'Ivy',
    'Serenade',
    'Tuscan_Gold',
    'Sargasso_Surf',
    'Light_brown_Pinecone_vase',
  ],
};

const PRE_GLAZE_DEFAULT_COLOR = { label: 'Default_Base', before: '#fff', after: '#fff' };

// Unique color id for eraser exception
const ERASER_COLOR_ID = 'eraser';

function getColorPalette(objectName) {
  let lookupName = objectName.toUpperCase().replace(/ /g, '_');
  // Exception: keys cannot begin with a number
  if (lookupName === '1926_LEGACY_PANEL_VASE') lookupName = 'PANEL_VASE_1926';
  if (OBJECT_PALETTES[lookupName]) {
    return (OBJECT_PALETTES[lookupName]);
  }
  console.log('[WARNING!] No color palette found for:', objectName, lookupName);
  return Object.keys(COLOR_LOOKUP);
}

export default COLOR_LOOKUP;
export {
  OBJECT_PALETTES,
  PRE_GLAZE_DEFAULT_COLOR,
  ERASER_COLOR_ID,
  getColorPalette,
};
