import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerList } from './scheduler-list';

describe('SchedulerList', () => {
  let component: SchedulerList;
  let fixture: ComponentFixture<SchedulerList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulerList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulerList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
