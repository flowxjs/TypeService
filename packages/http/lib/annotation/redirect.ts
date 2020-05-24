import Koa from 'koa';
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
      tap((value?: { url: string, status: number}) => {
        if (propertyRedirection) {
          let url = propertyRedirection.url, status = propertyRedirection.status || 302;
          if (value && value.url) url = value.url;
          if (value && value.status) status = value.status;
          context.status = status;
          return url && context.redirect(url);
        }
      }),
    );
  }
}
export function Redirect(): MethodDecorator;
export function Redirect(url: string): MethodDecorator;
export function Redirect(status: number): MethodDecorator;
export function Redirect(url?: string | number, status?: number): MethodDecorator {
  let _url: string | null = null, _status: number = 302;
  if (status === undefined) {
    if (typeof url === 'number') {
      _status = url;
    } else {
      _url = url;
    }
  } else {
    _url = url as string;
    _status = status;
  }
  return MethodMetaCreator.join(
    MethodMetaCreator.define(NAMESPACE.REDIRECT, { url: _url, status: _status }),
    useInterceptor(HttpRedirectInterceptor),
  );
}