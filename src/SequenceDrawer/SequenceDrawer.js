import { useEffect, useMemo, useRef } from 'react';
import { Range, Note } from '@tonaljs/tonal';
import Scheduler from '../Player/Scheduler';

let timer = null;
function SequenceDrawer({ player, firstNote = 'C4', lastNote = 'B6', isRecording, isPlaying }) {
  const canvasRef = useRef();

  const noteRange = useMemo(() => {
    const r = Range.chromatic([firstNote, lastNote], { sharps: true });
    return r;
  }, [firstNote, lastNote]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      context.canvas.width = canvas.offsetWidth * 2;
      context.canvas.height = canvas.offsetHeight * 2;
    }
  }, [canvasRef]);

  useEffect(() => {
    draw();
  }, [noteRange, isRecording, isPlaying]);

  function draw() {
    const canvas = canvasRef.current;

    if (canvas.getContext) {
      const context = canvas.getContext('2d');
      const height = context.canvas.height;
      const width = context.canvas.width;
      context.clearRect(0, 0, width, height);

      const notePositions = {};
      const noteWidth = width / noteRange.length;
      for (let i = 0; i < noteRange.length; i++) {
        const note = noteRange[i];
        notePositions[note] = {
          left: noteWidth * i,
          right: noteWidth * (i + 1),
        };
        context.save();
        context.beginPath();
        context.moveTo(notePositions[note].left, 0);
        context.lineTo(notePositions[note].left, height);
        context.stroke();
        context.closePath();
        context.restore();
      }

      const recorder = player?._recorder;
      const scheduler = player?._scheduler;
      if (recorder && scheduler?.state !== Scheduler.STATES.STARTED) {
        const records = recorder.records;
        const recorderTime = recorder.currentRecordTime;

        context.save();
        const maxBottomPosition = recorderTime * 100;

        context.translate(0, -(maxBottomPosition - height));

        for (let record of records) {
          const { note: midiNumber, time, duration } = record;
          const note = Note.fromMidiSharps(midiNumber, { sharps: true });
          context.fillStyle = 'blue';
          context.fillRect(notePositions[note].left, time * 100, noteWidth, duration * 100);
        }

        context.translate(0, maxBottomPosition - height);

        context.restore();
      }

      if (recorder && scheduler?.state === Scheduler.STATES.STARTED) {
        const records = recorder.records;
        const schedulerTime = scheduler.prevTime;

        context.save();
        context.transform(1, 0, 0, -1, 0, canvas.height);

        const maxBottomPosition = schedulerTime * 100;

        context.translate(0, -maxBottomPosition);
        for (let record of records) {
          const { note: midiNumber, time, duration } = record;
          const note = Note.fromMidiSharps(midiNumber, { sharps: true });
          context.fillStyle = 'blue';
          context.fillRect(notePositions[note].left, time * 100, noteWidth, duration * 100);
        }

        context.translate(0, maxBottomPosition);

        context.restore();
      }
    }

    if (isRecording) {
      timer = window.requestAnimationFrame(() => draw());
    } else if (isPlaying) {
      timer = window.requestAnimationFrame(() => draw());
    } else {
      cancelAnimationFrame(timer);
    }
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ height: '100%', width: '100%' }}></canvas>
    </>
  );
}

export default SequenceDrawer;
