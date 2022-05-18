import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SwatchButton from '../SwatchButton';

function MenuHUD({ onSelectionCallback, hudOptions }) {
  const [selectedSwatch, setSelectedSwatch] = useState(null);

  const handleSelection = (selection) => {
    console.log('handleSelection', selection);
    if (selection.swatchId) setSelectedSwatch(selection.swatchId);
    onSelectionCallback(selection);
  };

  // console.log('selectedSwatch', selectedSwatch);

  return (
    <div className="menu-hud">
      <div className="target-mesh-swatches">
        { hudOptions && (
          hudOptions.map((meshName) => {
            console.log('meshName btn', meshName);
            return (
              <SwatchButton
                swatchId={meshName}
                label={meshName}
                key={meshName}
                selectionCallback={handleSelection}
                selected={selectedSwatch === meshName}
              />
            );
          })
        )}
      </div>
      <div className="color-swatches">
        <SwatchButton color="Tomato" selectionCallback={handleSelection} />
        <SwatchButton color="teal" selectionCallback={handleSelection} />
        <SwatchButton color="gold" selectionCallback={handleSelection} />
        <SwatchButton color="DarkSeaGreen" selectionCallback={handleSelection} />
        <SwatchButton color="DarkSlateGrey" selectionCallback={handleSelection} />
      </div>
    </div>
  );
}

MenuHUD.defaultProps = {
  hudOptions: null,
};

MenuHUD.propTypes = {
  onSelectionCallback: PropTypes.func.isRequired,
  hudOptions: PropTypes.arrayOf(PropTypes.string),
};

export default MenuHUD;
