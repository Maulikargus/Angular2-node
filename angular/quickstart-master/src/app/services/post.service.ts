import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Http, Response, Headers, RequestOptions} from "@angular/http";
import {Observable} from "rxjs/Rx";

@Injectable()
export class PostService{
    u:user;
    constructor(private http:Http){
        console.log("post service initialized");
    }

    getPosts()
    {
        return this.http.get('http://localhost:8080/rest/api/user/')
        .map(response=> response.json());
    }

    createUser(name:string,age:number,salary:number) {
        console.log(name,age,salary);
        this.u={
            name:name,
            age:age,
            salary:salary
        }
        
        
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        

        let body = JSON.stringify(this.u);
        console.log(body);
        return this.http.post('http://localhost:8080/rest/api/user/', body, options ).map((res: Response) => res).catch(this.handleError);
      }
      
      deleteFood(uid:String) {
        return this.http.delete('http://localhost:8080/rest/api/user/' + uid);
      }                
      private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }               
}

interface user{
    name:string;
    age:number;
    salary:number;
}