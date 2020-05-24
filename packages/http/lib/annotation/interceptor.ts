import Koa from 'koa';
import { MethodMetaCreator, ClassMetaCreator, TClassIndefiner } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { HttpInterceptor } from '../transforms';
import { useInject } from './inject';

export function useInterceptor<
  C extends Koa.Context,
  T extends HttpInterceptor<C>
>(...args: TClassIndefiner<T>[]) {
  return <T>(target: Object, property?: string | symbol, descripor?: TypedPropertyDescriptor<T>) => {
    useInject(...args)(target, property,descripor);
    if (!property) {
      ClassMetaCreator.unshift(NAMESPACE.INTERCEPTOR, ...args)(target as Function);
    } else {
      MethodMetaCreator.unshift(NAMESPACE.INTERCEPTOR, ...args)(target, property, descripor);
    }
  }
}