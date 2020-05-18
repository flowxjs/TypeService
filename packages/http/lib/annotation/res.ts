import Koa from 'koa';
import { ParameterMetaCreator } from '@flowx/container';
import { THttpDefaultContext } from '../http';
export function Res<C extends Koa.Context>() {
  return ParameterMetaCreator.define<C>(ctx => ctx.res);
}