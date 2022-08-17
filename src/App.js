import { useEffect, useState } from 'react';
import './App.scss';
import Piano from './Piano/Piano';
import Player from './Player/Player';
import Soundfont from 'soundfont-player';
import SequenceDrawer from './SequenceDrawer/SequenceDrawer';

const audioContext = new AudioContext();

function App() {
  const [player, setPlayer] = useState();
  const [isRecording, setRecording] = useState(false);
  const [isPlaying, setPlaying] = useState(false);

  useEffect(() => {
    Soundfont.instrument(audioContext, 'bright_acoustic_piano').then((piano) => {
      setPlayer(new Player(audioContext, piano));
    });
  }, []);

  useEffect(() => {
    if (player) {
      player.on('startPlayback', () => {
        setRecording(false);
        setPlaying(true);
      });
      player.on('stopPlayback', () => {
        setRecording(false);
        setPlaying(false);
      });

      player.on('startRecording', () => {
        setRecording(true);
        setPlaying(false);
      });
      player.on('stopRecording', () => {
        setRecording(false);
        setPlaying(false);
      });
    }
  }, [player]);

  return (
    <div className="App">
      <div className="sequencer-container">
        {player && (
          <SequenceDrawer
            player={player}
            firstNote="C3"
            lastNote="B7"
            isRecording={isRecording}
            isPlaying={isPlaying}
          ></SequenceDrawer>
        )}
      </div>
      <div className="piano-container">
        {player && <Piano player={player} firstNote="C3" lastNote="B7"></Piano>}
      </div>
      <div className="controler-container">
        {player && (
          <>
            <button
              className={`${isRecording ? 'on-recording' : ''}`}
              onClick={(e) => {
                if (isRecording) {
                  player.stopRecording();
                } else {
                  player.startRecording();
                }
              }}
            >
              <span className="material-symbols-outlined">radio_button_checked</span>
            </button>
            <button
              className={`${isPlaying ? 'on-playing' : ''}`}
              onClick={(e) => {
                if (isPlaying) {
                  player.stopRecording();
                } else {
                  player.startPlayback();
                }
              }}
            >
              {!isPlaying && <span className="material-symbols-outlined">play_arrow</span>}
              {isPlaying && <span className="material-symbols-outlined">pause</span>}
            </button>
          </>
        )}
        <div
          className={
            'info-line' +
            ` ${isRecording ? 'on-recording' : ''} ` +
            ` ${isPlaying ? 'on-playing' : ''} `
          }
        ></div>
      </div>
    </div>
  );
}

export default App;
