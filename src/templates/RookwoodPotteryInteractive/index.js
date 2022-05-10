import React, { useState } from 'react';
import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import PotteryScene from '../../components/PotteryScene';
import MenuHUD from '../../components/MenuHUD';

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
    }
  }
`;

function RookwoodPotteryInteractive({ data }) {
  const { contentfulRookwoodPotteryInteractive } = data;
  const { homeTitle, modelSelections } = contentfulRookwoodPotteryInteractive;

  console.log(modelSelections);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selecteColor, setSelectedColor] = useState(null);
  const [selectedTexture, setSelectedTexture] = useState(null);

  const onHUDSelection = (selection) => {
    console.log('onHUDSelection', selection);
    if (selection.color) setSelectedColor(selection.color);
    if (selection.texture) setSelectedTexture(selection.texture);
  };

  return (
    <>
      { !selectedModel && (
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
      { selectedModel && (
        <div className="pottery-screen">
          <button type="button" className="selection-button" onClick={() => setSelectedModel(null)}>
            Back
          </button>
          <p>{selectedModel.name}</p>
          <MenuHUD onSelectionCallback={onHUDSelection} />
          <PotteryScene
            modelPath={selectedModel.modelObj.localFile.publicURL}
            mtlPath={selectedModel.modelMtl.localFile.publicURL}
            scale={selectedModel.modelScale}
            color={selecteColor}
            texture={selectedTexture}
          />
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
