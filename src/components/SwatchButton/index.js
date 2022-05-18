import React from 'react';
import PropTypes from 'prop-types';

function SwatchButton({
  swatchId, label, color, selected, selectionCallback,
}) {
  function handleSelection() {
    const selectionData = {};
    if (swatchId) selectionData.swatchId = swatchId;
    if (color) selectionData.color = color;
    if (label) selectionData.label = label;
    selectionCallback(selectionData);
  }

  return (
    <button
      className="swatch-button"
      style={{
        backgroundColor: color || 'white',
        border: `1px solid ${color || 'gray'}`,
        outline: selected ? '5px dashed yellow' : 'none',
      }}
      onClick={() => handleSelection()}
      type="button"
    >
      {label}
    </button>
  );
}

SwatchButton.defaultProps = {
  swatchId: null,
  label: null,
  color: null,
  selected: false,
};

SwatchButton.propTypes = {
  swatchId: PropTypes.string,
  label: PropTypes.string,
  color: PropTypes.string,
  selected: PropTypes.bool,
  selectionCallback: PropTypes.func.isRequired,
};

export default SwatchButton;
