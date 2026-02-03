import { TestBed } from '@angular/core/testing';
import { ReactiveFormsDemoComponent } from './reactive-forms-demo.component';

describe('ReactiveFormsDemoComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsDemoComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ReactiveFormsDemoComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });

  it('should validate name field (required, minlength, pattern)', () => {
    const fixture = TestBed.createComponent(ReactiveFormsDemoComponent);
    const comp = fixture.componentInstance;

    const name = comp.form.controls['name'];
    name.setValue('');
    name.markAsTouched();
    expect(name.errors?.['required']).toBeTrue();

    name.setValue('ab');
    expect(name.errors?.['minlength']).toBeTruthy();

    name.setValue('123');
    expect(name.errors?.['pattern']).toBeTruthy();

    name.setValue('Alice');
    expect(name.errors).toBeNull();
  });

  it('should require category', () => {
    const fixture = TestBed.createComponent(ReactiveFormsDemoComponent);
    const comp = fixture.componentInstance;
    const category = comp.form.controls['category'];
    category.setValue('');
    category.markAsTouched();
    expect(category.errors?.['required']).toBeTrue();

    category.setValue('accessibility');
    expect(category.errors).toBeNull();
  });

  it('should enforce oneOf for fruit combobox', () => {
    const fixture = TestBed.createComponent(ReactiveFormsDemoComponent);
    const comp = fixture.componentInstance;
    const fruit = comp.form.controls['fruit'];

    fruit.setValue('Orange');
    fruit.markAsTouched();
    expect(fruit.errors?.['oneOf']).toBeTruthy();

    fruit.setValue('Apple');
    expect(fruit.errors).toBeNull();
  });

  it('should enable submit when form is valid', () => {
    const fixture = TestBed.createComponent(ReactiveFormsDemoComponent);
    const comp = fixture.componentInstance;

    comp.form.controls['name'].setValue('Alice');
    comp.form.controls['category'].setValue('accessibility');
    comp.form.controls['fruit'].setValue('Apple');
    fixture.detectChanges();

    expect(comp.form.valid).toBeTrue();
  });
});