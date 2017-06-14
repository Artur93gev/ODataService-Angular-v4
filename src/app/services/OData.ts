import { Injectable } from '@angular/core';

import { query, order } from '../models/OData';
import { STORE as store } from '../assets/js/ODataStore';

@Injectable()

export class OData {
    
  get(query: query) {
    return this.transform(query);
  }

  private resourcePath : string;
  private query: query;


  transform(options: query): string {
    if (options.system) {
      let query: string = '';
      
      if (options.id) {
        query = `(${options.id})?`;
      } else {
        query = '?';
      }

      const system = options.system;

      /* 'skip' system query parameter workflow
        
        skipping "N" elements from the beggining
        and starting selecting element from "N+1" index
        it needs an order by option either it will 
        order as follows th OData documentation
        (http://www.odata.org/documentation/odata-version-2-0/uri-conventions/)

      */

      if (system.skip) {
        if (typeof system.skip == 'number') {
          query = this.checkForAddingAmpersant(query);
          query +=`&$skip=${system.skip}`;
        } else {
          throw new Error(`skip property must be typeof number not ${typeof system.skip}`)
        }
      }

      /* 'top' system query parameter workflow
        
        first "N" elements selecting 
        it needs an order by option either it will 
        order as follows th OData documentation
        (http://www.odata.org/documentation/odata-version-2-0/uri-conventions/)
        
      */

      if (system.top) {
        if (typeof system.top == 'number') {
          query = this.checkForAddingAmpersant(query);
          query += `$top=${system.top}`;
        } else {
          throw new Error(`top property must be typeof number not ${typeof system.top}`)
        }
      }
      
      // order by functionality (default asc(increment))

      if (system.orderby) {
        query = this.checkForAddingAmpersant(query);
        query += this.order(system.orderby);
      }

      /* 'filter' system query parameter workflow
        
        filter option is for making logical or arethmatic 
        grouped or not grouped operations and functional operations on a query

        P.S. boolean function in filters are not supported

      */


      if (system.filter) {
        query = this.checkForAddingAmpersant(query);

        if (system.filter.func) {
          if (store.functions.indexOf(system.filter.func.name) != -1) {
            query += `$filter=${system.filter.func.name}(${system.filter.func.value}) eq ${system.filter.func.eqTo}`;
          } else {
            throw new Error(
              `system filter function property can't have ${system.filter.func.name} value`
            );
          }
        } else if (system.filter.operators) {
          query += `$filter=${system.filter.value}`;
          if (system.filter.valueName) {
            query += `/${system.filter.valueName}`;
          }

          for (let i = 0; i < system.filter.operators.length; i++) {

            //  check on logical operator existing and validation

            let logical: string;
            if (system.filter.operators[i].logical) {
              if (store.logical.indexOf(system.filter.operators[i].logical) != -1) {
                logical = system.filter.operators[i].logical;
              } else {
                throw new Error(`logical property can't have ${system.filter.operators[i].logical} value`);
              }
            } else {
              logical = '';
            }

            // check on compare operator existing 

            if (store.compare.indexOf(system.filter.operators[i].value) != -1) {
              query += ` ${system.filter.operators[i].name}`;
              if (i == system.filter.operators.length - 1) {
                break;
              }
              query += logical;
            } else {
              throw new Error(`comapre property can't have ${system.filter.operators[i].value} value`);
            }
          }
        } else {
          // throw new Error(`filter type can have 'function', 'expression' value not ${system.filter.type}`);
        }
      }

      /* 'select' system query property workflow

        this options is for selecting needed properties
        it can be used with '*'(asterix) symbol to select
        all available properties from class

        P.S. supported from OData v2.0.0

      */

      if (system.select) {

        query = this.checkForAddingAmpersant(query);

        query += `$select=`;
        for (let i = 0; i < system.select.length; i++) {
          query += `${system.select[i]}`;
          if (i == system.select.length - 1) {
            break;
          }
          query += ',';
        }
      }

      /* 'expand' system query parameter workflow
        
        expand option is for grabbing nested class
        to sleected class property

      */

      if (system.expand) {

        query = this.checkForAddingAmpersant(query);

        for (let i = 0; i < system.expand.length; i++) {
          query += `$expand=${system.expand[i].value}`;
          if (system.expand[i].valueName) {
            query += `/${system.expand[i].valueName}`;
          }
          if (i == system.expand.length - 1) {
            break;
          }
          query += ',';
        }
      }

      /* 'format' system query option

        this is for setting response data format

      */

      if (system.format) {

        query = this.checkForAddingAmpersant(query);

        if (store.format.indexOf(system.format) != -1) {
          query += `$format=${system.format}`;
        } else {
          throw new Error(`'format' can have 'json', 'xml' and 'atom' value not ${system.format}`);
        }
      }


      /* 'inlnieCount' system query property workflow

        this option is for selecting the count of selected items
        
        P.S. supported from OData v2.0.0

      */

      if (system.inlineCount) {

        query = this.checkForAddingAmpersant(query);

        if (store.inlineCount.indexOf(system.inlineCount) != -1) {
          query += `$inlinecount=${system.inlineCount}`;
        } else {
          throw new Error(`'inlinecount' can have 'allpages' and 'none' value not ${system.inlineCount}`);
        }
      }

      if (options.custom) {

      } else {
        console.info(`%cNo custom params founded in this query ${options}`, 'color:blue');
      }
      if (options.service) {
        console.info(`%cNo service params founded in this query ${options}`, 'color:blue');
      }
      return query;
    } else {
      throw new Error(
        `Cannot construct any OData query without 
        system query params.`
      );
    }
  }

  /* making order by query recoursivly

    this function is adding query params 
    for each item in order by config

  */

  protected order(data : order) {
    let query: string = '$orderby=';
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
        throw new Error(
          `category can't be specified without categoryName property
          ${data.category}`
        );
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
    return query[query.length - 1] == '?' ? query : query += '&';
  }
}
