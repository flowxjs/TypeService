import { inject } from 'inversify';
import { Controller, Get, Query, Http, HttpCode, Header, Redirect, ParseIntegerPipe, useException } from '../../lib';
import { TProcessArgv, THttpContext } from '../http.test';
import { UserController } from '../user/user.controller';
import { logException } from './error.exception';

@Controller()
@useException(logException)
export class HttpUserController {
  @inject('Http') private http: Http<THttpContext, TProcessArgv>;

  @Get()
  @HttpCode(201)
  @Header('evio', '123')
  // @Redirect('http://baidu.com')
  async sum(@Query('a', ParseIntegerPipe) a: string, @Query('b', ParseIntegerPipe) b: string) {
    return await this.http.portal(UserController, 'sum', a, b);
  }
}