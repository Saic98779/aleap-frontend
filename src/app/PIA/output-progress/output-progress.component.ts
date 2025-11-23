import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
// Add these imports for PDF and image generation
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// import * as domtoimage from 'dom-to-image';
declare var bootstrap: any;

@Component({
  selector: 'app-output-progress',
  templateUrl: './output-progress.component.html',
  styleUrls: ['./output-progress.component.css']
})
export class OutputProgressComponent implements OnInit {

  loginsessionDetails: any;
      agencyId: any;
      programIds:any
      constructor(private fb: FormBuilder,
        private toastrService: ToastrService,
        private _commonService: CommonServiceService, private router: Router,) { 
          // sessionStorage.removeItem('selectAgecytoOutpuAchievements');
          this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
        }
    
      ngOnInit(): void {
        this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');  
        if(this.loginsessionDetails.userRole == 'ADMIN' || this.loginsessionDetails.userRole == 'SPIU'){
          this.getAgenciesList()
          this.getOutcomes()
        }
        else{
          this.selectedAgencyId=this.agencyId
          this.getAgenciesList()
          this.getOutcomes()
          // this.getProgramsByAgency()
        }
        setTimeout(() => {
          this.getDataBasedOnAgencyOutcome()
        }, 100);
        
       
      }
      selectedAgencyId:any='-1';
      agencyList:any;
      agencyListFiltered:any;
    getAgenciesList() {
      this.agencyList = [];
      this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
        this.agencyList = res.data;
        this.agencyListFiltered = this.agencyList;
        if(this.loginsessionDetails.userRole == 'ADMIN' || this.loginsessionDetails.userRole == 'SPIU'){
           if(Number(sessionStorage.getItem('selectAgecytoOutpuAchievements'))){
          this.selectedAgencyId=Number(sessionStorage.getItem('selectAgecytoOutpuAchievements'))
          this.selectedAgencyId=this.selectedAgencyId==-1?'-1':this.selectedAgencyId
         }
        else{
         this.selectedAgencyId = '-1'
        }
      }
        else{
          this.selectedAgencyId=this.agencyId
        }
        //  if(Number(sessionStorage.getItem('selectAgecytoOutpuAchievements'))){
        //   this.selectedAgencyId=Number(sessionStorage.getItem('selectAgecytoOutpuAchievements'))
        //   this.selectedAgencyId=this.selectedAgencyId==-1?'-1':this.selectedAgencyId
        //  }
        // else{
        //  this.selectedAgencyId = '-1'
        // }
        
        // this.getProgramsByAgencyAdmin(this.selectedAgencyId)

      }, (error) => {
        this.toastrService.error(error.error.message);
      });
    }
    agencyOutcomesListFiltered:any
    agencyOutcomesList:any;
    outcomeIds:any='-1'
      getOutcomes() {
      this.agencyOutcomesListFiltered = [];
      this.agencyOutcomesList = [];
      this._commonService.getDataByUrl(APIS.captureOutcome.getOutcomelistData).subscribe((res: any) => {
        this.agencyOutcomesList = res.data;
        this.agencyOutcomesListFiltered = this.agencyOutcomesList;
        this.outcomeIds = '-1'
        // this.getProgramsByAgencyAdmin(this.selectedAgencyId)
      }, (error) => {
        this.toastrService.error(error.error.message);
      });
    }
getagencynamebyid(id:any){
  let agencyname=this.agencyList.find((a:any)=>a.agencyId==id)
  return agencyname?agencyname.agencyName:''
}
getoutcomenamebyid(id:any){
  let outcomename=this.agencyOutcomesList.find((a:any)=>a.outcomeTableId==id)
  return outcomename?outcomename.outcomeTableDisplayName:''
}
getDataByAgencyOutcome:any=[]
allagencyOutcomedata:any=[]
headers:any=[]
 getDataBasedOnAgencyOutcome(){
  this.getDataByAgencyOutcome=[]
  this.allagencyOutcomedata=[]
  if(this.selectedAgencyId==-1 && this.outcomeIds==-1){
    this._commonService.getDataByUrl(APIS.captureOutcome.getOutputProgressData+this.selectedAgencyId+'?outcomeId='+this.outcomeIds).subscribe((res: any) => {
        this.getDataByAgencyOutcome = res.data;
         if(Object.keys(this.getDataByAgencyOutcome).length==0){
          this.toastrService.info('No data found for the selected Agency and Outcome.');
        }
        else{
          this.headers = this.getDataByAgencyOutcome[Object.keys(this.getDataByAgencyOutcome)[0]];
          this.allagencyOutcomedata=Object.keys(this.getDataByAgencyOutcome)
          
          
            console.log(this.getDataByAgencyOutcome, this.headers,this.allagencyOutcomedata)
        }
      }, (error) => {
        this.toastrService.error(error.error.message);
      });
  }
  else{
    this._commonService.getDataByUrl(APIS.captureOutcome.getOutputProgressData+this.selectedAgencyId+'?outcomeId='+this.outcomeIds).subscribe((res: any) => {
        this.getDataByAgencyOutcome = res.data;
        if(this.getDataByAgencyOutcome.length==0){
          this.toastrService.info('No data found for the selected Agency and Outcome.');
        }
        else{
          this.getDataByAgencyOutcome = this.getDataByAgencyOutcome.flat().filter((item: any) => Object.keys(item).length > 0);
            console.log(this.getDataByAgencyOutcome)
        }
      }, (error) => {
        this.toastrService.error(error.error.message);
      });
  }
     
 }
 redirectAchievements(){
  console.log(this.selectedAgencyId,'selectedAgencyId');
          sessionStorage.setItem('selectAgecytoOutpuAchievements',this.selectedAgencyId)
          this.router.navigate(['/financial-targets'])
        }

        // 
         @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

          downloadTableAsPDF(): void {
    const element = this.tableContainer.nativeElement;
    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 280; // A4 landscape width in mm minus margins
      const pageHeight = 200; // A4 landscape height in mm minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 10; // margin from top
      
      // Add title
      pdf.setFontSize(16);
      pdf.text('Output Progress Report', 140, position);
      position += 10;
      
      // Add current date
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 140, position);
      position += 10;
      
      // Add the table image
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add new pages if content exceeds one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename with timestamp
      const fileName = `output-progress-${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
      this.toastrService.success('PDF downloaded successfully!');
    }).catch((error) => {
      console.error('Error generating PDF:', error);
      this.toastrService.error('Error generating PDF. Please try again.');
    });
  }

  /**
   * Download table as PNG image
   */
  downloadTableAsImage(): void {
    const element = this.tableContainer.nativeElement;
    
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    }).then((canvas) => {
      // Create download link
      const link = document.createElement('a');
      link.download = `output-progress-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.toastrService.success('Image downloaded successfully!');
    }).catch((error) => {
      console.error('Error generating image:', error);
      this.toastrService.error('Error generating image. Please try again.');
    });
  }

  /**
   * Download table as JPEG image
   */
  // downloadTableAsJPEG(): void {
  //   const element = this.tableContainer.nativeElement;
    
  //   domtoimage.toJpeg(element, {
  //     quality: 0.95,
  //     bgcolor: '#ffffff',
  //     width: element.scrollWidth,
  //     height: element.scrollHeight
  //   }).then((dataUrl) => {
  //     const link = document.createElement('a');
  //     link.download = `output-progress-${new Date().getTime()}.jpeg`;
  //     link.href = dataUrl;
      
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
      
  //     this.toastrService.success('JPEG image downloaded successfully!');
  //   }).catch((error) => {
  //     console.error('Error generating JPEG:', error);
  //     this.toastrService.error('Error generating JPEG. Please try again.');
  //   });
  // }

  /**
   * Download table data as CSV
   */
  // downloadTableAsCSV(): void {
  //   let csvContent = '';
    
  //   if (this.outcomeIds == -1 && this.selectedAgencyId == -1) {
  //     // Handle the complex table structure for all agencies and outcomes
  //     const headers = ['S.No', 'Outcome Name'];
  //     this.headers.forEach((agency: any) => {
  //       headers.push(
  //         `${agency.agencyName} - Target`,
  //         `${agency.agencyName} - Participant Achievement`,
  //         `${agency.agencyName} - Influencer Achievement`,
  //         `${agency.agencyName} - Total`,
  //         `${agency.agencyName} - % Achievement`
  //       );
  //     });
  //     csvContent += headers.join(',') + '\n';
      
  //     this.allagencyOutcomedata.forEach((outcomeName: string, index: number) => {
  //       const row = [index + 1, `"${outcomeName}"`];
  //       this.getDataByAgencyOutcome[outcomeName].forEach((item: any) => {
  //         const total = (item.outComeParticipantAchievement || 0) + (item.outComeInfluencerAchievement || 0);
  //         const percentage = item.outComeTarget ? ((total / item.outComeTarget) * 100).toFixed(2) + '%' : '0%';
  //         row.push(
  //           item.outComeTarget || 0,
  //           item.outComeParticipantAchievement || 0,
  //           item.outComeInfluencerAchievement || 0,
  //           total,
  //           `"${percentage}"`
  //         );
  //       });
  //       csvContent += row.join(',') + '\n';
  //     });
  //   } else {
  //     // Handle the simple table structure
  //     const headers = ['S.No'];
  //     if (this.selectedAgencyId == -1 || this.outcomeIds != -1) headers.push('Agency Name');
  //     if (this.outcomeIds == -1 || this.selectedAgencyId != -1) headers.push('Outcome Name');
  //     headers.push('Outcome Target', 'Participant Achievement', 'Influencer Achievement', 'Total', '% Achievement');
      
  //     csvContent += headers.join(',') + '\n';
      
  //     this.getDataByAgencyOutcome.forEach((item: any, index: number) => {
  //       const row = [index + 1];
  //       if (this.selectedAgencyId == -1 || this.outcomeIds != -1) row.push(`"${item.agencyName}"`);
  //       if (this.outcomeIds == -1 || this.selectedAgencyId != -1) row.push(`"${item.outComeName}"`);
        
  //       const total = (item.outComeParticipantAchievement || 0) + (item.outComeInfluencerAchievement || 0);
  //       const percentage = item.outComeTarget ? ((total / item.outComeTarget) * 100).toFixed(2) + '%' : '0%';
        
  //       row.push(
  //         item.outComeTarget || 0,
  //         item.outComeParticipantAchievement || 0,
  //         item.outComeInfluencerAchievement || 0,
  //         total,
  //         `"${percentage}"`
  //       );
  //       csvContent += row.join(',') + '\n';
  //     });
  //   }
    
  //   // Create and download CSV file
  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const link = document.createElement('a');
  //   const url = URL.createObjectURL(blob);
  //   link.setAttribute('href', url);
  //   link.setAttribute('download', `output-progress-${new Date().getTime()}.csv`);
  //   link.style.visibility = 'hidden';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
    
  //   this.toastrService.success('CSV downloaded successfully!');
  // }

}


