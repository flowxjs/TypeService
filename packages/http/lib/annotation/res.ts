import Koa from 'koa';
import { ParameterMetaCreator } from '@flowx/container';
export function Res<C extends Koa.Context>() {
  return ParameterMetaCreator.define<C>(ctx => ctx.res);
}