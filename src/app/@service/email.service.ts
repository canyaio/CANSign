import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

declare let require: any;

@Injectable()
export class EmailService {

  // appURL: string = 'http://localhost:4200' // localhost
  appURL: string = 'https://can-sign.firebaseapp.com' // dev
  // appURL: string = 'http://localhost:4200' // prod

  entryPoint = 'https://us-central1-can-sign.cloudfunctions.net';

  constructor(private http: Http) { }

  sendRequest(entryPoint: string, object: any) {
    console.log('sendRequest', object);

    return this.http.post(entryPoint, object)
      .toPromise()
      .then((res: any) => {
        console.log(JSON.parse(res._body));
      })
      .catch(error => console.log(error));
  }

  onAfterPublishing(document){
    document.routes.sign = `<a href="${this.appURL}/documents/${document.hash}/sign" style="background-color:#33ccff;border:1px solid #33ccff;border-radius:3px;color:#ffffff;display:inline-block;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif,sans-serif;font-size:16px;line-height:44px;text-align:center;text-decoration:none;width:150px;-webkit-text-size-adjust:none;mso-hide:all;">Sign Document</a>`;

    return this.sendRequest(`${this.entryPoint}/onAfterPublishing`, document);
  }

  onDocumentSigned(document){
    document.routes.sign = `<a href="${this.appURL}/documents/${document.hash}/sign" style="background-color:#33ccff;border:1px solid #33ccff;border-radius:3px;color:#ffffff;display:inline-block;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif,sans-serif;font-size:16px;line-height:44px;text-align:center;text-decoration:none;width:150px;-webkit-text-size-adjust:none;mso-hide:all;">See Document</a>`;

    return this.sendRequest(`${this.entryPoint}/onDocumentSigned`, document);
  }

}
