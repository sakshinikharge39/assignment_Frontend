import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../core/services/toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [ToastService]
    }).compileComponents();

    toastService = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the toast component', () => {
    expect(component).toBeTruthy();
  });

  it('should render a toast message when triggered', () => {
    toastService.success('Task Created', 'Test success message');
    fixture.detectChanges();
    expect(component.toasts().length).toBe(1);
    expect(component.toasts()[0].title).toBe('Task Created');
  });

  it('should dismiss toast on dismiss call', () => {
    toastService.success('To Dismiss', 'Message');
    const id = component.toasts()[0].id;
    component.dismiss(id);
    fixture.detectChanges();
    expect(component.toasts().length).toBe(0);
  });
});
