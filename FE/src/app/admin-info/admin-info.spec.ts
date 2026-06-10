import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInfo } from './admin-info';

describe('AdminInfo', () => {
  let component: AdminInfo;
  let fixture: ComponentFixture<AdminInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
