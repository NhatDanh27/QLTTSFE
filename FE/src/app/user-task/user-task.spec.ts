import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTask } from './user-task';

describe('UserTask', () => {
  let component: UserTask;
  let fixture: ComponentFixture<UserTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTask],
    }).compileComponents();

    fixture = TestBed.createComponent(UserTask);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
