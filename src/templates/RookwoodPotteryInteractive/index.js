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
import { getColorPalette } from '../../data/ColorLookup';

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
        historicalTag
        shortDescription {
          shortDescription
        }
        loadingPreamble {
          loadingPreamble
        }
        thumbnail {
          localFile {
            publicURL
            childImageSharp {
              gatsbyImageData(width: 350, height: 350, layout: FIXED, placeholder: BLURRED)
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
      studioBgImage {
        localFile {
          publicURL
          childImageSharp {
            gatsbyImageData(width: 1920, height: 1080, layout: FIXED, placeholder: BLURRED)
          }
        }
      }
      turntableModel {
        localFile {
          publicURL
        }
      }
      firingBgVideo {
        localFile {
          publicURL
        }
      }
      firingFactoids
      resultsTitle
      resultsSubhead
      resultsBgImage {
        localFile {
          publicURL
          childImageSharp {
            gatsbyImageData(width: 1920, height: 1080, layout: FIXED, placeholder: BLURRED)
          }
        }
      }
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

function RookwoodPotteryInteractive({ data }) {
  const { contentfulRookwoodPotteryInteractive } = data;
  const {
    homeTitle,
    homeSubhead,
    homeBgVideo,
    modelSelections,
    selectionPrompt,
    studioBgImage,
    turntableModel,
    firingFactoids,
    firingBgVideo,
    resultsTitle,
    resultsSubhead,
    resultsBgImage,
  } = contentfulRookwoodPotteryInteractive;

  const [appState, setAppState] = useState(APP_STATE.ATTRACT);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedTargetMesh, setSelectedTargetMesh] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [hudOptions, setHUDOptions] = useState(null);
  const [hudColors, setHUDColors] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(true);
  const [showReadyModal, setShowReadyModal] = useState(false);

  useEffect(() => {
    if (selectedModel) {
      setAppState(APP_STATE.SELECTION);
      console.log('selectedModel', selectedModel);
      const { name } = selectedModel;
      const colorPalette = getColorPalette(name);
      setHUDColors(colorPalette);
    }
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
    if (selection.swatchId) setSelectedTargetMesh(selection.swatchId);
    if (selection.color) setSelectedColor(selection.color);
  };

  const startFiringSequence = () => {
    setShowReadyModal(false);
    setAppState(APP_STATE.FIRING);
    setTimeout(() => {
      setAppState(APP_STATE.RESULTS);
    }, 20 * 1000);
  };

  function renderAttract() {
    return (
      <div className="attract-screen">
        <div className="side-panel left">
          <h1>{homeTitle}</h1>
          <p>{homeSubhead.homeSubhead}</p>
          <button type="button" className="btn primary begin" onClick={() => setAppState(APP_STATE.SELECTION_GALLERY)}>
            <span>BEGIN</span>
          </button>
        </div>
        <Video src={homeBgVideo.localFile.publicURL} active={false} />
      </div>
    );
  }

  function renderSelectionGallery() {
    return (
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
                imgStyle={{ objectFit: 'contain' }}
                style={{
                  width: '340px', height: '340px', margin: '0 auto', padding: '0', left: '-3px',
                }}
              />
              <div className="bottom-bar">
                <h3>{selection.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderSelection() {
    return (
      <div className="selection-screen">
        <button type="button" className="btn secondary back" onClick={() => setAppState(APP_STATE.SELECTION_GALLERY)}>
          BACK
        </button>
        <GatsbyImage
          image={getImage(selectedModel.thumbnail.localFile)}
          loading="eager"
          alt={selectedModel.shortDescription.shortDescription}
          imgStyle={{ objectFit: 'contain' }}
          style={{
            width: '540px', height: '810px', margin: '0 auto', padding: '0',
          }}
        />
        <h2>{selectedModel.name}</h2>
        <h3>{selectedModel.historicalTag}</h3>
        <p>{selectedModel.shortDescription.shortDescription}</p>
        <button type="button" className="btn primary select" onClick={() => setAppState(APP_STATE.STUDIO)}>
          SELECT
        </button>
      </div>
    );
  }

  function renderStudio() {
    return (
      <div className="studio-screen">
        <div className="background">
          <div className="blur-overlay" />
          <GatsbyImage
            image={getImage(studioBgImage.localFile)}
            loading="eager"
            alt="studio background"
            style={{ objectPosition: 'center', width: '120%' }}
          />
        </div>
        <MenuHUD
          onSelectionCallback={onHUDSelection}
          colorOptions={hudColors}
          hudOptions={hudOptions}
        />
        <button
          type="button"
          className="btn fire"
          onClick={() => setShowReadyModal(true)}
        >
          Fire
        </button>
        <button type="button" className="btn secondary home" onClick={() => setAppState(APP_STATE.ATTRACT)}>
          HOME
        </button>
        <div className="original-preview">
          <GatsbyImage
            image={getImage(selectedModel.thumbnail.localFile)}
            loading="eager"
            alt={selectedModel.shortDescription.shortDescription}
            imgStyle={{ objectFit: 'contain' }}
            style={{
              width: '83px', height: '83px', margin: '0 auto', top: '13px',
            }}
          />
          <p>Original</p>
        </div>
        <Modal
          key="loading"
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={showLoadingModal}
        >
          <Modal.Body>
            <h4>ALMOST READY</h4>
            <p>
              { selectedModel.loadingPreamble.loadingPreamble }
            </p>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn primary select" onClick={() => setShowLoadingModal(false)}>
              LET&apos;S GO
            </button>
          </Modal.Footer>
        </Modal>
        <Modal
          key="areyouready"
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={showReadyModal}
        >
          <Modal.Body>
            <h4>ARE YOU READY</h4>
            <p>
              Once you fire your piece, the design is baked in.
              You can&paos;t make any more changes.
            </p>
          </Modal.Body>
          <Modal.Footer>
            {/* <Button onClick={() => setShowReadyModal(false)}>NO</Button>
            <Button
              onClick={() => { startFiringSequence(); }}
            >
              YES
            </Button> */}
            <button type="button" className="btn primary" onClick={() => setShowReadyModal(false)}>
              NO
            </button>
            <button type="button" className="btn primary" onClick={() => { startFiringSequence(); }}>
              YES
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  function renderPottery() {
    return (
      <div className={`pottery-screen ${appState === APP_STATE.FIRING ? 'firing' : ''}`}>
        <PotteryScene
          modelPathBefore={selectedModel.modelBefore.localFile.publicURL}
          modelPathAfter={selectedModel.modelAfter.localFile.publicURL}
          turntableModelPath={turntableModel.localFile.publicURL}
          scale={selectedModel.modelScale}
          color={selectedColor}
          targetMesh={selectedTargetMesh}
          onMeshTargetsReady={(meshTargets) => setHUDOptions(meshTargets)}
          showFired={(appState === APP_STATE.FIRING)}
        />
      </div>
    );
  }

  function renderFiring() {
    return (
      <div className="firing-screen">
        <div className="factoids-bar">
          <h2>DID YOU KNOW?</h2>
          <FadeShow elements={firingFactoids} delay={5000} />
        </div>
        <KilnSequence kilnOverlay={selectedModel.thumbnail} />
        <Video src={firingBgVideo.localFile.publicURL} active />
      </div>
    );
  }

  function renderResults() {
    return (
      <div className="results-screen">
        <div className="background">
          <div className="blur-overlay" />
          <GatsbyImage
            image={getImage(resultsBgImage.localFile)}
            loading="eager"
            alt="studio background"
            imgStyle={{ objectFit: 'contain' }}
          />
        </div>
        <button type="button" className="btn home" onClick={() => setAppState(APP_STATE.SELECTION_GALLERY)}>
          HOME
        </button>
        <h1>{resultsTitle}</h1>
        <p>{resultsSubhead}</p>
      </div>
    );
  }

  return (
    <>
      { appState === APP_STATE.ATTRACT && renderAttract() }
      { appState === APP_STATE.SELECTION_GALLERY && renderSelectionGallery() }
      { appState === APP_STATE.SELECTION && renderSelection() }
      { appState === APP_STATE.STUDIO && renderStudio() }
      { (appState === APP_STATE.STUDIO || appState === APP_STATE.FIRING) && renderPottery() }
      { appState === APP_STATE.FIRING && renderFiring() }
      { appState === APP_STATE.RESULTS && renderResults() }
    </>
  );
}

RookwoodPotteryInteractive.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default RookwoodPotteryInteractive;
