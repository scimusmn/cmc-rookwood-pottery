import React, { useState, useEffect } from 'react';
import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import PotteryScene from '../../components/PotteryScene';
import MenuHUD from '../../components/MenuHUD';
import KilnSequence from '../../components/KilnSequence';

export const pageQuery = graphql`
  query ($slug: String!) {
    contentfulRookwoodPotteryInteractive(slug: { eq: $slug }) {
      slug
      homeTitle
      modelSelections {
        id
        name
        shortDescription {
          shortDescription
        }
        thumbnail {
          localFile {
            publicURL
            childImageSharp {
              gatsbyImageData(
                width: 300
                height: 300
                layout: FIXED
                placeholder: BLURRED
              )
            }
          }
        }
        modelObj {
          localFile {
            publicURL
          }
        }
        modelMtl {
          localFile {
            publicURL
          }
        }
        modelScale
      }
      kilnOverlay {
        localFile {
          publicURL
        }
      }
    }
  }
`;

const APP_STATE = {
  HOME: 1,
  SELECTION: 2,
  STUDIO: 3,
  KILN: 4,
  RESULTS: 5,
};

function RookwoodPotteryInteractive({ data }) {
  const { contentfulRookwoodPotteryInteractive } = data;
  const { homeTitle, modelSelections, kilnOverlay } = contentfulRookwoodPotteryInteractive;

  console.log('kilnOverlay', kilnOverlay);

  const [appState, setAppState] = useState(APP_STATE.HOME);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedTargetMesh, setSelectedTargetMesh] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedTexture, setSelectedTexture] = useState(null);
  const [hudOptions, setHUDOptions] = useState(null);

  useEffect(() => {
    if (selectedModel) setAppState(APP_STATE.STUDIO);
  }, [selectedModel]);

  useEffect(() => {
    if (
      appState === APP_STATE.HOME
      || appState === APP_STATE.SELECTION
    ) {
      setSelectedModel(null);
    }
  }, [appState]);

  const onHUDSelection = (selection) => {
    // TODO: this shouldn't rely on swatchId
    if (selection.swatchId) setSelectedTargetMesh(selection.swatchId);
    if (selection.color) setSelectedColor(selection.color);
    if (selection.texture) setSelectedTexture(selection.texture);
  };

  return (
    <>
      { appState === APP_STATE.HOME && (
        <div className="home-screen">
          <h1>{homeTitle}</h1>
          {modelSelections.map((selection) => (
            <button key={selection.id} type="button" className="selection-button" onClick={() => setSelectedModel(selection)}>
              <GatsbyImage
                image={getImage(selection.thumbnail.localFile)}
                loading="eager"
                alt={selection.shortDescription.shortDescription}
              />
              <h3>{selection.name}</h3>
              <p>{selection.shortDescription.shortDescription}</p>
            </button>
          ))}
        </div>
      ) }
      { (appState === APP_STATE.STUDIO || appState === APP_STATE.KILN) && (
        <div className="pottery-screen">
          <MenuHUD onSelectionCallback={onHUDSelection} hudOptions={hudOptions} />
          <PotteryScene
            modelPath={selectedModel.modelObj.localFile.publicURL}
            mtlPath={selectedModel.modelMtl.localFile.publicURL}
            scale={selectedModel.modelScale}
            color={selectedColor}
            texture={selectedTexture}
            targetMesh={selectedTargetMesh}
            onMeshTargetsReady={(meshTargets) => setHUDOptions(meshTargets)}
          />
          <button type="button" className="btn home" onClick={() => setAppState(APP_STATE.HOME)}>
            Home
          </button>
          {/* <button type="button" className="btn fire"
          onClick={() => setAppState(APP_STATE.KILN)}> */}
          <button type="button" className="btn fire">
            Fire
          </button>
        </div>
      ) }
      { appState === APP_STATE.KILN && (
        <>
          <button type="button" className="btn home" onClick={() => setAppState(APP_STATE.HOME)}>
            Home
          </button>
          <h1>Here be the kiln!</h1>
          <KilnSequence kilnOverlay={kilnOverlay} />
        </>
      ) }
    </>
  );
}

RookwoodPotteryInteractive.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default RookwoodPotteryInteractive;
