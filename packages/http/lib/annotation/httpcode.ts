import Koa from 'koa';
import { MethodMetaCreator } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { injectable } from 'inversify';
import { HttpInterceptor, TInterceptorCallHandler } from '../transforms/interceptor';
import { tap } from 'rxjs/operators';
import { useInterceptor } from './interceptor';

@injectable()
export class HttpCodeInterceptor<C extends Koa.Context> implements HttpInterceptor<C> {
  intercept(context: C, next: TInterceptorCallHandler) {
    const metadata = context.metadata;
    const status = metadata.meta.got(NAMESPACE.HTTPCODE, 0);
    return next.handle().pipe(
      tap(() => {
        if (status && context.status === 404) {
          context.status = status;
        }
      }),
    );
  }
}

export function HttpCode(status: number = 200) {
  return MethodMetaCreator.join(
    MethodMetaCreator.define(NAMESPACE.HTTPCODE, status),
    useInterceptor(HttpCodeInterceptor),
  );
}


