import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdukteDetailsComponent } from './produkte-details.component';

describe('ProdukteDetailComponent', () => {
  let component: ProdukteDetailsComponent;
  let fixture: ComponentFixture<ProdukteDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdukteDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdukteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
