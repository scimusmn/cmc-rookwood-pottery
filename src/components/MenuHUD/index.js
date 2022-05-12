import React from 'react';
import PropTypes from 'prop-types';

function MenuHUD({ onSelectionCallback }) {
  function handleSelection(selection) {
    onSelectionCallback(selection);
  }

  return (
    <div className="menu-hud">
      <h3>Color</h3>
      <button onClick={() => handleSelection({ color: { r: 1, g: 1, b: 1 } })} type="button">Default</button>
      <button onClick={() => handleSelection({ color: { r: 1, g: 0, b: 0 } })} type="button">Red</button>
      <button onClick={() => handleSelection({ color: { r: 0, g: 1, b: 0 } })} type="button">Green</button>
      <button onClick={() => handleSelection({ color: { r: 0, g: 0, b: 1 } })} type="button">Blue</button>
      <button onClick={() => handleSelection({ color: 'spin' })} type="button">Spin</button>
      <br />
      <h3>Texture</h3>
      <button onClick={() => handleSelection({ texture: 1 })} type="button">Texture 1</button>
      <button onClick={() => handleSelection({ texture: 2 })} type="button">Texture 2</button>
      <button onClick={() => handleSelection({ texture: 3 })} type="button">Texture 3</button>
      <button onClick={() => handleSelection({ texture: 4 })} type="button">Texture 4 (rgb)</button>
      <button onClick={() => handleSelection({ texture: 5 })} type="button">Texture 5 (skull)</button>
    </div>
  );
}

MenuHUD.propTypes = {
  onSelectionCallback: PropTypes.func.isRequired,
};

export default MenuHUD;
