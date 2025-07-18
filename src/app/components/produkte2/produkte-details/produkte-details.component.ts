import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';


interface Produktposition {
  name: string;
  start?: Date;
  ende?: Date;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-produkte-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    FormsModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
  ],
  templateUrl: './produkte-details.component.html',
  styleUrls: ['./produkte-details.component.scss']
})
export class ProdukteDetailsComponent implements OnInit {
  produktForm!: FormGroup;
  isFormEditable = false;
  saving = false;
   loading = true;
  selectedDate: string | null = null;
  produktData: any = {};
  produktpositionen: Produktposition[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

    ngOnInit(): void {
    this.initForm();

    // <-- التعديل: استلام البيانات الأساسية (الخطة البديلة) من القائمة
    const fallbackData = history.state.produktData;

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // <-- التعديل: تمرير البيانات الأساسية إلى دالة تحميل البيانات
      this.loadProduktData(id, fallbackData);
    } else {
      console.error('No product ID found');
      this.router.navigate(['/produkte']);
    }
  }



  private initForm(): void {
    this.produktForm = this.fb.group({
      produktname: ['', Validators.required],
      kurzName: [''], // Corrected: kurzName (with capital N)
      produktTyp: [''], // Corrected: produktTyp (with capital T)
      auftraggeber: [''],
      ergebnisverantwortlicher: [''],
      aktiv: [false],
      start: [null],
      ende: [null],
        // Corrected: Renamed 'organisationseinheit' to match JSON
      auftraggeberOrganisation: [''],
      anmerkung: ['']
    });
  }

    private loadProduktData(id: string, fallbackData: any): void {
    this.loading = true;

    // ملاحظة: نقوم بتحميل كائن واحد <any> لأن ملف التفاصيل يحتوي على منتج واحد فقط
    // وتأكد من أن اسم الملف ومساره صحيحين
    this.http.get<any>('produkte_detail.json').subscribe({
      next: (detailData) => {
        // نتحقق إذا كان المنتج في ملف التفاصيل هو نفسه الذي تم النقر عليه
        if (detailData && detailData.id.toString() === id) {
          // الحالة 1: نجحنا! وجدنا تفاصيل كاملة
          console.log('Full details found in JSON file.');
          this.produktData = detailData;

          // إذا كان ملف التفاصيل يحتوي على قائمة produktpositionen
          if (detailData.produktPosition) {
            this.produktpositionen = detailData.produktPosition.map((pos: any) => ({
                name: pos.produktPositionname,
                start: pos.start ? new Date(pos.start) : undefined,
                ende: pos.ende ? new Date(pos.ende) : undefined,
                status: pos.aktiv ? 'active' : 'inactive'
            }));
          }

        } else {
          // الحالة 2: فشلنا! سنستخدم البيانات الأساسية كخطة بديلة
          console.log('Details not found for this ID in JSON, using fallback data.');
          this.produktData = fallbackData || {};
          this.produktpositionen = []; // لا توجد تفاصيل للمواقع
        }

        // في كلتا الحالتين، نملأ الفورم بالبيانات التي حصلنا عليها
        this.produktForm.patchValue(this.produktData);

        // معالجة خاصة للحقل المتداخل `ergebnisverantwortlicher` إذا كان موجوداً
        if (this.produktData.ergebnisverantwortlicher && typeof this.produktData.ergebnisverantwortlicher === 'object') {
            const verantwortlicherName = `${this.produktData.ergebnisverantwortlicher.vorname || ''} ${this.produktData.ergebnisverantwortlicher.nachname || ''}`.trim();
            this.produktForm.get('ergebnisverantwortlicher')?.patchValue(verantwortlicherName);
        }

        this.produktForm.disable();
        this.loading = false;
      },
      error: (err) => {
        // إذا فشل تحميل الملف نفسه (مثلاً غير موجود)، نستخدم الخطة البديلة
        console.error('Error loading a-detail.json, using fallback data.', err);
        this.produktData = fallbackData || {};
        this.produktpositionen = [];
        this.produktForm.patchValue(this.produktData);
        this.produktForm.disable();
        this.loading = false;
      }
    });
  }

  onEditOrSubmit(): void {
    if (!this.isFormEditable) {
      this.isFormEditable = true;
      this.produktForm.enable();
    } else {
      this.onSubmit();
    }
  }

  onSubmit(): void {
    if (this.produktForm.invalid) {
      this.snackBar.open('Bitte füllen Sie alle Pflichtfelder aus.', 'Schließen', { duration: 3000 });
      return;
    }

    this.saving = true;
    setTimeout(() => {
      this.produktData = { ...this.produktData, ...this.produktForm.value };
      this.saving = false;
      this.isFormEditable = false;
      this.produktForm.disable();

      this.snackBar.open('Daten wurden erfolgreich gespeichert', 'Schließen', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
    }, 1000);
  }

  onCancel(): void {
    if (this.isFormEditable) {
      this.isFormEditable = false;
      this.produktForm.patchValue(this.produktData);
      this.produktForm.disable();
    } else {
      this.router.navigate(['/products']);
    }
  }
}
