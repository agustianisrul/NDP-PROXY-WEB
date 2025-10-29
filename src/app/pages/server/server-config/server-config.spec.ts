import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerConfig } from './server-config';

describe('ServerConfig', () => {
  let component: ServerConfig;
  let fixture: ComponentFixture<ServerConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
