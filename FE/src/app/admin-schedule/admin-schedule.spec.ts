import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminScheduleComponent } from './admin-schedule';

describe('AdminScheduleComponent', () => {
  let component: AdminScheduleComponent;
  let fixture: ComponentFixture<AdminScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminScheduleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminScheduleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
