import * as Koa from 'koa';
import { Observable } from '@reactivex/rxjs';
import { ParameterMetaCreator, TClassIndefiner, AnnotationDependenciesAutoRegister } from '@flowx/container';
import { THttpDefaultContext, HttpServerInjectable } from '../http';
import { PipeLineTransform } from '../transforms';

export function Params(): ParameterDecorator;
export function Params(key: string): ParameterDecorator;
export function Params<C extends Koa.ParameterizedContext<any, THttpDefaultContext>>(key: string, ...piper: TClassIndefiner<PipeLineTransform<any, any>>[]): ParameterDecorator;
export function Params<C extends Koa.ParameterizedContext<any, THttpDefaultContext>>(key?: string | TClassIndefiner<PipeLineTransform<string, any>>, ...piper: TClassIndefiner<PipeLineTransform<any, any>>[]) {
  if (piper && piper.length) {
    piper.forEach(pipe => AnnotationDependenciesAutoRegister(pipe, HttpServerInjectable))
  }
  return ParameterMetaCreator.define<C>(async ctx => {
    if (!key) return ctx.params as any;
    if (typeof key === 'string') {
      if (!piper.length) return ctx.params[key] as any;
      const observable = Observable.of(ctx.params[key]);
      const latObservable = piper.reduce((prev, next) => {
        return prev.pipe(source => {
          const target = HttpServerInjectable.get<PipeLineTransform<any, any>>(next);
          return target.transform(source);
        });
      }, observable);
      return await latObservable.toPromise();
    }
  })
}