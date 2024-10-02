import { Component, signal } from '@angular/core';
import {Form, FormBuilder, FormGroup, Validators} from '@angular/forms';

export enum MathOperator {
  Add = 'plus',
  Subtract = 'moins',
  Multiply = 'fois',
  Divide = 'divisé'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  form: FormGroup;
  n1 = signal<number | null>(null);
  n2 = signal<number | null>(null);
  op = signal<MathOperator>(MathOperator.Add);
  result = signal<number | null>(null);
  MathOperator = MathOperator;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      number1: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      number2: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      operator: [MathOperator.Add, Validators.required]
    });

    this.form.valueChanges.subscribe(values => {
      this.n1.set(values.number1 ? parseFloat(values.number1) : null);
      this.n2.set(values.number2 ? parseFloat(values.number2) : null);
      this.op.set(values.operator as MathOperator); 
      this.calculate();
    });
  }

  calculate() {
    const num1 = this.n1();
    const num2 = this.n2();
    const operator = this.op();

    if (num1 === null || num2 === null) {
      this.result.set(null);
      return;
    }

    let result: number | null;
    switch (operator) {
      case MathOperator.Add:
        result = num1 + num2;
        break;
      case MathOperator.Subtract:
        result = num1 - num2;
        break;
      case MathOperator.Multiply:
        result = num1 * num2;
        break;
      case MathOperator.Divide:
        result = num2 !== 0 ? num1 / num2 : null;
        break;
      default:
        result = null;
    }

    if (this.result() !== result) {
      const resultElement = document.querySelector('.result') as HTMLElement;
      this.result.set(result);

      resultElement.classList.add(result! > (this.result() || 0) ? 'counter-up' : 'counter-down');
      
      setTimeout(() => {
        resultElement.classList.remove('counter-up', 'counter-down');
      }, 300);
    }
  }
}
