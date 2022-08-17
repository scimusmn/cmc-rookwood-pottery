import React, { useState, useEffect } from 'react';
import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { Modal } from 'react-bootstrap';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { useIdleTimer } from 'react-idle-timer';
import useLocalStorage from 'use-local-storage';
import PotteryScene from '../../components/PotteryScene';
import MenuHUD from '../../components/MenuHUD';
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
              gatsbyImageData(width: 960, layout: CONSTRAINED, placeholder: BLURRED)
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

const FIRING_DURATION_SECS = 6;

const INACTIVITY_TIMEOUT_SECS = 90;

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

  const [reloadScreen, setReloadScreen] = useLocalStorage('reloadScreen', APP_STATE.ATTRACT);

  const [appState, setAppState] = useState(reloadScreen);
  const [showFadeOut, setShowFadeOut] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedTargetMesh, setSelectedTargetMesh] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [hudOptions, setHUDOptions] = useState(null);
  const [hudColors, setHUDColors] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(true);
  const [showReadyModal, setShowReadyModal] = useState(false);
  const [showAreYouSureModal, setShowAreYouSureModal] = useState(false);
  const [showOriginalModal, setShowOriginalModal] = useState(false);

  useEffect(() => {
    setShowFadeOut(false);
  }, []);

  useEffect(() => {
    if (selectedModel) {
      setAppState(APP_STATE.SELECTION);
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

  const fadeToBlackReset = (skipAttract) => {
    setShowAreYouSureModal(false);
    setShowFadeOut(true);
    if (skipAttract) {
      setReloadScreen(APP_STATE.SELECTION_GALLERY);
    } else {
      setReloadScreen(APP_STATE.ATTRACT);
    }
    setTimeout(() => {
      window.location.reload();
    }, 1100);
  };

  const startFiringSequence = () => {
    setShowReadyModal(false);
    setAppState(APP_STATE.FIRING);
    setTimeout(() => {
      setAppState(APP_STATE.RESULTS);
    }, FIRING_DURATION_SECS * 1000);
  };

  // Inactivity timeout
  useIdleTimer({
    timeout: INACTIVITY_TIMEOUT_SECS * 1000,
    debounce: 500,
    startOnMount: false,
    onIdle: () => fadeToBlackReset(false),
  });

  function renderAttract() {
    return (
      <div className="attract-screen">
        <div className="side-panel left">
          <h1>{homeTitle}</h1>
          <p>{homeSubhead.homeSubhead}</p>
          <button type="button" className="btn primary begin" onPointerDown={() => setAppState(APP_STATE.SELECTION_GALLERY)}>
            BEGIN
          </button>
        </div>
        <Video src={homeBgVideo.localFile.publicURL} active />
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
            <button key={selection.id} type="button" className="selection-button" onPointerDown={() => setSelectedModel(selection)}>
              <GatsbyImage
                image={getImage(selection.thumbnail.localFile)}
                loading="eager"
                alt={selection.shortDescription.shortDescription}
                imgStyle={{ objectFit: 'cover' }}
                style={{
                  position: 'static',
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
        <button type="button" className="btn secondary back" onPointerDown={() => setAppState(APP_STATE.SELECTION_GALLERY)}>
          BACK
        </button>
        <GatsbyImage
          image={getImage(selectedModel.thumbnail.localFile)}
          loading="eager"
          alt={selectedModel.shortDescription.shortDescription}
          // imgStyle={{ objectFit: 'contain' }}
          style={{
            width: '540px', height: '810px', margin: '0 auto', padding: '0',
          }}
        />
        <h2>{selectedModel.name}</h2>
        <h3>{selectedModel.historicalTag}</h3>
        <p>{selectedModel.shortDescription.shortDescription}</p>
        <button type="button" className="btn primary select" onPointerDown={() => setAppState(APP_STATE.STUDIO)}>
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
          <div className="outer">
            <div className="inner">
              <span>FIRE</span>
            </div>
          </div>
        </button>
        <button type="button" className="btn secondary home" onPointerDown={() => setShowAreYouSureModal(true)}>
          <span className="icon-home" />
          <span className="label">HOME</span>
        </button>
        <div className="original-preview" onPointerDown={() => setShowOriginalModal(true)}>
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
            <button type="button" className="btn primary select" onPointerDown={() => setShowLoadingModal(false)}>
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
            <h4>ARE YOU READY?</h4>
            <p>
              Once you fire your piece, the design is baked in.
              You can&apos;t make any more&nbsp;changes.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn primary" onPointerDown={() => setShowReadyModal(false)}>
              NO
            </button>
            <button type="button" className="btn primary" onPointerDown={() => startFiringSequence()}>
              YES
            </button>
          </Modal.Footer>
        </Modal>
        <Modal
          key="areyousure"
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={showAreYouSureModal}
        >
          <Modal.Body>
            <h4>ARE YOU SURE?</h4>
            <p>
              Do you really want to restart? Your artwork will be lost.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn primary" onPointerDown={() => fadeToBlackReset(true)}>
              YES
            </button>
            <button type="button" className="btn primary" onPointerDown={() => setShowAreYouSureModal(false)}>
              NO
            </button>
          </Modal.Footer>
        </Modal>
        <Modal
          key="originalPreview"
          className="full-bleed"
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={showOriginalModal}
        >
          <button type="button" className="x-close" onPointerDown={() => setShowOriginalModal(false)} />
          <GatsbyImage
            image={getImage(selectedModel.thumbnail.localFile)}
            loading="eager"
            alt={selectedModel.shortDescription.shortDescription}
            imgStyle={{ objectFit: 'contain' }}
            style={{
              width: '100%', height: '100%', margin: '0 auto', padding: '0',
            }}
          />
        </Modal>
      </div>
    );
  }

  function renderPottery() {
    return (
      <div className={`pottery-screen ${appState === APP_STATE.FIRING ? 'firing' : ''}`}>
        <PotteryScene
          pieceName={selectedModel.name}
          modelPathBefore={selectedModel.modelBefore.localFile.publicURL}
          modelPathAfter={selectedModel.modelAfter.localFile.publicURL}
          turntableModelPath={turntableModel.localFile.publicURL}
          scale={selectedModel.modelScale}
          activeColor={selectedColor}
          targetMesh={selectedTargetMesh}
          onMeshTargetsReady={(meshTargets) => setHUDOptions(meshTargets)}
          showFired={(appState === APP_STATE.FIRING || appState === APP_STATE.RESULTS)}
          showCompare={(appState === APP_STATE.RESULTS)}
        />
      </div>
    );
  }

  function renderFiring() {
    return (
      <div className="firing-screen">
        <div className="darken-overlay" />
        <div className="firing-progress">
          <div className="ring-container">
            <CountdownCircleTimer
              isPlaying
              duration={FIRING_DURATION_SECS}
              colors={['#FFB600']}
              size={345}
              strokeWidth={14}
              strokeLinecap="square"
              trailStrokeWidth={6}
              trailColor="#A1A1A1"
            />
          </div>
          <h1>YOUR PIECE IS BEING FIRED</h1>
        </div>
        <div className="factoids-bar">
          <h2>DID YOU KNOW?</h2>
          <FadeShow elements={firingFactoids} delay={99999999} />
        </div>
        <Video src={firingBgVideo.localFile.publicURL} active fadeIn />
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
            alt="results background"
            imgStyle={{ objectFit: 'cover' }}
          />
        </div>
        <button type="button" className="btn primary start-over" onPointerDown={() => fadeToBlackReset(true)}>
          START OVER
        </button>
        <div className="factoids-bar">
          <h2>{resultsTitle}</h2>
          <FadeShow elements={[resultsSubhead]} delay={-1} />
        </div>
        <div className="original-preview your">
          <p>Your piece</p>
        </div>
        <div className="original-preview orig">
          <p>Original</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="screens">
        { appState === APP_STATE.ATTRACT && renderAttract() }
        { appState === APP_STATE.SELECTION_GALLERY && renderSelectionGallery() }
        { appState === APP_STATE.SELECTION && renderSelection() }
        { appState === APP_STATE.STUDIO && renderStudio() }
        { (appState === APP_STATE.STUDIO
          || appState === APP_STATE.FIRING
          || appState === APP_STATE.RESULTS
        ) && renderPottery() }
        { appState === APP_STATE.FIRING && renderFiring() }
        { appState === APP_STATE.RESULTS && renderResults() }
      </div>
      <div id="reticle" className="atomizer-reticle" />
      <div className={`fade-black-overlay ${showFadeOut ? 'show' : ''}`} />
    </>
  );
}

RookwoodPotteryInteractive.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default RookwoodPotteryInteractive;
