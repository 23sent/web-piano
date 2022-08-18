import { useEffect, useMemo, useRef } from 'react';
import { Range, Note } from '@tonaljs/tonal';
import Scheduler from '../Player/Scheduler';
import { getNoteColor } from '../helpers';

const FRAME_PER_SECONDS = 24;
const SHOW_GUIDLINES = false;

let timer = null;
let lastRenderTime = 0;

function SequenceDrawer({ player, firstNote = 'C4', lastNote = 'B6', isRecording, isPlaying }) {
  const canvasRef = useRef();

  const noteRange = useMemo(() => {
    const r = Range.chromatic([firstNote, lastNote], { sharps: true });
    return r;
  }, [firstNote, lastNote]);

  useEffect(() => {
    const canvas = canvasRef.current;
    lastRenderTime = 0;

    if (canvas) {
      const context = canvas.getContext('2d');
      context.canvas.width = canvas.offsetWidth * 2;
      context.canvas.height = canvas.offsetHeight * 2;
    }
  }, [canvasRef]);

  useEffect(() => {
    draw();
  }, [noteRange]);

  useEffect(() => {
    if (isRecording || isPlaying) {
      draw();
    } else {
      window.cancelAnimationFrame(timer);
    }
  }, [isRecording, isPlaying]);

  function draw() {
    const timestamp = performance.now();
    if (timestamp - lastRenderTime > 1000 / FRAME_PER_SECONDS) {
      lastRenderTime = timestamp;

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
          const midi = Note.midi(note);
          notePositions[midi] = {
            left: noteWidth * i,
            right: noteWidth * (i + 1),
          };
          if (SHOW_GUIDLINES) {
            context.save();
            context.beginPath();
            context.moveTo(notePositions[midi].left, 0);
            context.lineTo(notePositions[midi].left, height);
            context.stroke();
            context.closePath();
            context.restore();
          }
        }

        const recorder = player?._recorder;
        const scheduler = player?._scheduler;
        const playingNotes = player.playingNotes;
        if (recorder && scheduler?.state !== Scheduler.STATES.STARTED) {
          const records = recorder.records;
          const recorderTime = recorder.currentRecordTime;

          context.save();
          const maxBottomPosition = recorderTime * 100;

          context.translate(0, -(maxBottomPosition - height));

          for (let record of records) {
            const { note: midiNumber, time, duration } = record;
            context.fillStyle = getNoteColor(midiNumber);
            context.fillRect(notePositions[midiNumber].left, time * 100, noteWidth, duration * 100);
          }

          for (let midiNumber in playingNotes) {
            const playingNote = playingNotes[midiNumber];
            if (playingNote) {
              const { audioNode, startTime, duration } = playingNote;
              const time = recorder.getRecorderTimeFormContextTime(startTime);

              context.fillStyle = getNoteColor(midiNumber);
              context.fillRect(
                notePositions[midiNumber].left,
                time * 100,
                noteWidth,
                duration * 100,
              );
            }
          }

          context.translate(0, maxBottomPosition - height);

          context.restore();
        }

        if (recorder && scheduler?.state === Scheduler.STATES.STARTED) {
          const records = recorder.records;
          const schedulerTime = scheduler.prevTime;

          context.save();
          // context.transform(1, 0, 0, -1, 0, canvas.height);

          const maxBottomPosition = schedulerTime * 100;

          context.translate(0, -(maxBottomPosition - height));
          // context.translate(0, -maxBottomPosition);

          for (let record of records) {
            const { note: midiNumber, time, duration } = record;
            context.fillStyle = getNoteColor(midiNumber);
            context.fillRect(notePositions[midiNumber].left, time * 100, noteWidth, duration * 100);
          }
          context.translate(0, maxBottomPosition - height);

          // context.translate(0, maxBottomPosition);

          context.restore();
        }
      }
    }
    if (isRecording) {
      timer = window.requestAnimationFrame(() => draw());
    } else if (isPlaying) {
      timer = window.requestAnimationFrame(() => draw());
    } else {
      window.cancelAnimationFrame(timer);
    }
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ height: '100%', width: '100%' }}></canvas>
    </>
  );
}

export default SequenceDrawer;
