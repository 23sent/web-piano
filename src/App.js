import { useEffect, useState } from 'react';
import './App.scss';
import Piano from './Piano/Piano';
import Player from './Player/Player';
import Soundfont from 'soundfont-player';
import SequenceDrawer from './SequenceDrawer/SequenceDrawer';
import { Note } from '@tonaljs/tonal';

const audioContext = new AudioContext();
const MIN_NOTE_WIDTH = 30;

function App() {
  const [player, setPlayer] = useState();
  const [isRecording, setRecording] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [noteRange, setNoteRange] = useState({
    firstNote: 'C3',
    lastNote: 'B7',
  });

  useEffect(() => {
    Soundfont.instrument(audioContext, 'bright_acoustic_piano').then((piano) => {
      setPlayer(new Player(audioContext, piano));
    });

    calculateRange();
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

  function calculateRange() {
    const width = window.innerWidth;
    const noteCount = Math.floor(width / MIN_NOTE_WIDTH);
    console.log(noteCount);

    const defaultFirstNote = Note.midi('C4');
    const defaultLastNote = Note.midi('B4');

    const minFirstNote = Note.midi('C1');
    const minLastNote = Note.midi('C8');

    const minNoteCount = defaultLastNote - defaultFirstNote + 1;
    const difference = Math.floor(Math.max(0, noteCount - minNoteCount) / 2);

    console.log(minFirstNote, defaultFirstNote - difference);
    console.log(minLastNote, defaultLastNote + difference);

    const firstNoteMidi = Math.max(minFirstNote, defaultFirstNote - difference);
    const lastNoteMidi = Math.min(minLastNote, defaultLastNote + difference);

    const firstNote = Note.fromMidiSharps(firstNoteMidi).replace('#', '');
    const lastNote = Note.fromMidiSharps(lastNoteMidi).replace('#', '');
    console.log(firstNote, lastNote);

    setNoteRange({
      firstNote,
      lastNote,
    });
  }

  return (
    <div className="App">
      <div className="sequencer-container">
        {player && (
          <SequenceDrawer
            player={player}
            firstNote={noteRange.firstNote}
            lastNote={noteRange.lastNote}
            isRecording={isRecording}
            isPlaying={isPlaying}
          ></SequenceDrawer>
        )}
      </div>
      <div className="piano-container">
        {player && (
          <Piano
            player={player}
            firstNote={noteRange.firstNote}
            lastNote={noteRange.lastNote}
          ></Piano>
        )}
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
