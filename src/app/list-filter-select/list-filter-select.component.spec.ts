import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFilterSelectComponent } from './list-filter-select.component';

describe('ListFilterSelectComponent', () => {
  let component: ListFilterSelectComponent;
  let fixture: ComponentFixture<ListFilterSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListFilterSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFilterSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
