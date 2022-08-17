import { useEffect, useMemo, useState } from 'react';
import './Piano.scss';
import Key from './Key';
import { Range, Note } from '@tonaljs/tonal';

export let isMouseDown = false;
window.playedNotes = [];

function Piano({ player, firstNote = 'C4', lastNote = 'B6', ...props }) {
  const [playingNotes, setPlayingNotes] = useState([]);

  const noteRange = useMemo(() => {
    const r = Range.chromatic([firstNote, lastNote], { sharps: true });
    return r;
  }, [firstNote, lastNote]);

  useEffect(() => {
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    if (player) {
      player.on('play', (p) => {
        setPlayingNotes(p.playingNotes);
      });
      player.on('stop', (p) => {
        setPlayingNotes(p.playingNotes);
      });
    }
  }, [player]);

  function onMouseDown() {
    isMouseDown = true;
  }

  function onMouseUp() {
    isMouseDown = false;
  }

  function playNote(midiNumber) {
    player.play(midiNumber);
  }

  function stopNote(midiNumber) {
    player.stop(midiNumber);
  }

  function isPlaying(note) {
    return playingNotes?.[Note.midi(note)] &&
      playingNotes?.[Note.midi(note)]?.startTime <= player?.audioContext?.currentTime &&
      player?.audioContext?.currentTime <
        playingNotes?.[Note.midi(note)]?.startTime + playingNotes?.[Note.midi(note)]?.duration
      ? true
      : false;
  }

  return (
    <>
      <div className="web-piano">
        {noteRange.map((note, index) => (
          <Key
            key={note}
            note={note}
            isPlaying={isPlaying(note)}
            index={index}
            noteRange={noteRange}
            playNote={playNote}
            stopNote={stopNote}
          ></Key>
        ))}
      </div>
    </>
  );
}

export default Piano;
