import * as Koa from 'koa';
import * as compose from 'koa-compose';
import { ClassMetaCreator, MethodMetaCreator, AnnotationDependenciesAutoRegister, TClassIndefiner } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { HttpServerInjectable } from '../http';
import { HttpMiddleware } from '../transforms/middleware';
export function useMiddleware<
  C extends Koa.Context,
  M extends TClassIndefiner<HttpMiddleware<C>>
>(...args: (compose.Middleware<C> | M)[]) {
  args.forEach(arg => {
    if (arg.prototype && arg.prototype.use) {
      AnnotationDependenciesAutoRegister(arg as M, HttpServerInjectable);
    }
  });
  return <T>(target: Object, property?: string | symbol, descripor?: TypedPropertyDescriptor<T>) => {
    if (!property) {
      ClassMetaCreator.unshift(NAMESPACE.MIDDLEWARE, ...args)(target as Function);
    } else {
      MethodMetaCreator.unshift(NAMESPACE.MIDDLEWARE, ...args)(target, property, descripor);
    }
  }
}