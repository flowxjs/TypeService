import * as Koa from 'koa';
import { Observable } from '@reactivex/rxjs';
import { ParameterMetaCreator, AnnotationDependenciesAutoRegister, TClassIndefiner } from '@flowx/container';
import { THttpDefaultContext, HttpServerInjectable } from '../http';
import { PipeLineTransform } from '../transforms';

export function Body(): ParameterDecorator;
export function Body<
  C extends Koa.ParameterizedContext<any, THttpDefaultContext>, 
  R = any
>(...piper: TClassIndefiner<PipeLineTransform<any, any>>[]) {
  if (piper && piper.length) {
    piper.forEach(pipe => 
      AnnotationDependenciesAutoRegister(
        pipe, 
        HttpServerInjectable
      )
    );
  }
  return ParameterMetaCreator.define<C, R>(async ctx => {
    const data = ctx.request.body;
    if (!piper.length) return data as R;
    const observable = Observable.of(data);
    const latObservable = piper.reduce((prev, next) => {
      return prev.pipe(source => {
        const target = HttpServerInjectable.get<PipeLineTransform<any, any>>(next);
        return target.transform(source);
      })
    }, observable);
    return await latObservable.toPromise<R>();
  })
}