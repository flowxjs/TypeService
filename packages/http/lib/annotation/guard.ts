import Koa from 'koa';
import { MethodMetaCreator, TClassIndefiner, AnnotationDependenciesAutoRegister } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { CanActivate } from '../transforms';
import { HttpServerInjectable } from '../http';
import { useInject } from './inject';
export function useGuard<
  C extends Koa.Context,
  T extends CanActivate<C>
>(...classModules: TClassIndefiner<T>[]) {
  return MethodMetaCreator.join(
    useInject(...classModules),
    MethodMetaCreator.unshift(NAMESPACE.GUARD, ...classModules)
  );
}