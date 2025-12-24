import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSequenceList } from './file-sequence-list';

describe('FileSequenceList', () => {
  let component: FileSequenceList;
  let fixture: ComponentFixture<FileSequenceList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileSequenceList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileSequenceList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
