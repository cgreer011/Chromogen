import React from 'react';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import GetAppIcon from '@material-ui/icons/GetApp';

// interface RecorderProps {
//   status: boolean;
// }

const Recorder: React.FC<{ status: boolean }> = ({ status }) => {
  // Connect to background.js
  const backgroundConnection = chrome.runtime.connect();

  // Send message to background.js
  const sendMessage = (action: string) => {
    backgroundConnection.postMessage({
      action,
      tabId: chrome.devtools.inspectedWindow.tabId,
    });
  };

  return (
    <div className="recorder-div">
      <button id="recorderBtn" type="submit" onClick={() => sendMessage('toggleRecord')}>
        {status ? (
          <StopIcon style={{ color: '#D44B5A', fontSize: '40px' }} />
        ) : (
          <PlayArrowIcon style={{ color: '#FCE3A3', fontSize: '40px' }} />
        )}
      </button>
      <button id="recorderBtn" type="submit" onClick={() => sendMessage('downloadFile')}>
        <GetAppIcon style={{ fontSize: '38px' }} />
      </button>
    </div>
  );
};

export default Recorder;
