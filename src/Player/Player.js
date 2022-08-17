import Scheduler from './Scheduler';
import Recorder from './Record';

export default class Player {
  playingNotes = [];
  callbacks = {
    play: [],
    stop: [],
    startPlayback: [],
    stopPlayback: [],
    startRecording: [],
    stopRecording: [],
  };

  _scheduler = null;
  _recorder = null;

  constructor(audioContext, instrument) {
    this.instrument = instrument;
    this.audioContext = audioContext;
  }

  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  emit(event, ...args) {
    if (this.callbacks?.[event]?.length) {
      for (let callback of this.callbacks[event]) {
        callback(this, ...args);
      }
    }
  }

  play(midiNumber, time, opt) {
    if (!time) {
      time = this.audioContext.currentTime;
    }

    const audioNode = this.instrument.play(midiNumber, time, opt);
    const duration =
      opt?.duration !== undefined ? opt.duration : audioNode?.source?.buffer?.duration;
    this.playingNotes = {
      ...this.playingNotes,
      [midiNumber]: { audioNode, startTime: time, duration },
    };

    this.emit('play', midiNumber, time, opt);
  }

  stop(midiNumber) {
    if (this.playingNotes[midiNumber]) {
      const { audioNode, startTime } = this.playingNotes[midiNumber];
      const endTime = this.audioContext.currentTime + 0.01;
      audioNode.stop(endTime);

      const maxDuration = audioNode?.source?.buffer?.duration || Infinity;

      if (this._recorder) {
        this.addRecord({
          midiNumber,
          time: startTime - this._recorder.startContextTime,
          duration: Math.min(maxDuration, endTime - startTime),
        });
      }

      this.playingNotes = { ...this.playingNotes, [midiNumber]: null };
      this.emit('stop', midiNumber);
    }
  }

  stopAll() {
    for (let midiNumber in this.playingNotes) {
      this.stop(midiNumber);
    }
  }

  startRecording() {
    this._recorder = new Recorder({ context: this.audioContext });
    this._recorder.start();
    this.emit('startRecording');
  }

  stopRecording() {
    if (this._recorder) {
      this._recorder.stop();
    }
    this.emit('stopRecording');
  }

  addRecord({ midiNumber, time, duration }) {
    if (this._recorder) {
      this._recorder.add({ midiNumber, time, duration });
    }
  }

  startPlayback() {
    this.stopRecording();

    if (this._scheduler) {
      this._scheduler.stop();
      this._scheduler = null;
    }

    this._scheduler = new Scheduler({
      context: this.audioContext,
      record: this._recorder,
      player: this,
      onEnd: () => this.stopPlayback(),
    });
    this._scheduler.start();
    this.emit('startPlayback');
  }

  pausePlayback() {
    this.stopRecording();

    if (this._scheduler) {
      this._scheduler.pause();
    }
    this.stopAll();
  }

  resumePlayback() {
    this.stopRecording();

    if (this._scheduler) {
      this._scheduler.resume();
    }
  }

  stopPlayback() {
    this.stopRecording();

    if (this._scheduler) {
      this._scheduler.stop();
    }
    this.stopAll();
    this.emit('stopPlayback');
  }
}
