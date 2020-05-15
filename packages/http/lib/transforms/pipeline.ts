import { Observable } from '@reactivex/rxjs';

export declare class PipeLineTransform<T = any, R = any> {
  transform(source: Observable<T>): Observable<R>;
}