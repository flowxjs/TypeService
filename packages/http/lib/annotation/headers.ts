import Koa from 'koa';
import { Observable } from '@reactivex/rxjs';
import { ParameterMetaCreator, TClassIndefiner, AnnotationDependenciesAutoRegister } from '@flowx/container';
import { THttpDefaultContext, HttpServerInjectable } from '../http';
import { PipeLineTransform } from '../transforms';

export function Headers(): ParameterDecorator;
export function Headers(key: string): ParameterDecorator;
export function Headers<C extends Koa.Context>(key: string, ...piper: TClassIndefiner<PipeLineTransform<any, any>>[]): ParameterDecorator;
export function Headers<C extends Koa.Context>(key?: string | TClassIndefiner<PipeLineTransform<string, any>>, ...piper: TClassIndefiner<PipeLineTransform<any, any>>[]) {
  if (piper && piper.length) {
    piper.forEach(pipe => AnnotationDependenciesAutoRegister(pipe, HttpServerInjectable));
  }
  return ParameterMetaCreator.define<C>(async ctx => {
    if (!key) return ctx.headers;
    if (typeof key === 'string') {
      if (!piper.length) return ctx.headers[key];
      const observable = Observable.of(ctx.headers[key]);
      const latObservable = piper.reduce((prev, next) => {
        return prev.pipe(source => {
          const target = HttpServerInjectable.get<PipeLineTransform<string, any>>(next);
          return target.transform(source);
        })
      }, observable);
      return await latObservable.toPromise();
    }
  })
}