export type query = {
  id?: number;
  system?: system;
  custom?: any;
  service?: any;
}

type system = {
  orderby?: order;
  filter?: filter;
  top?: number;
  skip?: number;
  inlineCount?: string;
  format?: string;
  select?: Array<string>;
  expand?: Array<expand>;
}

type expand = {
  value: string;
  valueName?: string;
}

export type order = {
  type?: boolean;
  value: string;
  categoryName?: string;
  category?: order;
}

 export type filter = {
  value: string;
  valueName?: string;
  operators?: Array<operator>;
  func?: func;
}

type operator = {
  type: string;
  name: string;
  logical?: string;
  value: string;
  isGroupped?: boolean;
}

type func = {
  value: string; // operator value
  name: string; //  operator name
  eqTo: string; // check on operator name's value equality to this))
}
