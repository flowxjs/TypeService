import parseArgs from 'minimist';
import * as npmlog from 'npmlog';
export function ParseProcessArgv<T = {}>() {
  const argv = parseArgs<T>(process.argv.slice(2));
  npmlog.silly('argv', '%j', argv);
  return argv;
}