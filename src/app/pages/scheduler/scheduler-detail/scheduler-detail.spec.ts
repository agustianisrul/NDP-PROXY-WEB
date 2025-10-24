import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerDetail } from './scheduler-detail';

describe('SchedulerDetail', () => {
  let component: SchedulerDetail;
  let fixture: ComponentFixture<SchedulerDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulerDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulerDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
