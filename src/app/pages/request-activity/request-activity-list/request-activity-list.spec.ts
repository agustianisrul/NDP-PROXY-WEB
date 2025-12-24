import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestActivityList } from './request-activity-list';

describe('RequestActivityList', () => {
  let component: RequestActivityList;
  let fixture: ComponentFixture<RequestActivityList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestActivityList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestActivityList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
