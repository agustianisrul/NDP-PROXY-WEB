import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticWidget } from './statistic-widget';

describe('StatisticWidget', () => {
  let component: StatisticWidget;
  let fixture: ComponentFixture<StatisticWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
