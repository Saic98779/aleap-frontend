import {
  Component,
  OnInit
} from '@angular/core';
import {
  ToPngService
} from '../../_services/to-png.service';
import {
  DomSanitizer,
  SafeUrl
} from '@angular/platform-browser';
import {
  ImageService
} from '../../_services/image.service';
import {
  Agency
} from '../../_models/agencies.model';
import {
  Program
} from '../../_models/program.model';
import {
  Router
} from '@angular/router';
import {
  CommonServiceService
} from '@app/_services/common-service.service';
import {
  APIS
} from '@app/constants/constants';

@Component({
  selector: 'app-collage-creation',
  templateUrl: './collage-creation.component.html',
  styleUrls: ['./collage-creation.component.css']
})
export class CollageCreationComponent implements OnInit {
  public sanitizedImageUrls: SafeUrl[] = [];
  selectedImages: SafeUrl[] = [];
  collageImages: SafeUrl[] = [];
  collageMode: '2x2' | '3x3' = '2x2';
  aspectRatio: string = '1:1';
  backgroundColor: string = '#ffffff';
  padding: number = 10;
  draggingSource: 'selected' | 'collage' | null = null;
  images: any[] = [];
  showDbImages: boolean = false;
  selectedImage: string | null = null;
  user: any;

  maxImages: number = 4;
  zoomLevels: {
    [index: number]: number
  } = {};
  imageOffsets: {
    [index: number]: {
      x: number,
      y: number
    }
  } = {};
  draggingIndex: number | null = null;


  agencies: Agency[] = [];
  programs: Program[] = [];
  selectedAgency: number | null = null;
  selectedProgram: number | null = null;
  collageName: string = 'program-collage';
  agencyId: any;
  loginsessionDetails: any
  constructor(
    private toPngService: ToPngService,
    private sanitizer: DomSanitizer,
    private imageService: ImageService,
    public router: Router,
    private _commonService: CommonServiceService,
  ) {
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.selectedAgency = this.loginsessionDetails.agencyId;
    if (this.selectedAgency) {
      this.onAgencyChange(this.selectedAgency)
    }
  }




  ngOnInit(): void {
    console.log('Fetching collage images and all images...');
    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
    console.log('User:', this.user);
    this.updateMaxImages();
    this.getAgencies();
  }

  onAgencyChange(event: any): void {
    this.handleClearCollage()
    const selectedAgencyId = Number(event);
    this.selectedAgency = selectedAgencyId;
    this.selectedProgram = null; // Reset selected program
    if (this.selectedAgency) {
      this.getPrograms(this.selectedAgency);
    }
  }

  onProgramChange(event: Event): void {
    this.handleClearCollage()
    const selectedProgram = Number(event);
    const selectedProgramName = this.programs.find(program => program.programId === selectedProgram);

    this.selectedProgram = selectedProgram; // store selected program ID
    this.getProgramImages(selectedProgram);

    this.collageName = selectedProgramName ? selectedProgramName.programTitle : '';
  }


  handleImageSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files: File[] = Array.from(input.files);
    this.sanitizedImageUrls = files.map(file =>
      this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file))
    );
    console.log('Sanitized image URLs:', this.sanitizedImageUrls);

    this.selectedImages.push(...this.sanitizedImageUrls);
    this.updateCollageImages();
  }

  selectImageFromDB(imageUrl: string): void {
    const safeUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);

    const index = this.selectedImages.indexOf(safeUrl);

    if (index > -1) {
      this.selectedImages.splice(index, 1);
    } else {
      this.selectedImages.push(safeUrl);
    }

    this.updateCollageImages();
  }

  isSelected(imageUrl: string): boolean {
    const safeUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
    return this.images.includes(safeUrl);
  }


  updateCollageImages(): void {
    this.collageImages = this.selectedImages.slice(0, this.maxImages);
  }

  handleCollageModeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.collageMode = select.value as '2x2' | '3x3';
    this.updateMaxImages();
    this.updateCollageImages();
  }

  updateMaxImages(): void {
    this.maxImages = this.collageMode === '2x2' ? 4 : 9;
  }

  handleClearCollage(): void {
    this.selectedImages = [];
    this.collageImages = [];
    this.collageName = 'program-collage';
    this.zoomLevels = {};
    this.imageOffsets = {};
  }

  async handleSaveCollage(): Promise < void > {
    const node = document.getElementById('collage-preview');
    const zoomControls = document.querySelectorAll('.zoom-controls');

    zoomControls.forEach(control => (control as HTMLElement).style.display = 'none');

    const fileName = this.collageName.trim() !== '' ? `${this.collageName}.png` : 'collage.png';

    if (!node) {
      console.error('Collage preview element not found');
      return;
    }

    try {
      const dataUrl = await this.toPngService.toPng(node);

      if (this.selectedProgram === null) {
        console.error('No program selected!');
        return;
      }
      const response = await this.toPngService.uploadImage(dataUrl, fileName, this.selectedProgram);

      console.log('Upload success:', response);
      alert('Collage uploaded successfully!');
      this._commonService.add(`${APIS.programCreation.updateSessionByStatus}${this.selectedProgram}?status=Collage Added`, {}).subscribe({
        next: (data: any) => {

        },
        error: (err: any) => {

          new Error(err);
        },
      });

      // window.location.href="/collage-home"
      this.router.navigate(['/collage-home'])

      this.handleClearCollage();
    } catch (err) {
      console.error('Error generating or uploading image:', err);
      alert('Failed to generate or upload collage.');
    } finally {
      zoomControls.forEach(control => (control as HTMLElement).style.display = 'flex');
    }
  }

  handleZoom(index: number, delta: number): void {
    const currentZoom = this.zoomLevels[index] || 1;
    const newZoom = Math.max(0.5, Math.min(2, currentZoom + delta));
    this.zoomLevels[index] = newZoom;
  }


  handleDragStart(index: number, source: 'selected' | 'collage'): void {
    this.draggingIndex = index;
    this.draggingSource = source;
  }


  handleDragOver(event: Event): void {
    event.preventDefault();
  }

  handleDrop(index: number): void {
    if (this.draggingIndex === null || this.draggingSource === null) return;

    if (this.draggingSource === 'selected') {
      const draggedImage = this.selectedImages[this.draggingIndex];

      this.collageImages[index] = draggedImage;

    } else if (this.draggingSource === 'collage') {
      if (this.draggingIndex !== index) {
        const temp = this.collageImages[this.draggingIndex];
        this.collageImages[this.draggingIndex] = this.collageImages[index];
        this.collageImages[index] = temp;
      }
    }

    this.draggingIndex = null;
    this.draggingSource = null;
  }



  handleImageSwap(index: number, image: SafeUrl): void {
    this.collageImages[index] = image;
  }

  getAspectRatioValue(): number {
    switch (this.aspectRatio) {
      case '16:9':
        return 16 / 9;
      case '4:3':
        return 4 / 3;
      case '1:1':
        return 1;
      default:
        return 1;
    }
  }


  getAgencies(): void {
    this.imageService.getAgencies().subscribe(
      (res) => {
        this.agencies = res.data;
      },
      (err) => {
        console.error('Error fetching agencies:', err);
      }
    );
  }

  getPrograms(agencyId: number): void {

    this.imageService.getPrograms(agencyId).subscribe(
      (res) => {
        this.programs = res.data.filter(
          (program: any) =>
          program.status === 'Program Execution Updated' ||
          program.status === 'Program Expenditure Updated'
        );
        console.log('Filtered programs:', this.programs);
      },
      (err) => {
        console.error('Error fetching programs:', err);
      }
    );

  }

  getProgramImages(programId: number): void {
    this.imageService.getAllImages(programId).subscribe(
      (res) => {
        // Filter only image URLs (ends with .jpeg, .jpg, .png, .gif - case-insensitive)
        this.images = res.filter((url: string) =>
          url.match(/\.(jpeg|jpg|png|gif)$/i)
        );

        console.log('Fetched program images (filtered):', this.images);
      },
      (err) => {
        console.error('Error fetching all images:', err);
      }
    );
  }


}
