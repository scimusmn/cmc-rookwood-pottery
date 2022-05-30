import React, { useState, useEffect } from 'react';
import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { Modal, Button } from 'react-bootstrap';
import PotteryScene from '../../components/PotteryScene';
import MenuHUD from '../../components/MenuHUD';
import KilnSequence from '../../components/KilnSequence';
import Video from '../../components/Video';
import FadeShow from '../../components/FadeShow';
import COLOR_LOOKUP from '../../data/ColorLookup';

export const pageQuery = graphql`
  query ($slug: String!) {
    contentfulRookwoodPotteryInteractive(slug: {eq: $slug}, homeSubhead: {}) {
      slug
      homeTitle
      homeSubhead {
        homeSubhead
      }
      homeBgVideo {
        localFile {
          publicURL
        }
      }
      selectionPrompt {
        selectionPrompt
      }
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
              gatsbyImageData(width: 300, height: 300, layout: FIXED, placeholder: BLURRED)
            }
          }
        }
        modelBefore {
          localFile {
            publicURL
          }
        }
        modelAfter {
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
      firingFactoids
      resultsTitle
      resultsSubhead
    }
  }
`;

const APP_STATE = {
  ATTRACT: 1,
  SELECTION_GALLERY: 2,
  SELECTION: 3,
  STUDIO: 4,
  KILN: 5,
  RESULTS: 6,
};

const COLOR_OPTIONS = Object.keys(COLOR_LOOKUP).map((key) => COLOR_LOOKUP[key].before);

function RookwoodPotteryInteractive({ data }) {
  const { contentfulRookwoodPotteryInteractive } = data;
  const {
    homeTitle,
    homeSubhead,
    homeBgVideo,
    modelSelections,
    kilnOverlay,
    selectionPrompt,
    firingFactoids,
    resultsTitle,
    resultsSubhead,
  } = contentfulRookwoodPotteryInteractive;

  const [appState, setAppState] = useState(APP_STATE.ATTRACT);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedTargetMesh, setSelectedTargetMesh] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [hudOptions, setHUDOptions] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(true);
  const [showReadyModal, setShowReadyModal] = useState(false);

  useEffect(() => {
    if (selectedModel) setAppState(APP_STATE.SELECTION);
  }, [selectedModel]);

  useEffect(() => {
    if (
      appState === APP_STATE.ATTRACT
      || appState === APP_STATE.SELECTION_GALLERY
    ) {
      setSelectedModel(null);
    }
  }, [appState]);

  const onHUDSelection = (selection) => {
    // TODO: this shouldn't rely on swatchId
    if (selection.swatchId) setSelectedTargetMesh(selection.swatchId);
    if (selection.color) setSelectedColor(selection.color);
  };

  return (
    <>
      { appState === APP_STATE.ATTRACT && (
        <div className="attract-screen">
          <div className="side-panel left">
            <h1>{homeTitle}</h1>
            <p>{homeSubhead.homeSubhead}</p>
            <button type="button" className="btn begin" onClick={() => setAppState(APP_STATE.SELECTION_GALLERY)}> BEGIN </button>
          </div>
          <Video src={homeBgVideo.localFile.publicURL} active={false} />
        </div>
      ) }
      { appState === APP_STATE.SELECTION_GALLERY && (
        <div className="selection-gallery-screen">
          <div className="side-panel left">
            <p>{selectionPrompt.selectionPrompt}</p>
          </div>
          <div className="selections-container">
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
        </div>
      ) }
      { appState === APP_STATE.SELECTION && (
        <div className="selection-screen">
          <button type="button" className="btn back" onClick={() => setAppState(APP_STATE.SELECTION_GALLERY)}>
            BACK
          </button>
          <GatsbyImage
            image={getImage(selectedModel.thumbnail.localFile)}
            loading="eager"
            alt={selectedModel.shortDescription.shortDescription}
          />
          <h2>{selectedModel.name}</h2>
          <p>{selectedModel.shortDescription.shortDescription}</p>
          <button type="button" className="btn select" onClick={() => setAppState(APP_STATE.STUDIO)}>
            SELECT
          </button>
        </div>
      ) }
      { appState === APP_STATE.STUDIO && (
        <div className="hud-screen">
          <MenuHUD
            onSelectionCallback={onHUDSelection}
            colorOptions={COLOR_OPTIONS}
            hudOptions={hudOptions}
          />
          <button
            type="button"
            className="btn fire"
            onClick={() => setShowReadyModal(true)}
          >
            Fire
          </button>
        </div>
      ) }
      { (appState === APP_STATE.STUDIO || appState === APP_STATE.FIRING) && (
        <div className="pottery-screen">
          <PotteryScene
            modelPathBefore={selectedModel.modelBefore.localFile.publicURL}
            modelPathAfter={selectedModel.modelAfter.localFile.publicURL}
            scale={selectedModel.modelScale}
            color={selectedColor}
            targetMesh={selectedTargetMesh}
            onMeshTargetsReady={(meshTargets) => setHUDOptions(meshTargets)}
            showFired={(appState === APP_STATE.FIRING)}
          />
          <button type="button" className="btn home" onClick={() => setAppState(APP_STATE.ATTRACT)}>
            Home
          </button>
          <Modal
            key="loading"
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={showLoadingModal}
          >
            <Modal.Header>
              <Modal.Title id="contained-modal-title-vcenter">
                ALMOST READY
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h4>ALMOST READY</h4>
              <p>
                Another artist. . skdfj f.akdsj f.ajk asdf.a aj.sd faj sd,.faj.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setShowLoadingModal(false)}>LET&apos;S GO</Button>
            </Modal.Footer>
          </Modal>
          <Modal
            key="areyouready"
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={showReadyModal}
          >
            <Modal.Header>
              <Modal.Title id="contained-modal-title-vcenter">
                ARE YOU READY
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h4>ARE YOU READY</h4>
              <p>
                Another artist. . skdfj f.akdsj f.ajk asdf.a aj.sd faj sd,.faj.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setShowReadyModal(false)}>NO</Button>
              <Button
                onClick={() => { setShowReadyModal(false); setAppState(APP_STATE.FIRING); }}
              >
                YES
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      ) }
      { appState === APP_STATE.FIRING && (
        <div className="firing-screen">
          <button type="button" className="btn continue" onClick={() => setAppState(APP_STATE.RESULTS)}>
            CONTINUE
          </button>
          <div className="factoids-bar">
            <h2>DID YOU KNOW?</h2>
            <FadeShow elements={firingFactoids} delay={4000} />
          </div>
          <KilnSequence kilnOverlay={kilnOverlay} />
        </div>
      ) }
      { appState === APP_STATE.RESULTS && (
        <div className="results-screen">
          <button type="button" className="btn home" onClick={() => setAppState(APP_STATE.ATTRACT)}>
            Start over
          </button>
          <h1>{resultsTitle}</h1>
          <p>{resultsSubhead}</p>
        </div>
      ) }
    </>
  );
}

RookwoodPotteryInteractive.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default RookwoodPotteryInteractive;
