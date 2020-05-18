import Koa from 'koa';
import { MethodMetaCreator } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { injectable } from 'inversify';
import { HttpInterceptor, TInterceptorCallHandler } from '../transforms/interceptor';
import { tap } from 'rxjs/operators';
import { THttpDefaultContext } from '../http';
import { useInterceptor } from './interceptor';

@injectable()
export class HttpHeaderInterceptor<C extends Koa.ParameterizedContext<any, THttpDefaultContext>> implements HttpInterceptor<C> {
  intercept(context: C, next: TInterceptorCallHandler) {
    const metadata = context.metadata;
    const propertyHttpHeaderSetters = metadata.meta.got<{key: string, value: string}[]>(NAMESPACE.HEADER, []);
    return next.handle().pipe(
      tap(() => propertyHttpHeaderSetters.forEach(({ key, value }) => context.set(key, value))),
    );
  }
}
export function Header(key: string, value: string) {
  return MethodMetaCreator.join(
    MethodMetaCreator.push(NAMESPACE.HEADER, { key, value }),
    useInterceptor(HttpHeaderInterceptor),
  );
}