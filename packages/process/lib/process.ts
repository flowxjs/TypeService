import npmlog from 'npmlog';
import { Observable } from '@reactivex/rxjs';
import { EventEmitter } from '@flowx/events';

export * from './argv';

declare module 'npmlog' {
  interface Logger {
    success(prefix: string, message: string, ...additionalStuff: any[]): void;
  }
}

type TProcessSignal = 0 | [ 'SIGQUIT', 3 ] | [ 'SIGINT', 2 ] | [ 'SIGTERM', 15 ] | [string, number] | number;

export interface TLogger {
  silly(prefix: string, message: string, ...additionalStuff: any[]): void;
  info(prefix: string, message: string, ...additionalStuff: any[]): void;
  success(prefix: string, message: string, ...additionalStuff: any[]): void;
  warn(prefix: string, message: string, ...additionalStuff: any[]): void;
  error(prefix: string, message: string, ...additionalStuff: any[]): void;
}

let stoping = false;
export let ProcessLogger:TLogger = npmlog;
export const ProcessEvent = new EventEmitter();
export const ProcessSignalObservable = Observable.merge(
  ...['SIGINT', 'SIGTERM', 'SIGQUIT', 'beforeExit']
    .map(event => Observable.fromEvent<TProcessSignal>(process, event))
);

Object.defineProperty(npmlog, 'heading', {
  value: 'TypeService',
});

npmlog.addLevel('success', 3001, { fg: "green", bold: true });

/**
 * 进程退出事件流监听
 * @param callback 监听回调函数 
 * @example
 *  processExitBindingListener((signal$, next) => {
 *    return signal$.subscribe(signal => {
 *      return next(done => {
 *        // do something ...
 *        done();
 *      })
 *    })
 *  })
 */
export function ProcessExitBindingListener(
  callback: (
    signal$: Observable<TProcessSignal>, 
    next: (callback: (exit: (code?: number) => void) => void) => void
  ) => void
) {
  ProcessSignalObservable.subscribe(signal => ProcessEvent.cast('exit', signal));
  callback(ProcessEvent.on<TProcessSignal>('exit'), next => {
    if (stoping) return;
    stoping = true;
    next((code?: number) => process.exit(code || 0));
  });
}

export function ProcessShutDown() {
  ProcessEvent.cast('exit', ['SIGTERM', 15]);
}

export function useLogger<T extends TLogger>(logger: T) {
  ProcessLogger = logger;
}