const TIME_INTERVAL = 50; // MS
const AHEAD_TIME = 0.1; // S

export default class Scheduler {
  static STATES = {
    STARTED: 0,
    PAUSED: 1,
    STOPPED: 2,
  };

  _PrevContextTime = 0;
  _PrevTime = 0;
  _interval = null;

  context = { currentTime: 0 };
  player = null;
  _state = null;

  constructor({ context, record, player, onEnd }) {
    this.context = context;
    this.record = record;
    this.player = player;
    this._state = Scheduler.STATES.STOPPED;
    this.onEnd = onEnd;
  }

  get state() {
    return this._state;
  }

  get prevTime() {
    return this._PrevTime;
  }

  start() {
    clearInterval(this._interval);
    this._interval = null;

    if (this._state !== Scheduler.STATES.STOPPED) return;
    this._state = Scheduler.STATES.STARTED;

    this._PrevContextTime = this.context.currentTime;

    this._PrevTime = 0;
    this._interval = setInterval(() => this._schedule(), TIME_INTERVAL);
  }

  pause() {
    clearInterval(this._interval);
    this._interval = null;

    if (this._state !== Scheduler.STATES.STARTED) return;
    this._state = Scheduler.STATES.PAUSED;
  }

  resume() {
    clearInterval(this._interval);
    this._interval = null;

    if (this._state !== Scheduler.STATES.PAUSED) return;
    this._state = Scheduler.STATES.STARTED;

    this._PrevContextTime = this.context.currentTime;
    this._interval = setInterval(() => this._schedule(), TIME_INTERVAL);
  }

  stop(withCallback) {
    clearInterval(this._interval);
    this._interval = null;

    if (this._state === Scheduler.STATES.STOPPED) return;
    this._state = Scheduler.STATES.STOPPED;

    if (withCallback) {
      this.onEnd?.();
    }
  }

  _schedule() {
    if (!this._interval || this._state === Scheduler.STATES.STOPPED) return;

    // Calculate current time of schedule.
    const currentTime = this._PrevTime + (this.context.currentTime - this._PrevContextTime);
    if (this.record.endTime < currentTime) {
      this.stop(true);
      return;
    }

    // Update _PrevContextTime
    this._PrevContextTime = this.context.currentTime;

    const nextRecords = this.record.filterRecordsWithRange(
      this._PrevTime,
      currentTime + AHEAD_TIME,
    );
    for (let record of nextRecords) {
      const { note, time, duration } = record;
      this.player.play(note, this.context.currentTime + (time - currentTime), {
        duration: duration,
      });
    }

    // Update prev time of schedule.
    this._PrevTime = currentTime;
  }
}
