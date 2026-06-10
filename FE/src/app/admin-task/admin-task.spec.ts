import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTask } from './admin-task';

describe('AdminTask', () => {
  let component: AdminTask;
  let fixture: ComponentFixture<AdminTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTask],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTask);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
