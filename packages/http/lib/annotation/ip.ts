import * as Koa from 'koa';
import { ParameterMetaCreator } from '@flowx/container';
export function IP<C extends Koa.Context>() {
  return ParameterMetaCreator.define<C>(ctx => ctx.ip);
}