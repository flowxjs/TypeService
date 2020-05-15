import * as Koa from 'koa';
import { ParameterMetaCreator } from '@flowx/container';
export function Ctx<C extends Koa.Context>() {
  return ParameterMetaCreator.define<C>(ctx => ctx);
}