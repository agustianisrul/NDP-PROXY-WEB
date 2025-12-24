import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigDetail } from './config-detail';

describe('ConfigDetail', () => {
  let component: ConfigDetail;
  let fixture: ComponentFixture<ConfigDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
