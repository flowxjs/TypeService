import Koa from 'koa';
import path from 'path';
import http from 'http';
import Router from 'find-my-way';
import { TLogger } from '@flowx/process';
import { TypeContainer, TClassIndefiner, AnnotationMetaDataScan, TAnnotationScanerMethod, TypeServiceInjection, AnnotationDependenciesAutoRegister } from '@flowx/container';
import { Observable, Observer } from '@reactivex/rxjs';
import { NAMESPACE } from './annotation';
import { HttpInterceptorsConsumer, HttpGuardConsumer, HttpMiddlewareConsumer, HttpErrorExceptionConsumer } from './transforms';
import { ForbiddenException, NotFoundException, ServiceUnavailableException, HttpException, BadRequestException } from './exception';

export const HttpServerInjectable = TypeServiceInjection;

export interface THttpArguments { 
  port?: number, 
  host?: string,
  ignoreTrailingSlash?: boolean,
  allowUnsafeRegex?: boolean,
  caseSensitive?: boolean,
  maxParamLength?: number,
};
export interface THttpDefaultContext extends Koa.DefaultContext {
  error: HttpException,
  readonly params: { [key: string]: string },
  readonly metadata: TAnnotationScanerMethod,
  readonly logger: TLogger,
  readonly portal: <R, T>(classModule: TClassIndefiner<T>, method: keyof T, ...args: any[]) => Promise<R>;
  readonly request: {
    files?: {[key: string]: any},
    body?: {[key: string]: any},
  }
}

export class Http<C extends THttpDefaultContext = THttpDefaultContext, V = {}> extends Koa<Koa.DefaultState, THttpDefaultContext> {
  public readonly container: TypeContainer<V & THttpArguments>;
  private server: http.Server;
  private readonly router: Router.Instance<Router.HTTPVersion.V1>;
  constructor(container: TypeContainer<V & THttpArguments>) {
    super();
    this.container = container;
    this.router = Router({
      ignoreTrailingSlash: this.container.processArgv.ignoreTrailingSlash,
      allowUnsafeRegex: this.container.processArgv.allowUnsafeRegex,
      caseSensitive: this.container.processArgv.caseSensitive,
      maxParamLength: this.container.processArgv.maxParamLength,
    });
    this.container.useEffect<string, string>((observer) => {
      this.useRouter();
      this.createServer(observer);
      return Observable.create((observer: Observer<string>) => {
        this.server.close();
        observer.next(`http://${this.container.processArgv.host || '0.0.0.0'}:${this.container.processArgv.port || 8080}`);
        observer.complete();
      });
    });
    Object.defineProperties(this.context, {
      logger: { get: () => this.logger, },
      portal: { get: () => this.portal.bind(this), },
    });
    HttpServerInjectable.bind('Http').toConstantValue(this);
  }

  get logger() {
    return this.container.logger;
  }

  private useRouter() {
    this.use(async (ctx, next) => {
      await Promise.resolve(this.router.lookup(ctx.req, ctx.res, ctx));
      await next();
    });
  }

  private createServer(observer: Observer<string>) {
    const server = http.createServer(this.callback());
    const port = Number(this.container.processArgv.port || 8080);
    const host = this.container.processArgv.host || '0.0.0.0';
    server.listen(port, host, (err?: Error) => {
      if (err) return observer.error(err);
      this.server = server;
      observer.next(`http://${host}:${port}`);
      observer.complete();
    });
  }

  public portal<R, T>(classModule: TClassIndefiner<T>, method: keyof T, ...args: any[]) {
    return new Promise<R>((resolve, reject) => {
      const [context, invoke] = this.container.useContext((result: R) => context.cast('http:body', result));
      context.on<R>('http:body').subscribe(resolve, reject);
      invoke(classModule, method, ...args);
    });
  }

  public useController<T>(classModule: TClassIndefiner<T>) {
    this.container.setup(async () => this.compileController(classModule));
    return this;
  }

  private injectClassModules(...classModules: TClassIndefiner<any>[]) {
    classModules.forEach(classModule => AnnotationDependenciesAutoRegister(classModule, HttpServerInjectable));
    return this;
  }

  private compileController<T>(classModule: TClassIndefiner<T>) {
    const classMetadata = AnnotationMetaDataScan(classModule, HttpServerInjectable);
    const classPrefix = classMetadata.meta.got<string>(NAMESPACE.PREFIX, '/');
    const classInjectors = classMetadata.meta.got<TClassIndefiner<any>[]>(NAMESPACE.INJECTABLE, []);
    this.injectClassModules(...classInjectors);
    for (const [key, method] of classMetadata.methods) {
      const propertyMethods = method.meta.got<Router.HTTPMethod[]>(NAMESPACE.METHOD, []);
      if (!propertyMethods.length) continue;
      const propertyPath = method.meta.got<string>(NAMESPACE.PATH, '/');
      const propertyEntryPath = path.join(classPrefix, '.', propertyPath);
      const propertyInjectors = method.meta.got<TClassIndefiner<any>[]>(NAMESPACE.INJECTABLE, []);
      this.injectClassModules(...propertyInjectors);
      this.logger.info(propertyMethods.join(','), '+ %s', propertyEntryPath);
      this.router.on(propertyMethods, propertyEntryPath, async function(req, res, params) {
        const ctx: Koa.ParameterizedContext<any, C> = this;
        Object.defineProperties(ctx, {
          params: { get: () => params, },
          metadata: { get: () => method, },
        });
        try {
          const server = HttpServerInjectable.get(classModule);
          if (!server) throw new BadRequestException();
          // Middleware resolver
          const middlewareConsumer = new HttpMiddlewareConsumer();
          await middlewareConsumer.compose(ctx);
          // PipeLine resolver.
          const parameters = await method.parameter.exec(ctx);
          // Guard resolver.
          const guardContext = new HttpGuardConsumer();
          const canActive = await guardContext.tryActivate(ctx);
          if (!canActive) throw new ForbiddenException();
          if (!server[key]) throw new NotFoundException('cannot find the method of ' + key + ' on Controller');
          // Interceptor resolver.
          const interceptorsConsumer = new HttpInterceptorsConsumer();
          ctx.body = await interceptorsConsumer.intercept(ctx, () => Promise.resolve(server[key](...parameters)));
        } catch(e) {
          const err = e instanceof HttpException ? e : new ServiceUnavailableException(e.message);
          ctx.status = err.getStatus();
          ctx.body = err.message;
          ctx.error = err;
          const httpErrorExceptionConsumer = new HttpErrorExceptionConsumer();
          await httpErrorExceptionConsumer.catch(ctx);
        }
      });
    }
  }
}