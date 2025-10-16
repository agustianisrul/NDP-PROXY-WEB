import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Menumanagement } from './menumanagement';

describe('Menumanagement', () => {
  let component: Menumanagement;
  let fixture: ComponentFixture<Menumanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menumanagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Menumanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
