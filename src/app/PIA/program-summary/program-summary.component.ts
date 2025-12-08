import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ImageService } from '../../_services/image.service';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-program-summary',
  templateUrl: './program-summary.component.html',
  styleUrls: ['./program-summary.component.css']
})
export class ProgramSummaryComponent implements OnInit {
  loginsessionDetails: any;
  agencyId: any;
  programIds:any
  currentRating: number = 3.5;
  posts: any[] = []; 
  paginatedPosts: any[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  showAllRows: boolean = false;
  showPagination: boolean = true;
  collageImages: any[]=[];
  filteredImages: any[] = [];
  programCollageImage: string = '';
  
  constructor(private fb: FormBuilder,
    private toastrService: ToastrService,
    private imageService: ImageService,
    private _commonService: CommonServiceService, private router: Router,) { 
      this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    }

    ngOnInit(): void {
      this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');  
      if(this.loginsessionDetails.userRole == 'ADMIN' || this.loginsessionDetails.userRole == 'SPIU') {
        this.getAgenciesList()
        
      }
      else{
        this.getProgramsByAgency( this.agencyId )
      }  
      this.loadCollageImages();
    }
    agencyList: any;  
    agencyListFiltered:any;
    getAgenciesList() {
      this.agencyList = [];
      this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
        this.agencyList = res.data;
        this.agencyListFiltered=this.agencyList
        this.getProgramsByAgency(res.data[0].agencyId);
      }, (error) => {
        this.toastrService.error(error.error.message);
      });
    }
    agencyProgramList: any;
    agencyProgramListFiltered:any;
      getProgramsByAgency(agency:any) {
        console.log("Agency ID:", agency);
        this.agencyId=agency
        this.imageService.getPrograms(this.loginsessionDetails.agencyId?this.loginsessionDetails.agencyId:this.agencyId).subscribe(
          (res) => {
            this.PrigramSummaryData = {}
            this.agencyProgramList = res.data.filter(
              (program: any) =>
                program.status === 'Program Execution Updated' ||
                program.status === 'Program Expenditure Updated'
            );
            this.agencyProgramListFiltered=this.agencyProgramList

            this.programIds = this.agencyProgramList[0].programId;
              this.getParticipantsByProgramID(this.programIds)
              this.setProgramCollageImage(this.programIds);
              this.getData()
            console.log('Filtered programs:', this.agencyProgramList);
          },
          (err) => {
            console.error('Error fetching programs:', err);
          }
        );
        // this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyStatus+'/'+(this.loginsessionDetails.agencyId?this.loginsessionDetails.agencyId:this.agencyId)+'?status=Program Execution Updated'}`).subscribe({
        // // this._commonService.add(`${APIS.programCreation.updateSessionByStatus}${this.programCreationMain.value.programId}?status=Program Expenditure Updated`, data).subscribe({
        //       next: (res: any) => {
        //     this.PrigramSummaryData = {}
        //     this.agencyProgramList = res?.data
        //     if(res.data?.length){
              
        //     }
           
          
        //   },
        //   error: (err) => {
        //     new Error(err);
        //   }
        // })
        
      }
      PrigramSummaryData:any
      dropdownProgramsList(event: any, type: any) {
        this.PrigramSummaryData = {}
        this.programIds = event.value;
        this.getParticipantsByProgramID(this.programIds);
        this.setProgramCollageImage(this.programIds);
        console.log("program id:",this.programIds);
        if (type == 'table' && event.value) {
          this.getData()
        }
      }
      getData() {
        this.PrigramSummaryData ={}
        this._commonService.getById(APIS.programSummary.getProramData, this.programIds).subscribe({
          next: (res: any) => {          
            // this.PrigramSummaryData = res?.data   
          console.log( this.PrigramSummaryData)
          this.PrigramSummaryData = res?.data
          this.PrigramSummaryData['scPercentage'] = this.CalculatePercentage(this.PrigramSummaryData, this.PrigramSummaryData['sc'])
          this.PrigramSummaryData['stPercentage'] = this.CalculatePercentage(this.PrigramSummaryData, this.PrigramSummaryData['st'])
          this.PrigramSummaryData['obcPercentage'] = this.CalculatePercentage(this.PrigramSummaryData, this.PrigramSummaryData['obc'])
          this.PrigramSummaryData['ocPercentage'] = this.CalculatePercentage(this.PrigramSummaryData, this.PrigramSummaryData['oc'])
          this.PrigramSummaryData['bcPercentage'] = this.CalculatePercentage(this.PrigramSummaryData, this.PrigramSummaryData['bc'])
          this.PrigramSummaryData['minoritiesPercentage'] = this.CalculatePercentage(this.PrigramSummaryData, this.PrigramSummaryData['minorities'])
          this.PrigramSummaryData['malePercentage']=this.CalculateGenderPercentage(this.PrigramSummaryData,this.PrigramSummaryData['male'])
          this.PrigramSummaryData['femalePercentage']=this.CalculateGenderPercentage(this.PrigramSummaryData,this.PrigramSummaryData['female'])
          this.PrigramSummaryData['transeGenderPercentage']=this.CalculateGenderPercentage(this.PrigramSummaryData,this.PrigramSummaryData['transgender'])
          this.PrigramSummaryData['noOfSHGsPercentage'] = this.CalculateOragnizationPercentage(this.PrigramSummaryData, this.PrigramSummaryData['noOfSHGs'])
          this.PrigramSummaryData['noOfMSMEsPercentage'] = this.CalculateOragnizationPercentage(this.PrigramSummaryData, this.PrigramSummaryData['noOfMSMEs'])
          this.PrigramSummaryData['noOfStartupsPercentage'] = this.CalculateOragnizationPercentage(this.PrigramSummaryData, this.PrigramSummaryData['noOfStartups'])
          this.PrigramSummaryData['noOfAspirantsPercentage'] = this.CalculateOragnizationPercentage(this.PrigramSummaryData, this.PrigramSummaryData['noOfAspirants'])
          this.PrigramSummaryData['disabilityPercentage']= ((this.PrigramSummaryData['physicallyChallenge'] / this.PrigramSummaryData['participant']) * 100).toFixed(2);
            
          },
          error: (err) => {
            this.toastrService.error('Data Not Available', "Participant Data Error!");
            new Error(err);
          },
        });
        // console.log(this.ParticipantAttentance)
      }
      CalculatePercentage(Data: any,val:any) {
        let total = Data.sc + Data.st + Data.bc + Data.oc + Data.minorities;
        let percentage:any = ((val / total) * 100).toFixed(2);
        return isNaN(percentage) ? 0 : percentage

      }
      CalculateGenderPercentage(Data: any,val:any) {
        let total = Data.male + Data.female + Data.transgender;
        let percentage:any = ((val / total) * 100).toFixed(2);
        return isNaN(percentage) ? 0 : percentage

      }
      CalculateOragnizationPercentage(Data: any,val:any) {
        let total = Data.noOfSHGs + Data.noOfMSMEs + Data.noOfStartups+ Data.noOfAspirants;
        let percentage:any = ((val / total) * 100).toFixed(2);        
        return isNaN(percentage) ? 0 : percentage

      }
     isGeneratingPDF: boolean = false;
  pdfProgress: string = '';
  pdfProgressPercentage: number = 0;
  imageLoaded: boolean = false;
  imageError: boolean = false;  
async handleDownloadPDF() {
  const downloadButton = document.getElementById('pdf-download-button');
  const summaryEl = document.getElementById('program-summary-container');
  const imageEl = document.getElementById('program-collage-image');
  const detailsEl = document.getElementById('participant-details');

  if (!summaryEl || !imageEl || !detailsEl) return;

  // Start loading
  this.isGeneratingPDF = true;
  this.pdfProgress = 'Initializing PDF generation...';
  this.pdfProgressPercentage = 0;

  try {
    // Hide button and prepare content
    if (downloadButton) downloadButton.style.display = 'none';
    this.showPagination = false;
    const originalPosts = [...this.paginatedPosts];
    this.paginatedPosts = [...this.posts];
    this.showAllRows = true;

    // Wait for DOM updates
    this.pdfProgress = 'Preparing content...';
    this.pdfProgressPercentage = 10;
    await this.delay(300);

    const pdf = new jsPDF('p', 'pt', 'a4');
    const marginX = 30;
    const marginY = 30;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = marginY;

    // Step 1: Render program summary
    this.pdfProgress = 'Capturing program summary...';
    this.pdfProgressPercentage = 20;
    
    const summaryCanvas = await html2canvas(summaryEl, { 
      scale: 2, 
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const summaryWidth = pageWidth - 2 * marginX;
    const summaryHeight = (summaryWidth / summaryCanvas.width) * summaryCanvas.height;
    const summaryData = summaryCanvas.toDataURL('image/png');

    if (summaryHeight + currentY > pageHeight - marginY) {
      pdf.addPage();
      currentY = marginY;
    }
    pdf.addImage(summaryData, 'PNG', marginX, currentY, summaryWidth, summaryHeight);
    currentY += summaryHeight + 20;

    // Step 2: Ensure image is loaded and render collage
    this.pdfProgress = 'Loading program collage image...';
    this.pdfProgressPercentage = 40;
    
    await this.ensureImageLoaded();
    
    this.pdfProgress = 'Capturing program collage...';
    this.pdfProgressPercentage = 50;
    
    const imageCanvas = await html2canvas(imageEl, { 
      scale: 2, 
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedImages = clonedDoc.querySelectorAll('img');
        clonedImages.forEach(img => {
          if (img.src && !img.complete) {
            img.crossOrigin = 'anonymous';
          }
        });
      }
    });
    
    let imageWidth = pageWidth - 2 * marginX;
    let imageHeight = (imageWidth / imageCanvas.width) * imageCanvas.height;

    // Increase image dimensions by 10%
    imageWidth *= 1.1;
    imageHeight *= 1.1;

    let imageX = marginX - ((imageWidth - (pageWidth - 2 * marginX)) / 2);
    if (imageX < 0) imageX = 0;

    const imageData = imageCanvas.toDataURL('image/png');

    if (imageHeight + currentY > pageHeight - marginY) {
      pdf.addPage();
      currentY = marginY;
    }

    pdf.addImage(imageData, 'PNG', imageX, currentY, imageWidth, imageHeight);

    // Step 3: Render participant details with progress
    this.pdfProgress = 'Processing participant details...';
    this.pdfProgressPercentage = 60;
    
    await this.renderParticipantDetailsWithPagination(pdf, detailsEl, marginX, marginY, pageWidth, pageHeight);

    // Final step: Save PDF
    this.pdfProgress = 'Finalizing PDF...';
    this.pdfProgressPercentage = 95;
    
    await this.delay(500); // Brief pause before save
    
    pdf.save('program-summary.pdf');
    
    this.pdfProgress = 'PDF downloaded successfully!';
    this.pdfProgressPercentage = 100;

    // Brief success message display
    await this.delay(1000);

  } catch (error) {
    console.error('Error generating PDF:', error);
    this.pdfProgress = 'Error generating PDF. Please try again.';
    this.pdfProgressPercentage = 0;
    
    // Show error for 3 seconds
    await this.delay(3000);
  } finally {
    // Restore UI
    if (downloadButton) downloadButton.style.display = '';
    this.paginatedPosts = this.paginatedPosts.length > 0 ? 
      [...this.paginatedPosts] : 
      this.posts.slice(0, this.pageSize);
    this.showPagination = true;
    this.isGeneratingPDF = false;
    this.pdfProgress = '';
    this.pdfProgressPercentage = 0;
  }
}

// Enhanced image loading method
private ensureImageLoaded(): Promise<void> {
  return new Promise((resolve) => {
    const imgElement = document.querySelector('#program-collage-image img') as HTMLImageElement;
    
    if (!imgElement) {
      console.log('No image found in collage section');
      resolve();
      return;
    }

    if (imgElement.complete && imgElement.naturalWidth > 0) {
      console.log('Image already loaded');
      this.imageLoaded = true;
      resolve();
    } else {
      console.log('Waiting for image to load...');
      
      const handleLoad = () => {
        console.log('Image loaded successfully');
        this.imageLoaded = true;
        this.imageError = false;
        imgElement.removeEventListener('load', handleLoad);
        imgElement.removeEventListener('error', handleError);
        resolve();
      };

      const handleError = () => {
        console.log('Image failed to load');
        this.imageLoaded = false;
        this.imageError = true;
        imgElement.removeEventListener('load', handleLoad);
        imgElement.removeEventListener('error', handleError);
        resolve();
      };

      imgElement.addEventListener('load', handleLoad);
      imgElement.addEventListener('error', handleError);

      // Fallback timeout
      setTimeout(() => {
        imgElement.removeEventListener('load', handleLoad);
        imgElement.removeEventListener('error', handleError);
        console.log('Image load timeout, continuing...');
        resolve();
      }, 5000);
    }
  });
}

// Enhanced pagination method with progress updates
// private async renderParticipantDetailsWithPagination(
//   pdf: jsPDF, 
//   detailsEl: HTMLElement, 
//   marginX: number, 
//   marginY: number, 
//   pageWidth: number, 
//   pageHeight: number
// ): Promise<void> {
//   const recordsPerPage = 80;
//   const totalRecords = this.posts.length;
  
//   if (totalRecords === 0) {
//     this.pdfProgress = 'No participant data to process...';
//     pdf.addPage();
    
//     try {
//       const detailsCanvas = await html2canvas(detailsEl, { 
//         scale: 2, 
//         useCORS: true,
//         allowTaint: true,
//         backgroundColor: '#ffffff'
//       });
//       const detailsWidth = pageWidth - 2 * marginX;
//       const detailsHeight = (detailsWidth / detailsCanvas.width) * detailsCanvas.height;
//       const detailsData = detailsCanvas.toDataURL('image/png');
//       pdf.addImage(detailsData, 'PNG', marginX, marginY, detailsWidth, detailsHeight);
//     } catch (error) {
//       console.error('Error rendering empty participant details:', error);
//     }
//     return;
//   }

//   const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
//   for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
//     const startIndex = pageIndex * recordsPerPage;
//     const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
    
//     // Update progress
//     const pageProgress = 60 + ((pageIndex + 1) / totalPages) * 30; // 60-90% for participant pages
//     this.pdfProgress = `Processing participant page ${pageIndex + 1} of ${totalPages}...`;
//     this.pdfProgressPercentage = Math.round(pageProgress);
    
//     this.paginatedPosts = this.posts.slice(startIndex, endIndex);
//     await this.delay(300);
    
//     pdf.addPage();
    
//     try {
//       const detailsCanvas = await html2canvas(detailsEl, { 
//         scale: 2, 
//         useCORS: true,
//         allowTaint: true,
//         backgroundColor: '#ffffff',
//         logging: false
//       });
      
//       const detailsWidth = pageWidth - 2 * marginX;
//       const detailsHeight = (detailsWidth / detailsCanvas.width) * detailsCanvas.height;
//       const detailsData = detailsCanvas.toDataURL('image/png');
      
//       const maxHeight = pageHeight - 2 * marginY - 40;
//       let finalHeight = detailsHeight;
//       let finalWidth = detailsWidth;
      
//       if (detailsHeight > maxHeight) {
//         const scaleFactor = maxHeight / detailsHeight;
//         finalHeight = maxHeight;
//         finalWidth = detailsWidth * scaleFactor;
//       }
      
//       pdf.addImage(detailsData, 'PNG', marginX, marginY, finalWidth, finalHeight);
      
//       pdf.setFontSize(10);
//       pdf.setTextColor(128, 128, 128);
//       pdf.text(
//         `Page ${pageIndex + 1} of ${totalPages} (Records ${startIndex + 1}-${endIndex} of ${totalRecords})`, 
//         marginX, 
//         pageHeight - 15
//       );
      
//     } catch (error) {
//       console.error(`Error rendering participant details page ${pageIndex + 1}:`, error);
      
//       pdf.setFontSize(12);
//       pdf.setTextColor(255, 0, 0);
//       pdf.text(`Error rendering participant details for page ${pageIndex + 1}`, marginX, marginY + 50);
//     }
//   }
// }

private async renderParticipantDetailsWithPagination(
  pdf: jsPDF, 
  detailsEl: HTMLElement, 
  marginX: number, 
  marginY: number, 
  pageWidth: number, 
  pageHeight: number
): Promise<void> {
  const recordsPerPage = 80;
  const totalRecords = this.posts.length;
  
  if (totalRecords === 0) {
    this.pdfProgress = 'No participant data to process...';
    pdf.addPage();
    
    try {
      const detailsCanvas = await html2canvas(detailsEl, { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      // Use full page width minus margins for empty table
      const detailsWidth = pageWidth - 2 * marginX;
      const detailsHeight = (detailsWidth / detailsCanvas.width) * detailsCanvas.height;
      const detailsData = detailsCanvas.toDataURL('image/png');
      pdf.addImage(detailsData, 'PNG', marginX, marginY, detailsWidth, detailsHeight);
    } catch (error) {
      console.error('Error rendering empty participant details:', error);
    }
    return;
  }

  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const startIndex = pageIndex * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
    
    // Update progress
    const pageProgress = 60 + ((pageIndex + 1) / totalPages) * 30; // 60-90% for participant pages
    this.pdfProgress = `Processing participant page ${pageIndex + 1} of ${totalPages}...`;
    this.pdfProgressPercentage = Math.round(pageProgress);
    
    // Set paginated posts with continuous serial numbers
    this.paginatedPosts = this.posts.slice(startIndex, endIndex).map((post, index) => ({
      ...post,
      serialNumber: startIndex + index + 1 // Add continuous serial number
    }));
    
    await this.delay(300);
    
    pdf.addPage();
    
    try {
      const detailsCanvas = await html2canvas(detailsEl, { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      // Use full page width minus margins for table
      const detailsWidth = pageWidth - 2 * marginX;
      const detailsHeight = (detailsWidth / detailsCanvas.width) * detailsCanvas.height;
      const detailsData = detailsCanvas.toDataURL('image/png');
      
      const maxHeight = pageHeight - 2 * marginY - 40;
      let finalHeight = detailsHeight;
      let finalWidth = detailsWidth; // Keep full width
      
      if (detailsHeight > maxHeight) {
        const scaleFactor = maxHeight / detailsHeight;
        finalHeight = maxHeight;
        // Only scale width if height exceeds max height
        finalWidth = detailsWidth * scaleFactor;
      }
      
      // Position table to use full width (start at margin)
      pdf.addImage(detailsData, 'PNG', marginX, marginY, finalWidth, finalHeight);
      
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Page ${pageIndex + 1} of ${totalPages} (Records ${startIndex + 1}-${endIndex} of ${totalRecords})`, 
        marginX, 
        pageHeight - 15
      );
      
    } catch (error) {
      console.error(`Error rendering participant details page ${pageIndex + 1}:`, error);
      
      pdf.setFontSize(12);
      pdf.setTextColor(255, 0, 0);
      pdf.text(`Error rendering participant details for page ${pageIndex + 1}`, marginX, marginY + 50);
    }
  }
}

// Update the updatePaginatedPosts method to include serial numbers
updatePaginatedPosts() {
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;
  this.paginatedPosts = this.posts.slice(start, end).map((post, index) => ({
    ...post,
    serialNumber: start + index + 1 // Add continuous serial number for regular pagination
  }));
}

// ...existing code...

// ...existing code...

// Image event handlers
onImageLoad(): void {
  this.imageLoaded = true;
  this.imageError = false;
  console.log('✅ Image loaded successfully');
}

onImageError(event: any): void {
  this.imageLoaded = false;
  this.imageError = true;
  console.error('❌ Image failed to load:', event);
}



private delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// star rating 
onRatingChange(rating: number) {
  console.log('Rating changed:', rating);
  this.currentRating = rating;
}


      
      loadCollageImages(): void {
        this.imageService.getCollageImages().subscribe(
          (res: any[]) => {
            this.collageImages = res.filter((fileob: any) =>
              fileob.fileUrl?.match(/\.(jpeg|jpg|png|gif|png)$/i)
            );
            this.filteredImages = [...this.collageImages];
          },
          (err) => {
            console.error('Error fetching collage images:', err);
            this.filteredImages = [];
          }
        );
      }

      setProgramCollageImage(programId: number): void {
        console.log("Program ID:", programId);
        console.log("filteredImages available:", this.filteredImages?.length);

        const match = this.filteredImages.find((img) =>
          Number(img.programId) === Number(programId) && !!img.fileUrl
        );

        console.log("Match found:", match);

        if (match) {
          this.programCollageImage = match.fileUrl.replace(/\\/g, '/');
          console.log("Program Collage Image URL:", this.programCollageImage);
        } else {
          this.programCollageImage = '';
          console.warn("No image found for programId:", programId);
        }
      }



      getParticipantsByProgramID(agencyid:number): void {
        this._commonService.ProgramsWithAgenciesData(APIS.programSummary.getParticipantsBYProgram,agencyid).subscribe((res)=>{
          this.posts = res.data;
          this.totalPages = Math.ceil(this.posts.length / this.pageSize);
          this.updatePaginatedPosts();
        }, (error) => {
          console.error('Error fetching dummy data:', error);
        });
      }
      
      
      
      nextPage() {
        if (this.currentPage < this.totalPages) {
  
          this.currentPage++;
          this.updatePaginatedPosts();
        }
      }
      
      previousPage() {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.updatePaginatedPosts();
        }
      }
}
