import Koa from 'koa';
import { MethodMetaCreator, TClassIndefiner, AnnotationDependenciesAutoRegister } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { CanActivate } from '../transforms';
import { HttpServerInjectable } from '../http';
export function useGuard<
  C extends Koa.Context,
  T extends CanActivate<C>
>(...classModules: TClassIndefiner<T>[]) {
  classModules.forEach(classModule => AnnotationDependenciesAutoRegister(classModule, HttpServerInjectable));
  return MethodMetaCreator.unshift(NAMESPACE.GUARD, ...classModules);
}