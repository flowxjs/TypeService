import * as Koa from 'koa';
import { HttpErrorException } from '../../lib';
import { THttpContext } from '../http.test';
import { injectable } from 'inversify';

@injectable()
export class logException implements HttpErrorException<Koa.ParameterizedContext<any,THttpContext>> {
  catch(ctx: Koa.ParameterizedContext<any, THttpContext>) {
    ctx.logger.error('HttpException', '', ctx.error.stack || ctx.error.message);
  }
}