import { Note } from '@tonaljs/tonal';
import { useMemo } from 'react';
import { isMouseDown } from './Piano';

function getRandomColor() {
  const colors = [
    '#fd7f6f',
    '#7eb0d5',
    '#b2e061',
    '#bd7ebe',
    '#ffb55a',
    '#ffee65',
    '#beb9db',
    '#fdcce5',
    '#8bd3c7',
  ];
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
}

function Key({ note, index, playNote, noteRange, stopNote, isPlaying, ...props }) {
  const noteInfo = useMemo(() => {
    return Note.get(note);
  }, [note]);

  function getOctaveStep(note) {
    return note.oct * 7 + note.step;
  }

  function getRelativeStep() {
    const firstNote = Note.get(noteRange[0]);

    return getOctaveStep(noteInfo) - getOctaveStep(firstNote);
  }

  function getWholeTonesCount() {
    const firstNote = Note.get(noteRange[0]);
    const lastnote = Note.get(noteRange[noteRange.length - 1]);

    return getOctaveStep(lastnote) - getOctaveStep(firstNote) + 1;
  }

  function getKeyStyle() {
    const wholeTonesCount = getWholeTonesCount();
    const wholeToneWidth = 100 / wholeTonesCount;
    const width = wholeToneWidth / (noteInfo.acc ? 1.3 : 1);
    const left = getRelativeStep() * wholeToneWidth + (wholeToneWidth - width / 2) * noteInfo.alt;
    const bottom = noteInfo.acc ? 35 : 0;
    return { left: `${left}%`, width: `${width}%`, bottom: `${bottom}%` };
  }

  return (
    <div
      className={`web-piano-key ${noteInfo.acc ? ' web-piano-key-accidental ' : ''}`}
      style={{
        position: 'absolute',
        top: '0',
        ...getKeyStyle(),
      }}
      onMouseDown={() => playNote(noteInfo.midi)}
      onMouseEnter={() => isMouseDown && playNote(noteInfo.midi)}
      onMouseLeave={() => stopNote(noteInfo.midi)}
      onMouseUp={() => stopNote(noteInfo.midi)}
    >
      <div
        className="web-piano-key-content"
        style={{ backgroundColor: `${isPlaying ? getRandomColor() : ''}` }}
      >
        {
          // `${noteInfo.letter}${noteInfo.acc}`
        }
      </div>
    </div>
  );
}

export default Key;
