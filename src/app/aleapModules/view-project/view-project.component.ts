import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit {
  private readonly projectsStorageKey = 'aleapProjectData';
  projectsData: any[] = [];

  constructor(
    private router: Router,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.getProjectData();
  }

  getProjectData() {
    const records = localStorage.getItem(this.projectsStorageKey);
    const parsedData = records ? JSON.parse(records) : [];
    this.projectsData = parsedData.sort((a: any, b: any) => {
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA;
    });
  }

  addProject() {
    this.router.navigate(['/add-project-data']);
  }

  editRow(item: any) {
    this.router.navigate(['/add-project-data-edit', item.projectId]);
  }

  deleteRow(item: any) {
    this.projectsData = this.projectsData.filter((project: any) => project.projectId !== item.projectId);
    localStorage.setItem(this.projectsStorageKey, JSON.stringify(this.projectsData));
    this.toastrService.success('Project Deleted Successfully', 'Success');
  }

}
