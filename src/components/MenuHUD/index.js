import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SwatchButton from '../SwatchButton';

function MenuHUD({ onSelectionCallback, hudOptions }) {
  const [selectedSwatch, setSelectedSwatch] = useState(null);
  const [selectedColorOption, setSelectedColorOption] = useState(null);

  const colorOptions = ['Tomato', 'teal', 'gold', 'DarkSeaGreen', 'DarkSlateGrey', 'DarkGoldenRod'];

  const handleSelection = (selection) => {
    console.log('handleSelection', selection);
    if (selection.swatchId) setSelectedSwatch(selection.swatchId);
    if (selection.color) setSelectedColorOption(selection.color);
    onSelectionCallback(selection);
  };

  // console.log('selectedSwatch', selectedSwatch);

  return (
    <div className="menu-hud">
      <div className="target-mesh-swatches">
        { hudOptions && (
          hudOptions.map((meshName) => (
            <SwatchButton
              swatchId={meshName}
              label={meshName}
              key={meshName}
              selectionCallback={handleSelection}
              selected={selectedSwatch === meshName}
            />
          ))
        )}
      </div>
      <div className="color-swatches">
        { colorOptions && (
          colorOptions.map((colorOpt) => (
            <SwatchButton
              key={colorOpt}
              color={colorOpt}
              selectionCallback={handleSelection}
              selected={selectedColorOption === colorOpt}
            />
          ))
        )}
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
