import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import {Form, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { CarouselService } from 'ngx-carousel-ease';

export enum MathOperator {
  Add = 'plus',
  Subtract = 'moins',
  Multiply = 'fois',
  Divide = 'divisé'
}

interface Sliding {
  slide: number;
  carouselID: number;
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

  constructor(private formBuilder: FormBuilder, private carouselService: CarouselService) {
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

    this.animateCounter(result);
  }

  animateCounter(newResult: number | null) {
    const resultElement = document.querySelector('.result') as HTMLElement;
    const newResultString = newResult !== null ? newResult.toString() : '';

    let currentDigits = resultElement.querySelectorAll('.digit');
    for (let i = 0; i < newResultString.length - currentDigits.length; i++) {
      const newDigit = document.createElement('span');
      newDigit.classList.add('digit');
      resultElement.appendChild(newDigit);
    }

    for (let i = 0; i < currentDigits.length - newResultString.length; i++) {
      const currentDigit = currentDigits[currentDigits.length - (i + 1)] as HTMLElement;
      resultElement.removeChild(currentDigit);
    }

    currentDigits = resultElement.querySelectorAll('.digit'); // refresh
    for (let i = 0; i < Math.max(currentDigits.length, newResultString.length); i++) {
      const currentDigit = currentDigits[i] as HTMLElement;
      const newDigit = newResultString[i] || '0';

      if (currentDigit) {
        if (currentDigit.innerText !== newDigit) {
          currentDigit.classList.add('flip');
          
          setTimeout(() => {
            currentDigit.innerText = newDigit;
            currentDigit.classList.remove('flip');
          }, 400);
        }
      }
    }
  }

  ngOnInit() {
    this.carouselService.onSlideChange.subscribe((value: any) => {
      const slideAndID = value as Sliding;
      console.log('Slide changed', slideAndID.slide);

      const operators = [
        MathOperator.Add,
        MathOperator.Subtract,
        MathOperator.Multiply,
        MathOperator.Divide
      ];
      let index: number;
      if (slideAndID.slide + 1 >= operators.length) {
        index = 0;
      } else {
        index = slideAndID.slide + 1;
      }
      const operator = operators[index];
      this.form.controls['operator'].setValue(operator);
    });
  };
}
