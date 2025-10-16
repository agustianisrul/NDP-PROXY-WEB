import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDetail } from './dialog-detail';

describe('DialogDetail', () => {
  let component: DialogDetail;
  let fixture: ComponentFixture<DialogDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
