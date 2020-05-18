import Koa from 'koa';
import { ParameterMetaCreator } from '@flowx/container';
export function Url<C extends Koa.Context>() {
  return ParameterMetaCreator.define<C>(ctx => ctx.url);
}