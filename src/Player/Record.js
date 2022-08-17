export class Record {
  constructor({ note, time, duration }) {
    this.note = note;
    this.time = time;
    this.duration = duration;
  }
}

export default class Recorder {
  records = [];

  startContextTime = 0;
  _EndTime = 0;
  onRecord = null;

  constructor({ context }) {
    this.context = context;
  }

  get endTime() {
    return this._EndTime;
  }

  get currentRecordTime() {
    return this.context.currentTime - this.startContextTime;
  }

  start() {
    console.log('Start Recording');
    this.startContextTime = this.context.currentTime;
    this.records = [];
    this.onRecord = true;
  }

  stop() {
    console.log('Stop Recording');
    if (this.onRecord) {
      this._EndTime = Math.max(...this.records.map((r) => r.time + r.duration));
    }
    this.onRecord = false;
  }

  add({ midiNumber, time, duration }) {
    if (this.onRecord) {
      this.records.push(
        new Record({
          note: midiNumber,
          time: time,
          duration: duration,
        }),
      );
    }
  }

  filterRecordsWithRange(startTime, endTime) {
    return this.records.filter(({ time, duration }) => startTime <= time && time < endTime);
  }
}
