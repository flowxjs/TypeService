import 'minimist';
import { ProcessLogger } from '@flowx/process';
import { Observable, Observer } from '@reactivex/rxjs';
import { Container } from 'inversify';
import { TClassIndefiner, AnnotationMetaDataScan } from './annotation/implement';
import { Controller } from './controller';
import { Context } from './context';
import { 
  ProcessShutDown,
  ParseProcessArgv, 
  ProcessExitBindingListener,  
} from '@flowx/process';

export type TMessageData<T = any> = {
  method?: string,
  data: T,
}

export class TypeContainer<V = {}> {
  public  readonly processArgv = ParseProcessArgv<V>();
  private readonly initializers = new Set<Observable<any>>();
  private readonly terminaters = new Set<Observable<any>>();
  public readonly injection = new Container();
  private readonly controllers = new Map<TClassIndefiner<any>, Controller<any>>();
  constructor() {
    this.useExit();
  }

  static get logger() {
    return ProcessLogger;
  }
  
  get logger() {
    return ProcessLogger;
  }

  private useExit() {
    return ProcessExitBindingListener(
      (signal$, next) => 
        signal$.map(signal => Array.isArray(signal) ? signal[1] : signal).subscribe({
          next: signal => {
            const time = Date.now();
            this.logger.info('exit', 'receive code: %d', signal);
            next(done => {
              Observable.merge(...this.terminaters).subscribe({
                next: data => this.logger.info('exit', 'message: %o', data),
                error: (err: Error) => {
                  this.logger.error('exit', '%o', err.stack || err.message);
                  done(1);
                },
                complete: () => {
                  this.logger.success('exit', 'process exited in %dms', Date.now() - time);
                  done(0);
                },
              })
            });
          },
          error: (err: Error) => {
            this.logger.error('exit', '%o', err.stack || err.message);
            next(done => done(1));
          },
        })
    );
  }

  public useEffect<T = any, R = any>(callback: (observer: Observer<T>) => Observable<R> | undefined | null) {
    const observable: Observable<T> = Observable.create((observer: Observer<T>) => {
      const terminater = callback(observer);
      terminater && this.terminaters.add(terminater);
    });
    this.initializers.add(observable);
    return observable;
  }

  public useContext(callback?: (result: any) => void): [Context, <T extends {[key: string]:any}, G extends any[]>(controller: TClassIndefiner<T>, method: keyof T, ...args: G) => void] {
    const ctx = new Context();
    const compute = <T extends {[key: string]:any}, G extends any[]>(controller: TClassIndefiner<T>, method: keyof T, ...args: G) => {
      if (!this.controllers.has(controller)) throw new Error('Cannot find the controller');
      const controll = this.controllers.get(controller) as Controller<T>;
      controll.invoke<G>(ctx, method, ...args)
        .then(result => callback && callback(result));
    }
    return [ctx, compute];
  }

  public useController<T>(controller: TClassIndefiner<T>) {
    if (!this.controllers.has(controller)) {
      const metaData = AnnotationMetaDataScan(controller, this.injection);
      const controll = new Controller<T>(metaData, () => this.injection.get<T>(controller));
      this.controllers.set(controller, controll);
    }
    return this;
  }

  public bootstrap() {
    return Observable.merge(...this.initializers).subscribe({
      next: data => this.logger.info('bootstrap', '%o', data),
      error: (err: Error) => {
        this.logger.error('exit', '%o', err.stack || err.message);
        ProcessShutDown();
      }
    })
  }
}