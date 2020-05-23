import Koa from 'koa';
import { TClassIndefiner, TAnnotationScanerMethod } from '@flowx/container';
import { Observable } from '@reactivex/rxjs';
import { HttpServerInjectable } from '../http';
import { NotAcceptableException } from '../exception';
import { NAMESPACE } from '../annotation';

export declare class CanActivate<C extends Koa.Context> {
  canActivate(context: C): boolean | Promise<boolean> | Observable<boolean>;
}

export class HttpGuardConsumer<C extends Koa.Context> {
  public async tryActivate(ctx: C) {
    const method = ctx.metadata;
    const classModules = this.getGuardIndefiners(method);
    for (let i = 0; i < classModules.length; i++) {
      const classModule = classModules[i];
      const guard = HttpServerInjectable.get(classModule);
      if (!guard) throw new NotAcceptableException('pipe is not register on controller');
      const result = guard.canActivate(ctx) as boolean | Promise<boolean> | Observable<boolean>;
      if (await this.pickResult(result)) continue;
      return false;
    }
    return true;
  }

  private getGuardIndefiners(method: TAnnotationScanerMethod) {
    const parent = method.meta.parent;
    const classHttpGuarders = parent.got(NAMESPACE.GUARD, []);
    const propertyHttpGuarders = method.meta.got(NAMESPACE.GUARD, []);
    return [].concat(classHttpGuarders).concat(propertyHttpGuarders) as TClassIndefiner<CanActivate<C>>[];
  }

  private async pickResult(result: boolean | Promise<boolean> | Observable<boolean>): Promise<boolean> {
    if (result instanceof Observable) {
      return result.toPromise();
    }
    return result;
  }
}