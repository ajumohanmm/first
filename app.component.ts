import { Component } from '@angular/core';
import { StrintService } from './strint.service';
import { StrintDecimalService } from './strint-decimal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'HelloWorld';

  constructor(
    private strint: StrintService,
    private strintdecimal: StrintDecimalService
  ) {
    console.log(Number.MAX_SAFE_INTEGER);
    console.log('STRINT');
    console.log('------------------');
    console.log(strint.add('9007199254740991.6', '1'));
    console.log(strint.add('9007199254740991.6', '2'));
    console.log(strint.add('9007199254740991', '3'));
    console.log(strint.add('9007199254740991', '4'));
    console.log(strint.add('9007199254740991', '5'));

    
    console.log('STRINT DECIMAL');
    console.log('------------------');
    console.log(strintdecimal.add('9007199254740991.6', '1'));
    console.log(strintdecimal.add('9007199254740991.6', '2'));
    console.log(strintdecimal.add('9007199254740991', '3'));
    console.log(strintdecimal.add('9007199254740991', '4'));
    console.log(strintdecimal.add('9007199254740991', '5'));

    console.log(strintdecimal.ge('9007199254740991.6', '9007199254740991.6'))

    
    console.log('REGULAR');
    console.log('------------------');
    console.log(9007199254740991+1);
    console.log(9007199254740991+2);
    console.log(9007199254740991+3);
    console.log(9007199254740991+4);
    console.log(9007199254740991+5);
  }
}
