import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChart } from './dashboard-chart';

describe('DashboardChart', () => {
  let component: DashboardChart;
  let fixture: ComponentFixture<DashboardChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
