import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingPanel } from './loading-panel';

describe('LoadingPanel', () => {
  let component: LoadingPanel;
  let fixture: ComponentFixture<LoadingPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
