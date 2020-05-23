import Koa from 'koa';
import { MethodMetaCreator, ClassMetaCreator, TClassIndefiner, AnnotationDependenciesAutoRegister } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { HttpServerInjectable } from '../http';
import { HttpInterceptor } from '../transforms';

export function useInterceptor<
  C extends Koa.Context,
  T extends HttpInterceptor<C>
>(...args: TClassIndefiner<T>[]) {
  args.forEach(arg => AnnotationDependenciesAutoRegister(arg, HttpServerInjectable));
  return <T>(target: Object, property?: string | symbol, descripor?: TypedPropertyDescriptor<T>) => {
    if (!property) {
      ClassMetaCreator.unshift(NAMESPACE.INTERCEPTOR, ...args)(target as Function);
    } else {
      MethodMetaCreator.unshift(NAMESPACE.INTERCEPTOR, ...args)(target, property, descripor);
    }
  }
}