import { injectable } from 'inversify';
import { PipeLineTransform } from '../transforms';
import { Observable } from '@reactivex/rxjs';
import { NotAcceptableException } from '../exception';

@injectable()
export class ParseIntegerPipe implements PipeLineTransform<string, number> {
  transform(source: Observable<string>) {
    return source.map<string, number>(value => {
      const isNumeric =
        ['string', 'number'].includes(typeof value) &&
        !isNaN(parseFloat(value)) &&
        isFinite(value as any);

      if (!isNumeric) {
        throw new NotAcceptableException(
          'Validation failed (numeric string is expected)',
        );
      }
      return parseInt(value, 10);
    })
  }
}