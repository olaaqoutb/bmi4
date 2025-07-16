import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdukteListComponent } from './produkte-list.component';

describe('ProdukteListComponent', () => {
  let component: ProdukteListComponent;
  let fixture: ComponentFixture<ProdukteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdukteListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdukteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
