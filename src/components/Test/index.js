/* eslint react/prop-types: 0 */
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import EyeButton from '@components/EyeButton';
import withSerialCommunication from '@components/Serial/SerialHOC';
import {
  gazeX, gazeY, isUserPresent, // useCoordinates,
} from '../hooks';
import { WAKE_ARDUINO } from '../../Arduino/arduino-base/ReactSerial/ArduinoConstants';
// import IPC from '../../Arduino/arduino-base/ReactSerial/IPCMessages';
import deleteImg from '../../images/delete.svg';
import deleteAll from '../../images/delete-all.svg';
import play from '../../images/play.svg';

const Test = (props) => {
  const { ipcAvailable, sendData, setOnDataCallback } = props;

  function onData(data) {
    console.log('onData:', data);
  }

  function sendClick(msg) {
    console.log('sendClick:', msg);

    // This is where we pass it through
    // our HOC method to Stele, which passes
    // to Serial device.
    sendData(msg);
  }

  useEffect(() => {
    setOnDataCallback(onData);
    // console.log(ipcAvailable, 'ipc');
  });

  /* cursor position with single hook */
  // const { x1, y1 } = useCoordinates();

  /* cursor position with 2 hooks to match api */
  const { x } = gazeX();
  const { y } = gazeY();
  const hasMovedCursor = x !== null && y !== null;

  /* isUserPresent */
  const [userPresent, updateUserPresent] = isUserPresent();

  const [button1, selectButton1] = useState(false);
  const [button2, selectButton2] = useState(false);
  const [button3, selectButton3] = useState(false);

  const selectedStyle = { background: 'purple' };
  const deselectedStyle = { background: 'gray' };

  console.log(userPresent, 'isUserPresent');

  function handleButton(button) {
    console.log('hey');
    // currently the "button presses" are read as unknown commands
    if (button === 1) {
      selectButton1(true);
      selectButton2(false);
      selectButton3(false);
      sendClick('{button1-press:1}');
    }
    if (button === 2) {
      selectButton2(true);
      selectButton1(false);
      selectButton3(false);
      sendClick('{button1-press:1}');
    }
    if (button === 3) {
      selectButton3(true);
      selectButton1(false);
      selectButton2(false);
      sendClick('{button1-press:1}');
    }
  }

  return (
    <>
      <div className="calibration-background component-container">
        {/* <div className="cursor" style={{ left: `${x}px`, top: `${y}px` }}>
          <div className="inner" />
        </div>
        */}
        <Row>
          <Col>
            <h1>Calibration screen, styles only for now</h1>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <h2>
              {hasMovedCursor
                ? `Your cursor is at ${x}, ${y}.`
                : 'Move your mouse around.'}
            </h2>
            <button type="button" onClick={() => sendClick(WAKE_ARDUINO)}>
              Wake Arduino
            </button>
            <h3>
              IPC:
              {ipcAvailable.toString()}
            </h3>
            <button type="button" onClick={updateUserPresent}>
              User:
              {userPresent.toString()}
            </button>
          </Col>
          <Col md={3}>
            <EyeButton
              displayString="button1"
              onTrigger={() => handleButton(1)}
              style={button1 ? selectedStyle : deselectedStyle}
            />
          </Col>
          <Col md={3}>
            <EyeButton
              displayString="button2"
              onTrigger={() => handleButton(2)}
              style={button2 ? selectedStyle : deselectedStyle}
            />
          </Col>
          <Col md={3}>
            <EyeButton
              displayString="button3"
              onTrigger={() => handleButton(3)}
              style={button3 ? selectedStyle : deselectedStyle}
            />
          </Col>
        </Row>
        <div className="staff-container">
          <div className="clef">&#119070;</div>
          <div className="staff">
            <hr className="line" />
            <hr className="line" />
            <hr className="line" />
          </div>
        </div>
        <div className="note-container quarter">
          <div className="note" style={{ top: '28px' }}>&#9833;</div>
          <div className="note" style={{ top: '42px' }}>&#9833;</div>
          <div className="note" style={{ top: '58px' }}>&#9833;</div>
          <div className="note" style={{ top: '72px' }}>&#9833;</div>
          <div className="note" style={{ top: '88px' }}>&#9833;</div>
          <div className="note" style={{ top: '102px' }}>&#9833;</div>
          <div className="note" style={{ top: '116px' }}>&#9833;</div>
          <div className="note note-set" style={{ top: '130px' }}>&#9833;</div>
        </div>
        <div className="note-container">
          <div className="middle-c" />
          <div className="middle-c" />
          <div className="middle-c" />
          <div className="middle-c" />
          <div className="middle-c" />
          <div className="middle-c" />
          <div className="middle-c" />
          <div className="middle-c" />
        </div>
        <div className="note-container">
          <div className="comp comp-selected">C</div>
          <div className="comp">C</div>
          <div className="comp">C</div>
          <div className="comp">C</div>
          <div className="comp">C</div>
          <div className="comp">C</div>
          <div className="comp">C</div>
          <div className="comp">C</div>
        </div>
        <div className="note-container">
          <div className="comp">B</div>
          <div className="comp comp-selected">B</div>
          <div className="comp">B</div>
          <div className="comp">B</div>
          <div className="comp">B</div>
          <div className="comp">B</div>
          <div className="comp">B</div>
          <div className="comp">B</div>
        </div>
        <div className="note-container">
          <div className="comp">A</div>
          <div className="comp">A</div>
          <div className="comp comp-selected">A</div>
          <div className="comp">A</div>
          <div className="comp">A</div>
          <div className="comp">A</div>
          <div className="comp">A</div>
          <div className="comp">A</div>
        </div>
        <div className="note-container">
          <div className="comp">G</div>
          <div className="comp">G</div>
          <div className="comp">G</div>
          <div className="comp comp-selected">G</div>
          <div className="comp">G</div>
          <div className="comp">G</div>
          <div className="comp">G</div>
          <div className="comp">G</div>
        </div>
        <div className="note-container">
          <div className="comp">F</div>
          <div className="comp">F</div>
          <div className="comp">F</div>
          <div className="comp">F</div>
          <div className="comp comp-selected">F</div>
          <div className="comp">F</div>
          <div className="comp">F</div>
          <div className="comp">F</div>
        </div>
        <div className="note-container">
          <div className="comp">E</div>
          <div className="comp">E</div>
          <div className="comp">E</div>
          <div className="comp">E</div>
          <div className="comp">E</div>
          <div className="comp comp-selected">E</div>
          <div className="comp">E</div>
          <div className="comp">E</div>
        </div>
        <div className="note-container">
          <div className="comp">D</div>
          <div className="comp">D</div>
          <div className="comp">D</div>
          <div className="comp">D</div>
          <div className="comp">D</div>
          <div className="comp">D</div>
          <div className="comp comp-selected">D</div>
          <div className="comp">D</div>
        </div>
        <div className="note-container">
          <div className="comp">C</div>
          <div className="comp">C</div>
          <div className="comp">C</div>
          <div className="comp">C</div>
          <div className="comp">C</div>
          <div className="comp">C</div>
          <div className="comp">C</div>
          <div className="comp comp-hover">C</div>
        </div>
        <div className="note-container">
          <div className="comp">-</div>
          <div className="comp">-</div>
          <div className="comp">-</div>
          <div className="comp">-</div>
          <div className="comp">-</div>
          <div className="comp">-</div>
          <div className="comp">-</div>
          <div className="comp">X</div>
        </div>
        <div className="note-container">
          <div className="comp">
            <img src={deleteImg} height="20px" alt="delete" />
          </div>
          <div className="comp">
            <img src={deleteImg} height="20px" alt="delete" />
          </div>
          <div className="comp">
            <img src={deleteImg} height="20px" alt="delete" />
          </div>
          <div className="comp">
            <img src={deleteImg} height="20px" alt="delete" />
          </div>
          <div className="comp">
            <img src={deleteImg} height="20px" alt="delete" />
          </div>
          <div className="comp">
            <img src={deleteImg} height="20px" alt="delete" />
          </div>
          <div className="comp">
            <img src={deleteImg} height="20px" alt="delete" />
          </div>
          <div className="comp">
            <img src={deleteImg} height="20px" alt="delete" />
          </div>
        </div>
        <div className="transport">
          <div className="icon">
            <img src={deleteAll} height="80px" alt="delete all" />
          </div>
          <div className="icon">
            <img src={play} height="80px" alt="play" />
          </div>
        </div>
        {/* example of filled cursor with gradient
        <div className="outer-dot">
          <div className="inner-dot">
            <div className="bullseye" />
          </div>
        </div> */}
      </div>
    </>
  );
};

// export default Test;

const TestWithSerialCommunication = withSerialCommunication(Test);
export default TestWithSerialCommunication;
