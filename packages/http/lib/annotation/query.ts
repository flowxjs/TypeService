import Koa from 'koa';
import { Observable } from '@reactivex/rxjs';
import { ParameterMetaCreator, TClassIndefiner } from '@flowx/container';
import { HttpServerInjectable } from '../http';
import { PipeLineTransform } from '../transforms';
import { NAMESPACE } from './namespace';

export function Query(): ParameterDecorator;
export function Query(key: string): ParameterDecorator;
export function Query<C extends Koa.Context>(key: string, ...piper: TClassIndefiner<PipeLineTransform<any, any>>[]): ParameterDecorator;
export function Query<C extends Koa.Context>(key?: string | TClassIndefiner<PipeLineTransform<string, any>>, ...piper: TClassIndefiner<PipeLineTransform<any, any>>[]) {
  return ParameterMetaCreator.joinToParent(
    ParameterMetaCreator.pushToParent(NAMESPACE.INJECTABLE, ...piper),
    ParameterMetaCreator.define<C>(async ctx => {
      if (!key) return ctx.query;
      if (typeof key === 'string') {
        if (!piper.length) return ctx.query[key];
        const observable = Observable.of(ctx.query[key]);
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