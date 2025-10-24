import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrefixList } from './prefix-list';

describe('PrefixList', () => {
  let component: PrefixList;
  let fixture: ComponentFixture<PrefixList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrefixList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrefixList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
