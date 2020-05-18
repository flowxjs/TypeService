import Koa from 'koa';
import { Observable } from '@reactivex/rxjs';
import { TAnnotationScanerMethod, TClassIndefiner } from '@flowx/container';
import { NAMESPACE } from '../annotation';
import { HttpServerInjectable } from '../http';

export declare class HttpErrorException<C extends Koa.Context> {
  public catch(ctx: C): void | Promise<void> | Observable<unknown>;
}

export class HttpErrorExceptionConsumer<C extends Koa.Context> {
  async catch(ctx: C) {
    const method = ctx.metadata;
    const exceptions = this.getExceptorsIndefiners(method);
    for (let i = 0; i < exceptions.length; i++) {
      const exception = exceptions[i];
      const target = HttpServerInjectable.get<HttpErrorException<C>>(exception);
      await this.transformToResult(await target.catch(ctx));
    }
  }

  private getExceptorsIndefiners(method: TAnnotationScanerMethod) {
    const parent = method.meta.parent;
    const classHttpExceptors = parent.got(NAMESPACE.EXCEPTION, []);
    const propertyHttpExceptors = method.meta.got(NAMESPACE.EXCEPTION, []);
    return [].concat(propertyHttpExceptors).concat(classHttpExceptors) as TClassIndefiner<HttpErrorException<C>>[];
  }

  private async transformToResult(resultOrDeffered: any) {
    if (resultOrDeffered && typeof resultOrDeffered.subscribe === 'function') {
      return resultOrDeffered.toPromise();
    }
    return resultOrDeffered;
  }
}