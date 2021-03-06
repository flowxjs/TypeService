import Koa from 'koa';
import { Observable } from '@reactivex/rxjs';
import { ParameterMetaCreator, TClassIndefiner } from '@flowx/container';
import { THttpDefaultContext, HttpServerInjectable } from '../http';
import { PipeLineTransform } from '../transforms';
import { NAMESPACE } from './namespace';

export function Files(): ParameterDecorator;
export function Files<C extends Koa.ParameterizedContext<any, THttpDefaultContext>>(...piper: TClassIndefiner<PipeLineTransform<any, any>>[]) {
  return ParameterMetaCreator.joinToParent(
    ParameterMetaCreator.pushToParent(NAMESPACE.INJECTABLE, ...piper),
    ParameterMetaCreator.define<C>(async ctx => {
      const data = ctx.request.files;
      if (!piper.length) return data;
      const observable = Observable.of(data);
      const latObservable = piper.reduce((prev, next) => {
        return prev.pipe(source => {
          const target = HttpServerInjectable.get<PipeLineTransform<any, any>>(next);
          return target.transform(source);
        })
      }, observable);
      return await latObservable.toPromise();
    })
  )
}