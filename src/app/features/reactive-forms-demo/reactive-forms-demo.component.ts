import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';

function oneOf(options: string[]) {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = (control.value ?? '').toString();
    return v && options.includes(v) ? null : { oneOf: { allowed: options } };
  };
}

@Component({
  selector: 'app-reactive-forms-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card" aria-labelledby="forms-heading">
      <h2 id="forms-heading">Reactive Forms Validation Demo</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="form-row">
          <label for="name">Name</label>
          <input id="name" formControlName="name" required aria-required="true" />
          <div class="errors" *ngIf="invalid('name')" aria-live="polite">
            <span *ngIf="form.controls.name.errors?.['required']">Name is required.</span>
            <span *ngIf="form.controls.name.errors?.['minlength']">Name must be at least 3 characters.</span>
            <span *ngIf="form.controls.name.errors?.['pattern']">Only letters, spaces and hyphens allowed.</span>
          </div>
        </div>

        <div class="form-row">
          <label for="category">Category</label>
          <select id="category" formControlName="category" required aria-required="true">
            <option value="" disabled>Select a category</option>
            <option value="accessibility">Accessibility</option>
            <option value="performance">Performance</option>
            <option value="security">Security</option>
          </select>
          <div class="errors" *ngIf="invalid('category')" aria-live="polite">
            <span *ngIf="form.controls.category.errors?.['required']">Category is required.</span>
          </div>
        </div>

        <div class="form-row">
          <label for="fruit">Favorite Fruit (combobox)</label>
          <input id="fruit" formControlName="fruit" list="fruitOptions" required aria-required="true" />
          <datalist id="fruitOptions">
            <option value="Apple"></option>
            <option value="Banana"></option>
            <option value="Cherry"></option>
            <option value="Grape"></option>
          </datalist>
          <div class="errors" *ngIf="invalid('fruit')" aria-live="polite">
            <span *ngIf="form.controls.fruit.errors?.['required']">Fruit is required.</span>
            <span *ngIf="form.controls.fruit.errors?.['oneOf']">Choose one of the suggested fruits.</span>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="form.invalid" [attr.aria-disabled]="form.invalid ? 'true' : 'false'">
          Submit
        </button>
      </form>

      <section class="preview" aria-live="polite" *ngIf="form.valid">
        <h3>Form Value</h3>
        <pre>{{ form.value | json }}</pre>
      </section>
    </div>
  `,
  styles: [
    `
    .card { padding: 1rem; border: 1px solid #ddd; border-radius: 6px; }
    .form-row { margin-bottom: .75rem; display: grid; gap: .25rem; }
    .errors { color: #b00020; font-size: .9rem; margin-top: .25rem; }
    label { font-weight: 600; }
    input, select { padding: .5rem; border: 1px solid #bbb; border-radius: 4px; }
    input:focus, select:focus { outline: 2px solid #005fcc; outline-offset: 2px; }
    input.ng-invalid.ng-touched, select.ng-invalid.ng-touched { border-color: #b00020; box-shadow: 0 0 0 2px rgba(176, 0, 32, 0.15); }
    .btn { margin-top: .5rem; }
    pre { background: #f7f7f9; padding: .5rem; border-radius: 4px; }
    `
  ]
})
export class ReactiveFormsDemoComponent {
  form: FormGroup;
  private fruits = ['Apple', 'Banana', 'Cherry', 'Grape'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-z\-\s]+$/)]
      }),
      category: this.fb.control('', { validators: [Validators.required] }),
      fruit: this.fb.control('', { validators: [Validators.required, oneOf(this.fruits)] })
    });
  }

  invalid(controlName: keyof ReactiveFormsDemoComponent['form']['controls']): boolean {
    const c = this.form.controls[controlName as string];
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) return;
    // Normally you would send the data to an API here
  }
}
