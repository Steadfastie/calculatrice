import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
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

  constructor(private formBuilder: FormBuilder, 
    private carouselService: CarouselService
  ) {
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

    let currentDigits = Array.from(resultElement.querySelectorAll('.digit')) as HTMLElement[];
    while (currentDigits.length > newResultString.length) {
      const currentDigit = currentDigits.pop() as HTMLElement;
      resultElement.removeChild(currentDigit);
  }

    for (let i = 0; i < newResultString.length; i++) {
      const newDigit = newResultString[i];
      var currentDigit = currentDigits[i];
      if (currentDigit) {
        if (currentDigit.innerText !== newDigit) {
          this.applyDigitAnimation(currentDigit, newDigit);
        }
      } else {
        const newDigitElement = document.createElement('span');
        newDigitElement.classList.add('digit');
        resultElement.appendChild(newDigitElement);
        this.applyDigitAnimation(newDigitElement, newDigit);
      }
    }
  }

  private applyDigitAnimation(digitElement: HTMLElement, newDigit: string) {
    const animation = digitElement.animate([
        { transform: 'translateY(1px)', opacity: '100%' },
        { opacity: '0%' },
        { transform: 'translateY(-1px)', opacity: '100%' }
    ], {
        duration: 500,
        easing: 'ease-in-out',
        fill: 'forwards'
    });

    setTimeout(() => {
        digitElement.innerText = newDigit;
    }, 250);

    setTimeout(() => {
        animation.cancel();
    }, 500);
}

  ngOnInit() {
    this.carouselService.onSlideChange.subscribe((value: any) => {
      const slideAndID = value as Sliding;
      console.log('Slide changed', slideAndID.slide);

      const operators = [
        MathOperator.Divide,
        MathOperator.Add,
        MathOperator.Subtract,
        MathOperator.Multiply
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
