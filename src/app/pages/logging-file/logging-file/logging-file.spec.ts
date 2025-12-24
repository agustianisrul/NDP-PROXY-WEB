import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoggingFile } from './logging-file';

describe('LoggingFile', () => {
  let component: LoggingFile;
  let fixture: ComponentFixture<LoggingFile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoggingFile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoggingFile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
