import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
// import { HttpClientModule } from '@angular/common/http';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomSanitizer } from '@angular/platform-browser';
import { ViewChild } from '@angular/core';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-produkte-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
     CommonModule,
    // HttpClientModule,
    FormsModule,
    // BrowserAnimationsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSortModule,

  ],
  templateUrl: './produkte-list.component.html',
styleUrls: ['./produkte-list.component.scss'],

})


export class ProdukteListComponent {
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<any>([]);

  produkte: any[] = [];
  searchTerm = '';
  showInactive = false;
  displayedColumns: string[] = ['kurzName', 'produktname', 'start', 'ende'];

  constructor(private http: HttpClient) {
    this.http.get<any[]>('produkte.json').subscribe((data) => {
      this.produkte = this.sortData(data);
      this.filterData();
    });
  }

ngAfterViewInit() {
  console.log('Sort initialized:', this.sort); // Should show the MatSort instance
  this.dataSource.sort = this.sort;

  this.dataSource.sortingDataAccessor = (item, property) => {
    console.log('Sorting by:', property, 'Value:', item[property]); // Debug what's being sorted
    switch (property) {
      case 'start':
      case 'ende':
        const date = new Date(item[property]);
        console.log('Date value:', date); // Check date parsing
        return isNaN(date.getTime()) ? 0 : date.getTime();
      default:
        return (item[property] || '').toString().toLowerCase();
    }
  };
}
  sortData(data: any[]): any[] {
    return data.sort((a, b) => {
      const nameA = a.kurzName?.toLowerCase() || '';
      const nameB = b.kurzName?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  }


sortState: { [key: string]: 'asc' | 'desc' } = {
  kurzName: 'asc',
  produktname: 'asc',
  start: 'desc',
  ende: 'desc',
};
toggleSort(field: string) {
  // Toggle direction
  this.sortState[field] = this.sortState[field] === 'asc' ? 'desc' : 'asc';

  const direction = this.sortState[field];

  const sorted = [...this.dataSource.data].sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];

    if (field === 'start' || field === 'ende') {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    } else {
      valueA = (valueA || '').toString().toLowerCase();
      valueB = (valueB || '').toString().toLowerCase();
    }

    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  this.dataSource.data = sorted;
}

//   sortBy(field: string, direction: 'asc' | 'desc') {
//   const sorted = [...this.dataSource.data].sort((a, b) => {
//     let valueA = a[field];
//     let valueB = b[field];

//     // If sorting dates (start or ende)
//     if (field === 'start' || field === 'ende') {
//       valueA = new Date(valueA).getTime();
//       valueB = new Date(valueB).getTime();
//     } else {
//       valueA = (valueA || '').toString().toLowerCase();
//       valueB = (valueB || '').toString().toLowerCase();
//     }

//     if (valueA < valueB) return direction === 'asc' ? -1 : 1;
//     if (valueA > valueB) return direction === 'asc' ? 1 : -1;
//     return 0;
//   });

//   this.dataSource.data = sorted;
// }

  filterData() {
    const term = this.searchTerm.toLowerCase();
    const filtered = this.produkte.filter(p => {
      const matchesSearch =
        (p.kurzName || '').toLowerCase().includes(term) ||
        (p.produktname || '').toLowerCase().includes(term);
      const matchesActiveStatus = this.showInactive ? true : p.aktiv !== false;
      return matchesSearch && matchesActiveStatus;
    });
    this.dataSource.data = filtered;
  }

  onCheckboxChange() {
    this.filterData();
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterData();
  }

  addProduct() {
    alert('Added');
  }
}
