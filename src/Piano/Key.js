import { Note } from '@tonaljs/tonal';
import { useMemo } from 'react';
import { isMouseDown } from './Piano';
import { getNoteColor } from '../helpers';

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
    let width = 100 / noteRange.length;
    let left = index * width;
    if (!noteInfo.acc) {
      const wholeTonesCount = getWholeTonesCount();
      width = 100 / wholeTonesCount;
      left = getRelativeStep() * width;
    }
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
      onTouchStart={() => playNote(noteInfo.midi)}
      onTouchCancel={() => stopNote(noteInfo.midi)}
      onTouchEnd={() => stopNote(noteInfo.midi)}
    >
      <div
        className={'web-piano-key-content'}
        style={{ backgroundColor: `${isPlaying ? getNoteColor(noteInfo.midi) : ''}` }}
      >
        <span
          className={`${note === 'C4' ? 'key-c4' : ''} `}
        >{`${noteInfo.letter}${noteInfo.acc}`}</span>
      </div>
    </div>
  );
}

export default Key;
