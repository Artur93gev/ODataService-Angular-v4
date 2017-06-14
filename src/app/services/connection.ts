import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestMethod, Request } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Options }  from '../models/connection';
import { OData } from './OData';

@Injectable()

export class Connection {

  constructor(
    private http: Http,
    private OData: OData
  ) { }

  // private methods

  private hostUrl: string = "someUrl";

  server(obj: Options): Observable<any> {

    let query: string = '';

    if (obj.query) {
      query = this.OData.get(obj.query);
    }
    let helper: any = {
      method: RequestMethod[obj.method],
      url: this.hostUrl + obj.url + query
    }

    // headers deafult options

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if (obj.headersList) {
      for (let i = 0; i < obj.headersList.length; i++) {
        headers.append(obj.headersList[i][0], obj.headersList[i][1]);
      }
    }
    
    helper.headers = headers;
    if (obj.data) {
      helper.body = obj.data;
    }

    let options = new RequestOptions(helper);

    return this.http.request(new Request(options));
  }
}
