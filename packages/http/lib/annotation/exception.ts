import Koa from 'koa';
import { MethodMetaCreator, ClassMetaCreator, TClassIndefiner } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { HttpErrorException } from '../transforms';
import { useInject } from './inject';

export function useException<
  C extends Koa.Context,
  T extends HttpErrorException<C>
>(...args: TClassIndefiner<T>[]) {
  return <T>(target: Object, property?: string | symbol, descripor?: TypedPropertyDescriptor<T>) => {
    useInject(...args)(target, property, descripor);
    if (!property) {
      ClassMetaCreator.unshift(NAMESPACE.EXCEPTION, ...args)(target as Function);
    } else {
      MethodMetaCreator.unshift(NAMESPACE.EXCEPTION, ...args)(target, property, descripor);
    }
  }
}