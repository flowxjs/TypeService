import * as Router from 'find-my-way';
import { MethodMetaCreator } from '@flowx/container';
import { NAMESPACE } from './namespace';

export const Acl = HttpRequest('ACL');
export const Bind = HttpRequest('BIND');
export const Checkout = HttpRequest('CHECKOUT');
export const Connect = HttpRequest('CONNECT');
export const Copy = HttpRequest('COPY');
export const Delete = HttpRequest('DELETE');
export const Get = HttpRequest('GET');
export const Head = HttpRequest('HEAD');
export const Link = HttpRequest('LINK');
export const Lock = HttpRequest('LOCK');
export const Msearch = HttpRequest('M-SEARCH');
export const Merge = HttpRequest('MERGE');
export const Mkactivity = HttpRequest('MKACTIVITY');
export const Mkcalendar = HttpRequest('MKCALENDAR');
export const Mkcol = HttpRequest('MKCOL');
export const Move = HttpRequest('MOVE');
export const Notify = HttpRequest('NOTIFY');
export const Options = HttpRequest('OPTIONS');
export const Patch = HttpRequest('PATCH');
export const Post = HttpRequest('POST');
export const Propfind = HttpRequest('PROPFIND');
export const Proppatch = HttpRequest('PROPPATCH');
export const Purge = HttpRequest('PURGE');
export const Put = HttpRequest('PUT');
export const Rebind = HttpRequest('REBIND');
export const Report = HttpRequest('REPORT');
export const Search = HttpRequest('SEARCH');
export const Source = HttpRequest('SOURCE');
export const Subscribe = HttpRequest('SUBSCRIBE');
export const Trace = HttpRequest('TRACE');
export const Unbind = HttpRequest('UNBIND');
export const Unlink = HttpRequest('UNLINK');
export const Unlock = HttpRequest('UNLOCK');
export const Unsubscribe = HttpRequest('UNSUBSCRIBE');

function Request(method: Router.HTTPMethod, url: string) {
  return MethodMetaCreator.join(
    MethodMetaCreator.push(NAMESPACE.METHOD, method),
    MethodMetaCreator.define(NAMESPACE.PATH, url)
  )
}

function HttpRequest(method: Router.HTTPMethod) {
  return (url: string = '/') => Request(method, url);
}