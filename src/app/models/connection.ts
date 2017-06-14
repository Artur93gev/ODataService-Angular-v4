import { query } from './OData';

export class Options {
  method: string;
  url: string;
  query?: query;
  headersList?: Array<string[]>;
  data?: any;
}
