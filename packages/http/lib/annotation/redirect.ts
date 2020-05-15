import * as Koa from 'koa';
import { MethodMetaCreator } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { injectable } from 'inversify';
import { HttpInterceptor, TInterceptorCallHandler } from '../transforms/interceptor';
import { tap } from 'rxjs/operators';
import { THttpDefaultContext } from '../http';
import { useInterceptor } from './interceptor';

@injectable()
export class HttpRedirectInterceptor<C extends Koa.ParameterizedContext<any, THttpDefaultContext>> implements HttpInterceptor<C> {
  intercept(context: C, next: TInterceptorCallHandler) {
    const metadata = context.metadata;
    const propertyRedirection = metadata.meta.got<{url: string, status: number}>(NAMESPACE.REDIRECT);
    return next.handle().pipe(
      tap(() => {
        if (propertyRedirection) {
          let url = propertyRedirection.url, status = propertyRedirection.status || 302;
          if (context.body && context.body.url) url = context.body.url;
          if (context.body && context.body.status) status = context.body.status;
          context.status = status;
          return context.redirect(url);
        }
      }),
    );
  }
}

export function Redirect(url: string, status: number = 302) {
  return MethodMetaCreator.join(
    MethodMetaCreator.define(NAMESPACE.REDIRECT, { url, status }),
    useInterceptor(HttpRedirectInterceptor),
  );
}