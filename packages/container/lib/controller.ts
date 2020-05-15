import { TAnnotationScanerResult } from './annotation/implement';
import { Context } from './context';
export class Controller<T extends { [key:string]: any }> {
  private readonly meta: TAnnotationScanerResult['meta'];
  private readonly methods: TAnnotationScanerResult['methods'];
  private readonly getServiceHandler: () => T;
  private _service: T;

  constructor(metaData: TAnnotationScanerResult, getServiceHandler: () => T) {
    this.meta = metaData.meta;
    this.methods = metaData.methods;
    this.getServiceHandler = getServiceHandler;
  }

  get Service() {
    if (!this._service) this._service = this.getServiceHandler();
    return this._service;
  }

  invoke<G extends any[]>(ctx: Context, method: keyof T, ...args: G) {
    if (!this.Service) throw new Error('Cannot find the service');
    if (typeof this.Service[method] !== 'function') throw new Error(`${method} is not a function, you cannot invoke it.`);
    // TODO: how to use meta for rxjs?
    const meta = this.methods.get(method as string);
    return this.Service[method](ctx, ...args);
  }
}