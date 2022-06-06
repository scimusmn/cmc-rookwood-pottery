import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SwatchButton from '../SwatchButton';
import COLOR_LOOKUP from '../../data/ColorLookup';

function MenuHUD({ onSelectionCallback, colorOptions, hudOptions }) {
  const [selectedSwatch, setSelectedSwatch] = useState(null);
  const [selectedColorOption, setSelectedColorOption] = useState(null);

  const handleSelection = (selection) => {
    if (selection.swatchId) setSelectedSwatch(selection.swatchId);
    if (selection.color) setSelectedColorOption(selection.color);
    onSelectionCallback(selection);
  };

  return (
    <div className="menu-hud">
      <div className="side-panel right">
        <div className="target-mesh-swatches" style={{ display: 'none' }}>
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
            colorOptions.map((colorKey) => (
              <SwatchButton
                key={colorKey}
                color={COLOR_LOOKUP[colorKey].before}
                label={COLOR_LOOKUP[colorKey].label}
                selectionCallback={handleSelection}
                selected={selectedColorOption === COLOR_LOOKUP[colorKey].before}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

MenuHUD.defaultProps = {
  colorOptions: null,
  hudOptions: null,
};

MenuHUD.propTypes = {
  onSelectionCallback: PropTypes.func.isRequired,
  colorOptions: PropTypes.arrayOf(PropTypes.string),
  hudOptions: PropTypes.arrayOf(PropTypes.string),
};

export default MenuHUD;
