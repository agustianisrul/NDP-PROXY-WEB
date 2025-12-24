import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableUniversal } from './table-universal';

describe('TableUniversal', () => {
  let component: TableUniversal;
  let fixture: ComponentFixture<TableUniversal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableUniversal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableUniversal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
