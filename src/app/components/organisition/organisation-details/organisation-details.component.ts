import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';

import { SharedDataServiceService } from '../organisation-service/organisetion-service.service';
import { Datalistorganizationanc } from '../../../models/datalistorganizationanc';
import { DataoforganizationlistService } from '../dataoforganisation-list.service';

@Component({
  selector: 'app-organizationdetails',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './organisation-details.component.html',
  styleUrl: './organisation-details.component.scss',
})
export class OrganizationdetailsComponent implements OnInit {
  organisationseinheitForm: FormGroup;
  isNewOrganisationseinheit = true;
  isFormEditable = false;
  loading = false;
  saving = false;
  selectedOrganization: Datalistorganizationanc | null = null;

  dataSource: Datalistorganizationanc[] = [];
  uebergeordneteEinheiten: string[] = [];
  leitungPersonen: string[] = [];

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sharedDataService: SharedDataServiceService,
    private dataoforganizationlistService: DataoforganizationlistService,
    private snackBar: MatSnackBar, private datePipe: DatePipe,

  ) {
    this.organisationseinheitForm = this.createForm();
    this.dateAdapter.setLocale('de-DE'); // Set German locale

  }

  ngOnInit(): void {
    this.dataSource = this.dataoforganizationlistService.getActiveData();

    this.leitungPersonen = this.dataSource
      .filter(org => org.leiter?.vorname && org.leiter?.nachname)
      .map(org => `${org.leiter?.vorname} ${org.leiter?.nachname}`)
      .filter((value, index, self) => self.indexOf(value) === index);

    this.uebergeordneteEinheiten = this.dataSource
      .map(org => org.parent?.kurzBezeichnung)
      .filter((val): val is string => !!val)
      .filter((value, index, self) => self.indexOf(value) === index);

    this.sharedDataService.selectedOrganization$.subscribe(org => {
      if (org) {
        this.isNewOrganisationseinheit = false;
        this.selectedOrganization = org;

        this.organisationseinheitForm.patchValue({
          bezeichnung: org.bezeichnung || '',
          kurzbezeichnung: org.kurzBezeichnung || '',
          gueltigVon: org.gueltigVon ? new Date(org.gueltigVon) : null,
          gueltigBis: org.gueltigBis ? new Date(org.gueltigBis) : null,
          leitung: org.leiter ? `${org.leiter.vorname} ${org.leiter.nachname}` : '',
          uebergeordneteEinheitId: org.parent?.kurzBezeichnung || '',
          email: org.email || '',
        });

        this.organisationseinheitForm.disable();
        this.isFormEditable = false;
      } else {
        this.organisationseinheitForm.enable();
        this.isFormEditable = true;
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      bezeichnung: ['', Validators.required],
      kurzbezeichnung: [''],
      hierarchieEbene: [''],
      uebergeordneteEinheitId: [''],
      gueltigVon: [''],
      gueltigBis: [''],
      leitung: [''],
      kostenstelle: [''],

      fax: [''],
      email: ['', Validators.email],
    });
  }

  onEditOrSubmit(): void {
    if (!this.isFormEditable) {
      this.organisationseinheitForm.enable();
      this.isFormEditable = true;
    } else {
      this.onSubmit();
    }
  }

  generateId(): string {
    return Date.now().toString();
  }

  onSubmit(): void {
    if (this.organisationseinheitForm.invalid) {
      this.markFormGroupTouched(this.organisationseinheitForm);
      return;
    }

    const formData = this.organisationseinheitForm.value;
    const id = this.selectedOrganization?.id || this.generateId();

    const newOrUpdatedOrg: Datalistorganizationanc = {
      id,
      version: 1,
      deleted: false,
      bezeichnung: formData.bezeichnung,
      kurzBezeichnung: formData.kurzbezeichnung,
      gueltigVon: formData.gueltigVon,
      gueltigBis: formData.gueltigBis,
      email: [formData.email],
      leiter: formData.leitung
        ? {
          id: '',
          vorname: formData.leitung.split(' ')[0] || '',
          nachname: formData.leitung.split(' ')[1] || '',
          recht: [],
          funktion: [],
          vertrag: []
        }
        : undefined
    };

    if (this.isNewOrganisationseinheit) {
      this.dataoforganizationlistService.addOrganization(newOrUpdatedOrg);
    } else {
      this.dataoforganizationlistService.updateOrganization(newOrUpdatedOrg);
    }

    this.saving = false;
    this.organisationseinheitForm.disable();
    this.isFormEditable = false;

    this.snackBar.open('Daten wurden erfolgreich gespeichert', 'Schließen', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });

    this.router.navigate(['/organization2']);
  }

  onCancel(): void {
    this.router.navigate(['/organization2']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onDateInput(field: string, event: MatDatepickerInputEvent<Date>) {
    const inputValue = event.target.value;
    // Parse manual input if needed
  }

  onDateChange(field: string, event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.organisationseinheitForm.get(field)?.setValue(event.value);
    }
  }

  formatDateToDDMMYYYY = (date: Date | null): string => {
    if (!date || isNaN(date.getTime())) return '';
    return date.toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };


}
