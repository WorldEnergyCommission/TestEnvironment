import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStateOverviewComponent } from './project-state-overview.component';

describe('ProjectStateOverviewComponent', () => {
  let component: ProjectStateOverviewComponent;
  let fixture: ComponentFixture<ProjectStateOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectStateOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectStateOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
