import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
declare var bootstrap: any;
@Component({
  selector: 'app-attentance-participant',
  templateUrl: './attentance-participant.component.html',
  styleUrls: ['./attentance-participant.component.css']
})
export class AttentanceParticipantComponent implements OnInit,AfterViewInit {
  loginsessionDetails: any;
  agencyId: any;
  programIds:any
  Role :any='';
  constructor(private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService, private router: Router,) { 
      this.Role=JSON.parse(sessionStorage.getItem('user') || '{}').userRole;
      this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    }

    ngOnInit(): void {
      this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');  
      this.getProgramsByAgency()
    }

    ngAfterViewInit(): void {
      
    }

    agencyProgramList: any;
    agencyProgramListFiltered: any;
    getProgramsByAgency() {
      this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyStatus+'/'+(this.loginsessionDetails.agencyId?this.loginsessionDetails.agencyId:this.agencyId)+'?status=Participants Added'}`).subscribe({
        next: (res: any) => {
          this.agencyProgramList = res?.data
          this.agencyProgramListFiltered = res?.data;
          if(res?.data?.length){
            this.programIds = this.agencyProgramList[0].programId
            this.getData()
          }else{
            this.ParticipantAttendanceData = ''
            this.programIds = ''
          }
          
        },
        error: (err) => {
          new Error(err);
        }
      })
    }
    dropdownProgramsList(event: any, type: any) {
      this.ParticipantAttendanceData = ''
      this.programIds = event.value
      if (type == 'table' && event.value) {
        this.getData()
      }
    }
    ParticipantAttendanceData:any
    getData() {
      this.ParticipantAttendanceData = ''
     
      this._commonService.getById(APIS.Attendance.getDeatails, this.programIds).subscribe({
        next: (res: any) => {          
          this.ParticipantAttendanceData = res?.data   
          this.ParticipantAttendanceData.participantAttendanceList=this.getparticipantAttendanceList(res?.data?.participantAttendanceList)
          //this.reinitializeDataTable();    
             
          // this.advanceSearch(this.getSelDataRange);
          // modal.close()
  
        },
        error: (err) => {
          this.toastrService.error(err.message, "Participant Data Error!");
          new Error(err);
        },
      });
      // console.log(this.ParticipantAttentance)
    }
    dataTable: any;
    reinitializeDataTable() {
      if (this.dataTable) {
        this.dataTable.destroy();
      }
      setTimeout(() => {
        this.initializeDataTable();
      }, 0);
    }
  
    initializeDataTable() {
      this.dataTable = new DataTable('#attendance-table', {        
        scrollY: "415px",
        scrollX: true,
        scrollCollapse: true,
        autoWidth: true,
        paging: false,
        info: false,
        searching: false,
        destroy: true, // Ensure reinitialization doesn't cause issues        
      });
      if (this.dataTable) {
        setTimeout(() => {
            this.dataTable.columns.adjust();
        }, 0);
      }
    }

    // Add this method to your component
    getAttendanceHeaders() {
      if (this.ParticipantAttendanceData?.participantAttendanceList?.length) {
          return this.ParticipantAttendanceData.participantAttendanceList[0]?.attendanceData || [];
      }
      return [];
    }
    getparticipantAttendanceList(data1:any){
      let participantAttendanceList:any=[]
      
      data1?.forEach((data:any,index:any)=>{
        let attendanceData1:any=[]
        data?.attendanceData?.forEach((item:any,index:any)=>{
          let attendanceData:any={}
          attendanceData[index]=item
          attendanceData1.push(attendanceData)
        })
        data['percentage'] = ((data?.attendanceData?.filter((item:any)=>item=='P')?.length/data?.attendanceData?.length)*100).toFixed(2)
        data['attendanceData1']=attendanceData1
      })
     
      console.log(data1,'srk')
      return data1

    }
    editAllTable: boolean=false;
    editAll(type?: string, item?: any) {
      console.log(type,item)
      this.editAllTable=true
      
    }
    closeAll(){
      this.editAllTable=false
      this.getData() 
    }
    valuesfromObject(data:any) {
     let values= data.map((obj:any) => {
        const key = Object.keys(obj)[0]; // Get the first (and only) key
        return obj[key];
      
    })
    return values
  }
    saveAll(data:any){
      console.log(data)
      let payload:any={}
      let participantAttendanceList:any=[]
      data.forEach((item:any)=>{
        console.log(Object.values(item?.attendanceData1),'ibject')
       
        item.attendanceData=this.valuesfromObject(item?.attendanceData1)
        participantAttendanceList.push({"participantId": item?.participantId,"attendanceData": item?.attendanceData})
        // item.attendanceData=Object.values(item?.attendanceData1)?.length
      })
       payload={
      "programId": this.programIds,
      "participantAttendanceList":participantAttendanceList
      }
      this._commonService.add(APIS.Attendance.saveAttendance,payload).subscribe({
        next: (data: any) => {
          if(data.message){
            this.toastrService.success('Participant Attendance Details  Updated Successfully', 'Success');
            this.editAllTable=false
            this.getData() 
          }
         
        },
        error: (err) => {
          console.error('Error loading agencies:', err);
        }
      });
    }
    chnages(data:any,val:any,index:any,vali:any){
      console.log(data,val,index,'srk',vali)
    }

    sessionSubmissionFinal() {
        let data = {}
        this._commonService.add(`${APIS.programCreation.updateSessionByStatus}${this.programIds}?status=Attendance Marked`, data).subscribe({
          next: (data: any) => {
            console.log('Response from API:', data);
            this.toastrService.success('Participants Details Submitted Successfully', "");
            this.closeConfirmSession();
            this.ParticipantAttendanceData = ''
            this.getProgramsByAgency()
          },
          error: (err: any) => {
            this.closeConfirmSession();        
            this.toastrService.error("Something unexpected happened!!");
            new Error(err);
          },
        });    
        }
    
        closeConfirmSession() {
        const editSessionModal = document.getElementById('exampleModalDeleteConfirm');
        if (editSessionModal) {
          const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
          modalInstance.hide();
        }
      }
}
