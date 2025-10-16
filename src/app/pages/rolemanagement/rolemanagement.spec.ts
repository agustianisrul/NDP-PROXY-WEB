import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rolemanagement } from './rolemanagement';

describe('Rolemanagement', () => {
  let component: Rolemanagement;
  let fixture: ComponentFixture<Rolemanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rolemanagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rolemanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
