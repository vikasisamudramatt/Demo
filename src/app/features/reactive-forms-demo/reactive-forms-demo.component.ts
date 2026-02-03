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
  templateUrl: './reactive-forms-demo.component.html',
  styleUrls: ['./reactive-forms-demo.component.css']
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
