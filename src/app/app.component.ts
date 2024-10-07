import { Component, contentChildren, effect, ElementRef, signal, viewChild, viewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { CarouselService } from 'ngx-carousel-ease';

export enum MathOperator {
  Add = 'plus',
  Subtract = 'moins',
  Multiply = 'fois',
  Divide = 'divisé'
}

export enum Spacing {
  None = 'aucun',
  Two = 'deux',
  Three = 'trois',
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
  sp = signal<Spacing>(Spacing.None);
  result = signal<number | null>(null);
  digitsUpdated = signal<boolean>(false);
  MathOperator = MathOperator;
  Spacing = Spacing;

  constructor(private formBuilder: FormBuilder, 
    private carouselService: CarouselService
  ) {
    this.form = this.formBuilder.group({
      number1: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      number2: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });

    this.form.valueChanges.subscribe(values => {
      this.n1.set(values.number1 ? parseFloat(values.number1) : null);
      this.n2.set(values.number2 ? parseFloat(values.number2) : null);
      this.calculateResult();
    });

    effect(() => {
      const _ = this.op();
      this.calculateResult();
    }, { allowSignalWrites: true });

    effect(() => {
      const currentSpacing = this.sp();
      const _ = this.digitsUpdated();
      this.applySpacing(currentSpacing);
    });

    effect(() => {
      const currentResult = this.result();
      this.renderResult(currentResult); 
    });
  }

  calculateResult() {
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
        if (num2 === 0) { 
          result = null
          break;
        }
        let rawResult = num1 / num2;
        const lengthNum1 = (num1.toString().match(/\d/g) || []).length;
        const lengthNum2 = (num2.toString().match(/\d/g) || []).length;
        const maxLength = Math.max(lengthNum1, lengthNum2, 9);
        result = parseFloat(rawResult.toFixed(maxLength));
        break;
      default:
        result = null;
    }

    this.result.set(result);
  }

  renderResult(newResult: number | null) {
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
          this.applyUpdateAnimation(currentDigit, newDigit);
        }
      } else {
        const newDigitElement = document.createElement('span');
        newDigitElement.classList.add('digit');
        resultElement.appendChild(newDigitElement);
        this.applyUpdateAnimation(newDigitElement, newDigit);
      }
    }
  }

  private applyUpdateAnimation(digitElement: HTMLElement, newDigit: string) {
    const animation = digitElement.animate([
        { opacity: '100%' },
        { opacity: '0%' },
        { opacity: '100%' }
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
        this.digitsUpdated.set(!this.digitsUpdated());
    }, 500);
  }

  private applySpacing(spacing: Spacing) {
    const resultElement = document.querySelector('.result') as HTMLElement;
    if (!resultElement) return;

    const children = Array.from(resultElement.children) as HTMLElement[];

    children.forEach(child => {
      child.style.marginRight = '';
    });

    if (spacing === Spacing.None) return;
    const spacingValue = spacing === Spacing.Two ? 2 : 3;
  
    children.filter(child => /^\d+$/.test(child.innerText.trim()))
      .forEach((child, index) => {
        if ((index + 1) % spacingValue === 0) {
          child.style.marginRight = '3px'; 
        }
    });
  }

  ngOnInit() {
    this.carouselService.onSlideChange.subscribe((value: any) => {
      const slideAndID = value as Sliding;
      console.log('Slide changed', slideAndID.slide, slideAndID.carouselID);

      if (slideAndID.carouselID === 0) {
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
        this.op.set(operator);
        console.log('Operator set to', operator);
      }

      if (slideAndID.carouselID === 1){
        const spacings = [
          Spacing.None,
          Spacing.Two,
          Spacing.Three
        ];
        const spacing = spacings[slideAndID.slide];
        this.sp.set(spacing);
      }
    });
  };
}
