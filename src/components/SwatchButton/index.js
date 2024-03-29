/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
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
    <div className="swatch-container">
      <button
        className={`swatch-button ${color === 'eraser' ? 'eraser' : ''}`}
        style={{
          backgroundColor: color || 'white',
          boxShadow: selected ? '0px 0px 16px rgba(54, 64, 21, 0.5)' : 'none',
          borderWidth: selected ? '4px' : '1.5px',
        }}
        onClick={() => handleSelection()}
        onPointerDown={() => handleSelection()}
        type="button"
      />
      <br />
      <span
        onClick={() => handleSelection()}
        onPointerDown={() => handleSelection()}
        style={{
          fontFamily: selected ? 'Merriweather-bold' : 'Merriweather',
        }}
      >
        {label}
      </span>
    </div>
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
