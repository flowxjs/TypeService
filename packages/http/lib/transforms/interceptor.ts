import * as Koa from 'koa';
import { Observable } from '@reactivex/rxjs';
import { switchMap, mergeAll } from 'rxjs/operators';
import { defer } from 'rxjs';
import { TAnnotationScanerMethod, TClassIndefiner } from '@flowx/container';
import { NAMESPACE } from '../annotation';
import { HttpServerInjectable, THttpDefaultContext } from '../http';
import { NotImplementedException } from '../exception';

export interface TInterceptorCallHandler<T = any> {
  /**
   * Returns an `Observable` representing the response stream from the route
   * handler.
   */
  handle(): Observable<T>;
}

export declare class HttpInterceptor<
  C extends Koa.Context,
  T = any, 
  R = any
> {
  intercept(
    context: C,
    next: TInterceptorCallHandler<T>,
  ): Observable<R> | Promise<Observable<R>>;
}

export class HttpInterceptorsConsumer<C extends Koa.ParameterizedContext<any, THttpDefaultContext>> {
  public async intercept(context: C, next: () => Promise<unknown>) {
    const method = context.metadata;
    const interceptors = this.getInterceptorIndefiners(method);
    const start$ = defer(() => this.transformDeffered(next));
    const nextFn = (i = 0) => async () => {
      if (i >= interceptors.length) {
        return start$;
      }
      const handler: TInterceptorCallHandler = {
        handle: () => Observable.fromPromise(nextFn(i + 1)()).pipe(mergeAll()),
      };
      const target = HttpServerInjectable.get<HttpInterceptor<C>>(interceptors[i]);
      if (!target) throw new NotImplementedException();
      return target.intercept(context, handler);
    };
    return this.transformToResult(await nextFn()());
  }

  private getInterceptorIndefiners(method: TAnnotationScanerMethod) {
    const parent = method.meta.parent;
    const classHttpIntercepts = parent.got(NAMESPACE.INTERCEPTOR, []);
    const propertyHttpIntercepts = method.meta.got(NAMESPACE.INTERCEPTOR, []);
    return [].concat(classHttpIntercepts).concat(propertyHttpIntercepts) as TClassIndefiner<HttpInterceptor<any, any, any>>[];
  }

  private transformDeffered(next: () => Promise<any>): Observable<any> {
    return Observable.fromPromise(next()).pipe(
      switchMap(res => {
        const isDeffered = res instanceof Promise || res instanceof Observable;
        return isDeffered ? res : Promise.resolve(res);
      }),
    );
  }

  private async transformToResult(resultOrDeffered: any) {
    if (resultOrDeffered && typeof resultOrDeffered.subscribe === 'function') {
      return resultOrDeffered.toPromise();
    }
    return resultOrDeffered;
  }
}