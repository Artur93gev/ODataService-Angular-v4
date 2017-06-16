import { Injectable } from '@angular/core';

import { query, order, filter } from '../models/OData';
import { STORE as store } from '../assets/js/ODataStore';

@Injectable()

export class OData {

  private queryParam: string = '';
    
  get(query?: query): any {
    if (query) {
      return this.transform(query);
    }
    return this.monad();
  }

  private monad() {
    let proto = Object.create(null);
    let query: string = '';

    let unity: any = () => {
      let configs = Object.create(proto);
      return configs;
    }

    let id = (val: number) => {
      query += this.checkForId(val);
      return unity;
    }
    
    let skip = (val: number) => {
      query += this.skip(val);
      return unity;
    }

    let top = (val: number) => {
      query += this.top(val);
      return unity;
    }

    let select = (arr: Array<string>) => {
      query += this.select(arr);
      return unity;
    }

    let filter = (option : filter) => {
      query += this.filter(option);
      return unity;
    }

    let inlineCount = (count: string) => {
      query += this.inlineCount(count);
      return unity;
    }

    let orderBy = (data: order) => {
      query += this.order(data);
      return unity;
    }

    let format = (format: string) => {
      query += this.format(format);
      return unity;
    }

    let expand = (expand: Array<any>) => {
      query += this.expand(expand);
      return unity;
    }


    unity.method = (name: string, action: any) => {
      proto[name] = action;
      unity[name] = action;
      return unity;
    }

    let then = (fn: any) => {
      return fn(query);
    }

    // let catch = (fn: any) => {

    // }

    unity.method('id', id)
        .method('select', select)
        .method('format', format)
        .method('expand', expand)
        .method('inlineCount', inlineCount)
        .method('filter', filter)
        .method('orderBy', orderBy)
        .method('top', top)
        .method('skip', skip)
        .method('then', then);

    return unity;
  }


  private transform(options: query): string {
    if (options.system) {

      this.queryParam = this.checkForId(options.id);

      const system = options.system;

      /* 'skip' system query parameter workflow
        
        skipping "N" elements from the beggining
        and starting selecting element from "N+1" index
        it needs an order by option either it will 
        order as follows th OData documentation
        (http://www.odata.org/documentation/odata-version-2-0/uri-conventions/)

      */

      if (system.skip) {
       
        this.queryParam += this.skip(system.skip);
      }

      /* 'top' system query parameter workflow
        
        first "N" elements selecting 
        it needs an order by option either it will 
        order as follows th OData documentation
        (http://www.odata.org/documentation/odata-version-2-0/uri-conventions/)
        
      */

      if (system.top) {
       
        this.queryParam += this.top(system.top);
      }
      
      // order by functionality (default asc(increment))

      if (system.orderby) {
        
        this.queryParam += this.order(system.orderby);
      }

      /* 'filter' system query parameter workflow
        
        filter option is for making logical or arethmatic 
        grouped or not grouped operations and functional operations on a query

        P.S. boolean function in filters are not supported

      */


      if (system.filter) {

        this.queryParam += this.filter(system.filter);
      }

      /* 'select' system query property workflow

        this options is for selecting needed properties
        it can be used with '*'(asterix) symbol to select
        all available properties from class

        P.S. supported from OData v2.0.0

      */

      if (system.select) {

        this.queryParam += this.select(system.select);
      }

      /* 'expand' system query parameter workflow
        
        expand option is for grabbing nested class
        to sleected class property

      */

      if (system.expand) {

        this.queryParam += this.expand(system.expand);
      }

      /* 'format' system query option

        this is for setting response data format

      */

      if (system.format) {

        this.queryParam += this.format(system.format);
      }


      /* 'inlnieCount' system query property workflow

        this option is for selecting the count of selected items
        
        P.S. supported from OData v2.0.0

      */

      if (system.inlineCount) {

        this.queryParam += this.inlineCount(system.inlineCount);
      }

      if (options.custom) {

        /*
          not implemented yet!
        */

      } else {
        console.info(`%cNo custom params founded in this query ${options}`, 'color:blue');
      }

      if (options.service) {

        /*
          not implemented yet!
        */

      } else {
        console.info(`%cNo service params founded in this query ${options}`, 'color:blue');
      }
      return this.queryParam;
    } else {
      this.errorHandler(`Cannot construct any OData query without system query params.`);
    }
  }

  /* making order by query recoursivly

    this function is adding query params 
    for each item in order by config

  */

  protected order(data : order) {
    let query: string = '';
    query += this.checkForAddingAmpersant(this.queryParam);
    query += '$orderby=';
    let type: string;

    if (data.type || (!data.type && !data.hasOwnProperty('type'))) {
      type = 'asc';
    } else {
      type = 'desc';
    }
    query += `${data.value} ${type}`;
    if (data.category) {
      if (data.categoryName) {
        query += `,${data.categoryName}/` + this.order(data.category);
      } else {
        this.errorHandler(`category can't be specified without categoryName property ${data.category}`);
      }
    } else {
      return query;
    }
  }


  /* First check

    this function is for adding an '&' symbol
    if the query parameter is not the first

  */

  protected checkForAddingAmpersant(query: string): string {
    return query[query.length - 1] == '?' ? '' : '&';
  }


  protected checkForId(id: number): string {
    return id ? `(${id})?` : '?';
  }

  protected skip(val : number): string {
    let query: string = '';
    query += this.checkForAddingAmpersant(this.queryParam);

    if (typeof val == 'number') {
      query += `$skip=${val}`;
      return query;
    } else {
      this.errorHandler(`skip property must be typeof number not ${typeof val}`);
    }
  }

  protected top(val: number): string {
    let query: string = '';
    query += this.checkForAddingAmpersant(this.queryParam);

    if (typeof val == 'number') {
      query += `$top=${val}`;
      return query;
    } else {
      this.errorHandler(`top property must be typeof number not ${typeof val}`)
    }
  }

  protected select(select: Array<string>): string {
    let query: string = '';
    query += this.checkForAddingAmpersant(this.queryParam);
    
    query += `$select=`;
    for (let i = 0; i < select.length; i++) {
      query += `${select[i]}`;
      if (i == select.length - 1) {
        return query;
      }
      query += ',';
    }
  }

  protected expand(expand: Array<any>): string {
    let query: string = '';
    query += this.checkForAddingAmpersant(this.queryParam);

    for (let i = 0; i < expand.length; i++) {
      query += `$expand=${expand[i].value}`;
      if (expand[i].valueName) {
        query += `/${expand[i].valueName}`;
      }
      if (i == expand.length - 1) {
        return query;
      }
      query += ',';
    }
  }

  protected format(format: string): string {
    let query: string = '';
    query += this.checkForAddingAmpersant(this.queryParam);

    if (this.storeChecker('format', format)) {
      query += `$format=${format}`;
      return query;
    } else {
      this.errorHandler(`'format' can have 'json', 'xml' and 'atom' value not ${format}`);
    }
  }

  protected inlineCount(inlineCount: string): string {
    let query: string = '';
    query += this.checkForAddingAmpersant(this.queryParam);

    if (this.storeChecker('inlineCount', inlineCount)) {
      query += `$inlinecount=${inlineCount}`;
      return query;
    } else {
      this.errorHandler(`'inlinecount' can have 'allpages' and 'none' value not ${inlineCount}`);
    }
  }

  protected filter(filter: filter): string {
    let query: string = '';
    query += this.checkForAddingAmpersant(this.queryParam);
    
    if (filter.func) {
      if (this.storeChecker('functions', filter.func.name)) {
        query += `$filter=${filter.func.name}(${filter.func.value}) eq ${filter.func.eqTo}`;
      } else {
        this.errorHandler(`system filter function property can't have ${filter.func.name} value`);
      }
    } else if (filter.operators) {
      query += `$filter=${filter.value}`;
      if (filter.valueName) {
        query += `/${filter.valueName}`;
      }

      for (let i = 0; i < filter.operators.length; i++) {

        //  check on logical operator existing and validation

        let logical: string;
        if (filter.operators[i].logical) {
          if (this.storeChecker('logical', filter.operators[i].logical)) {
            logical = filter.operators[i].logical;
          } else {
            this.errorHandler(`logical property can't have ${filter.operators[i].logical} value`);
          }
        } else {
          logical = '';
        }

        // check on compare operator existing 

        if (this.storeChecker('compare', filter.operators[i].value)) {
          query += ` ${filter.operators[i].name}`;
          if (i == filter.operators.length - 1) {
            break;
          }
          query += logical;
        } else {
          this.errorHandler(`comapre property can't have ${filter.operators[i].value} value`);
        }
      }
    } else {
      this.errorHandler(`filter type can have 'function', 'expression' value >> ${filter}`);
    }
    return query;
  }

  /*
    errorHandler
  */

  private errorHandler(message: string) {
    throw new Error(message);
  }

  protected storeCheck() {
    let monad = (store: any) => {
      let data = Object.create(null);
      data.get = (parameter: string, value: string) => {
        if (store[parameter]) {
          return store[parameter].indexOf(value) == -1 ? false : true;
        } else {
          this.errorHandler(`store you have does not include ${parameter} parameter`);
        }
      }
      return data;
    }
    return monad;
  }

  protected storeChecker(parameter: string, value: string) {
    let helper = this.storeCheck();
    let check = helper(store);
    return check.get(parameter, value);
  }
}
