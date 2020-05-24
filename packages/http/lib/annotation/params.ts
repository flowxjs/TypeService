import Koa from 'koa';
import { Observable } from '@reactivex/rxjs';
import { ParameterMetaCreator, TClassIndefiner } from '@flowx/container';
import { THttpDefaultContext, HttpServerInjectable } from '../http';
import { PipeLineTransform } from '../transforms';
import { NAMESPACE } from './namespace';

export function Params(): ParameterDecorator;
export function Params(key: string): ParameterDecorator;
export function Params<C extends Koa.ParameterizedContext<any, THttpDefaultContext>>(key: string, ...piper: TClassIndefiner<PipeLineTransform<any, any>>[]): ParameterDecorator;
export function Params<C extends Koa.ParameterizedContext<any, THttpDefaultContext>>(key?: string | TClassIndefiner<PipeLineTransform<string, any>>, ...piper: TClassIndefiner<PipeLineTransform<any, any>>[]) {
  return ParameterMetaCreator.joinToParent(
    ParameterMetaCreator.pushToParent(NAMESPACE.INJECTABLE, ...piper),
    ParameterMetaCreator.define<C>(async ctx => {
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
  )
}