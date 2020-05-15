import * as Koa from 'koa';
import { MethodMetaCreator, ClassMetaCreator, TClassIndefiner, AnnotationDependenciesAutoRegister } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { HttpErrorException } from '../transforms';
import { HttpServerInjectable } from '../http';

export function useException<
  C extends Koa.Context,
  T extends HttpErrorException<C>
>(...args: TClassIndefiner<T>[]) {
  args.forEach(arg => AnnotationDependenciesAutoRegister(arg, HttpServerInjectable));
  return <T>(target: Object, property?: string | symbol, descripor?: TypedPropertyDescriptor<T>) => {
    if (!property) {
      ClassMetaCreator.unshift(NAMESPACE.EXCEPTION, ...args)(target as Function);
    } else {
      MethodMetaCreator.unshift(NAMESPACE.EXCEPTION, ...args)(target, property, descripor);
    }
  }
}