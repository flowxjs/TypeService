import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface TEventMessage {
  key: string;
  data?: any;
}

export class EventEmitter {
  private readonly stacks: Subject<TEventMessage> = new Subject<TEventMessage>();
  private separator = ':';

  private keyMatch(key: string, wildcard: string) {
    const w = '*';
    const ww = '**';

    let partMatch = (wl: string, k: string) => (wl === w) || (wl === k);

    const sep = this.separator;
    const kArr = key.split(sep);
    const wArr = wildcard.split(sep);

    const kLen = kArr.length;
    const wLen = wArr.length;
    const max = Math.max(kLen, wLen);

    for (let i = 0; i < max; i++) {
      let cK = kArr[i];
      let cW = wArr[i];

      if (cW === ww && (typeof cK !== 'undefined')) return true;
      if (!partMatch(cW, cK)) return false;
    }

    return true;
  }

  public cast(key: string, data?: any) {
    if (typeof key !== 'string' || !key.length) {
      throw new TypeError('key must be a string and mustn\'t be empty.');
    }

    this.stacks.next({ key, data });
  }

  public on<T>(key: string): Observable<T> {
    return this.stacks.asObservable().pipe(
      filter(event => this.keyMatch(event.key, key)),
      map(event => <T>event.data)
    );
  }
}