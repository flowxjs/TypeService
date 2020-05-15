import { injectable } from 'inversify';

@injectable()
export class UserService {
  sum(a: number, b: number) {
    return a + b;
  }
}