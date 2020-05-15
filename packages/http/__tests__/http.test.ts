import { TypeContainer } from '@flowx/container';
import { Http, THttpDefaultContext } from '../lib';
import { UserController } from './user/user.controller';
import { HttpUserController } from './http/user.controller';

export interface THttpContext extends THttpDefaultContext {};

const container = new TypeContainer();
const http = new Http<THttpContext>(container);

container.useController(UserController);
http.useController(HttpUserController);

container.bootstrap();