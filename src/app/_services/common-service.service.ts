import { HttpClient,HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIS } from '@app/constants/constants';
import { catchError, forkJoin, map, Observable, Subject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonServiceService {
  navigateToRoute(arg0: string) {
    throw new Error('Method not implemented.');
  }

  constructor(private http: HttpClient) { }
  private formatErrors(error: HttpErrorResponse) {
    return throwError(() => error);
  }

   private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();

  triggerRefresh() {
    this.refreshSubject.next();
  }
  public changePassword(url:any,Payload:any) {     
    let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'responseType': 'json',
          userId: Payload?.userId,
          oldPassword: Payload?.oldPassword,
          newPassword: Payload?.newPassword
    });   
    return this.http.put<any>(url, { headers: headers },{}).pipe(catchError(this.formatErrors));
   
}


// file viewer data passing between components
  private fileSubject = new Subject<string>();
  file$ = this.fileSubject.asObservable();

  openFile(filePath: string) {
    this.fileSubject.next(filePath);
  }

  
  public add(URL: any, payload: any): Observable<any> {
    return this.http.post(URL, payload).pipe(catchError(this.formatErrors));
  }
   public addDownload(
  URL: string,
  payload: any,
  responseType: 'json' | 'blob' = 'json'
): Observable<any> {
  return this.http.post(URL, payload, {
    responseType: responseType as 'json'
  }).pipe(catchError(this.formatErrors));
}

    public addsave(URL: any, formData: any): Observable<any> {
       const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data',});
      return this.http.post(URL, formData,{headers}).pipe(catchError(this.formatErrors));
    }
    
  public updateChangedata(URL: any, payload: any,): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.put(URL,payload,{ headers }).pipe(catchError(this.formatErrors));
  }
  public update(URL: any, payload: any, id: number | string): Observable<any> {
    return this.http.put(URL + id, payload).pipe(catchError(this.formatErrors));
  }
  public updatedata(URL: any, payload: any,): Observable<any> {
    return this.http.put(URL, payload).pipe(catchError(this.formatErrors));
  }
   public patchData(URL: any, payload: any,): Observable<any> {
    return this.http.patch(URL, payload).pipe(catchError(this.formatErrors));
  }
  public getById(URL: any, id: any,): Observable<any> {
    return this.http.get(URL+id).pipe(catchError(this.formatErrors));
  }

  uploadImage(formData:any): Observable<any> {
    const url = APIS.programCreation.addSessions;
    return this.http.post(url, formData);
  }

  uploadImageSession(formData:any): Observable<any> {
    const url = APIS.programCreation.editSession;
    return this.http.post(url, formData);
  }

  uploadImageResource(url:any,formData:any): Observable<any> {   
    return this.http.post(url, formData);
  }

  deleteById(URL: any, id: any): Observable<any> {
    return this.http.post(URL + id,{},{ responseType: 'text' })
  }
  deleteId(URL: any, id: any): Observable<any> {
    return this.http.delete(URL + id).pipe(catchError(this.formatErrors));
  }
  public downloadFileUrl(url: string): Observable<any> {
    return this.http.get(url);
  }

  public downloadFile(url: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob'
    });
  }
//   public downloadFile(url: string): Observable<{blob: Blob, fileType: string}> {
//   return this.http.get(url, {
//     responseType: 'blob',
//     observe: 'response'
//   }).pipe(
//     map(response => ({
//       blob: response.body as Blob,
//       fileType: response.headers.get('content-type') || 'application/octet-stream'
//     })),
//     catchError(this.formatErrors)
//   );
// }
private options: { [key: string]: any } = {};

  setOption(key: string, value: any): void {
    this.options[key] = value;
  }

  getOption(key: string): any {
    return this.options[key];
  }
  public getDataByUrl(URL: any): Observable<any> {
    return this.http.get(URL).pipe(catchError(this.formatErrors));
  }
  getUserById(URL: any, id: any): Observable<any> {

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'responseType': 'json',
      userId: id,
  });
    return this.http.get(URL,{ headers: headers }).pipe(catchError(this.formatErrors)); 
  }

  userUpdateById(URL: any, id: any): Observable<any> {
    return this.http.post(URL,{...id}).pipe(catchError(this.formatErrors)); 
  }

  requestDataFromMultipleSources( url1:any, url2:any, fileData:any,sessionData:any): Observable<any[]> {    
    let response1 = this.http.post(url1, fileData).pipe(catchError(this.formatErrors));
    let response2=this.http.post(url2, sessionData).pipe(catchError(this.formatErrors));
    // sessionData.map((data:any)=>{ 
    //   console.log(data)
    //   let formData = new FormData();
    //   console.log(data.uploaFile,uploadFiles)
    //   // formData.set("files",data);
    //   if(uploadFiles.length==1){
    //     formData.append("files", uploadFiles);
    //   }
    //   else{
    //     uploadFiles.forEach((file:any) => {
    //       formData.append("files", file);
    //     })
    //   }
     
    //   delete data.uploaFile;
    //   formData.set("data", data);
    //   console.log(formData)
    //   response2 = this.http.post(url2,formData).pipe(catchError(this.formatErrors));
    // })
    
    // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
    return forkJoin([response1, response2]);
  }

  public ProgramsWithAgenciesData(url: string, agencyid: number): Observable<any> {  
    const fullUrl = `${url}${agencyid}`;
    return this.http.get<any>(fullUrl).pipe( 
      catchError(this.formatErrors.bind(this))
    );
  }
  updatebyPatch(URL: any, payload: any): Observable<any> {
    return this.http.patch(URL, payload).pipe(catchError(this.formatErrors));
  }
  
  
}


// api/agency/programs/1