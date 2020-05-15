import { ClassMetaCreator } from '@flowx/container';
import { NAMESPACE } from './namespace';
import { injectable } from 'inversify';
export function Controller(url: string = '/') {
  return ClassMetaCreator.join(
    injectable(),
    ClassMetaCreator.define(NAMESPACE.PREFIX, url)
  );
}