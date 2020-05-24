import Koa from 'koa';
import compose from 'koa-compose';
import { ClassMetaCreator, MethodMetaCreator, TClassIndefiner } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { HttpMiddleware } from '../transforms/middleware';
import { useInject } from './inject';
export function useMiddleware<
  C extends Koa.Context,
  M extends TClassIndefiner<HttpMiddleware<C>>
>(...args: (compose.Middleware<C> | M)[]) {
  return <T>(target: Object, property?: string | symbol, descripor?: TypedPropertyDescriptor<T>) => {
    const classModules = args.filter(arg => arg.prototype && arg.prototype.use) as M[];
    useInject(...classModules)(target, property, descripor);
    if (!property) {
      ClassMetaCreator.unshift(NAMESPACE.MIDDLEWARE, ...args)(target as Function);
    } else {
      MethodMetaCreator.unshift(NAMESPACE.MIDDLEWARE, ...args)(target, property, descripor);
    }
  }
}