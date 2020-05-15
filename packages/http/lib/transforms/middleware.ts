import * as Koa from 'koa';
import * as compose from 'koa-compose';
import { TClassIndefiner, TAnnotationScanerMethod } from '@flowx/container';
import { HttpServerInjectable } from '../http';
import { NotImplementedException } from '../exception';
import { NAMESPACE } from '../annotation';

export declare class HttpMiddleware<C extends Koa.Context> {
  use(context: C, next: Koa.Next): Promise<unknown>;
}

export class HttpMiddlewareConsumer<C extends Koa.Context, M extends HttpMiddleware<C>> {
  public async compose(ctx: C) {
    const method = ctx.metadata;
    const classModules = this.getMiddlewareIndefiners(method);
    const middlewares = classModules.map(classModule => {
      if ((classModule as TClassIndefiner<M>).prototype && (classModule as TClassIndefiner<M>).prototype.use) {
        return async (ctx: C, next: Koa.Next) => {
          const target = HttpServerInjectable.get<M>(classModule);
          if (!target) throw new NotImplementedException();
          await target.use(ctx, next);
        }
      }
      return classModule;
    });
    return compose(middlewares as compose.Middleware<C>[])(ctx);
  }

  private getMiddlewareIndefiners(method: TAnnotationScanerMethod) {
    const parent = method.meta.parent;
    const classHttpMiddlewares = parent.got(NAMESPACE.MIDDLEWARE, []);
    const propertyHttpMiddlewares = method.meta.got(NAMESPACE.MIDDLEWARE, []);
    return [].concat(classHttpMiddlewares).concat(propertyHttpMiddlewares) as (TClassIndefiner<M> | compose.Middleware<C>)[];
  }
}