import { TypeContainer, Context } from '../lib';
import { injectable, inject } from 'inversify';

const container = new TypeContainer(console);

const messageSubscription = container.useMessage();
// messageSubscription.unsubscribe();

@injectable()
class service2 {
  abc(a: number, b: number) {
    return a + b;
  }
}

@injectable()
class controller {
  @inject(service2) private readonly xyz: service2;

  sum(ctx: Context, a: number, b: number) {
    let i = 0;
    ctx.cast('message', 'now data is ' + i);
    const timer = setInterval(() => {
      if (i > 5) return clearInterval(timer);
      i++;
      ctx.cast('message', 'now data is ' + i);
    }, 1000);
    const result = this.xyz.abc(a, b);
    ctx.cast('result', result);
  }
}

container.useController(controller);

const [context, invoke] = container.useContext();
context.on<string>('message').subscribe(x => container.log('message: ' + x));
context.on<number>('result').subscribe(x => container.log('result: ' + x));
invoke(controller, 'sum', 1, 2);

container.bootstrap();