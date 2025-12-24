import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeMenuPicker } from './tree-menu-picker';

describe('TreeMenuPicker', () => {
  let component: TreeMenuPicker;
  let fixture: ComponentFixture<TreeMenuPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeMenuPicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeMenuPicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
