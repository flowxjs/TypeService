import { injectable } from 'inversify';
import { PipeLineTransform } from '../transforms';
import { Observable } from '@reactivex/rxjs';

@injectable()
export class ParseBooleanPipe implements PipeLineTransform<string, boolean> {
  transform(source: Observable<string>) {
    return source.map<string, boolean>(value => {
      switch (value) {
        case 'false': return false;
        case 'true': return true;
        default: return !!Number(value);
      }
    })
  }
}