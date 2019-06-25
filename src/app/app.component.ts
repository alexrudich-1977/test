import { Component, OnInit } from '@angular/core';
import { Observable, Subscription, fromEvent, merge, interval, empty } from 'rxjs';
import { mapTo, switchMap, scan } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  public counter = 0;
  public duration = '0 : 0 : 0';
  public isStartStopToggle = true;
  public isRestart = false;

  public interval$: Observable<any>;
  public startButton$: Observable<any>;
  public waitButton$: Observable<any>;
  public resetButton$: Observable<any>;
  public summary: Observable<any>;
  public subscription: Subscription;

  ngOnInit() {
    this.interval$ = interval(1000);
    this.startButton$ = fromEvent(document.getElementById('start'), 'click')
      .pipe(mapTo('start'));
    this.waitButton$ = fromEvent(document.getElementById('wait'), 'click')
      .pipe(mapTo('wait'));
    this.resetButton$ = fromEvent(document.getElementById('reset'), 'click')
      .pipe(mapTo('reset'));

    this.summary = merge(
      this.startButton$,
      this.waitButton$,
      this.resetButton$
    ).pipe(
      switchMap(val => {
          if (val === 'start' && !this.isStartStopToggle) {
            val = 'stop';
          }
          console.log(val);
          switch (val) {
            case 'start':
              this.isStartStopToggle = false;
              return this.interval$; break;
            case 'stop' :
              this.isStartStopToggle = true;
              return empty(); break;
            case 'reset' :
              this.isStartStopToggle = true;
              this.isRestart = true;
              this.counter = 0;
              this.duration = '0 : 0 : 0';
              return empty(); break;
            case 'wait' :                       // need to clerify task ????????
              this.isStartStopToggle = true;
              return empty(); break;
          }
        }
      ),
      scan(acc => {
        if (this.isRestart) {
          this.isRestart = false;
          return 0;
        } else {
          return (1 + acc)
        }       
      })
    );

    this.subscription = this.summary.subscribe(
      data => {
        this.counter = data;
        this.dateParser(this.counter);
      },
      err => console.log(err),
      () => console.log('complete')
    );
  }

  public dateParser(counter: number): void {
    let hours = Math.floor(counter / 3600);
    counter %= 3600;
    let minutes = Math.floor(counter / 60);
    let seconds = counter % 60;
    this.duration = hours + ' : ' + minutes + ' : ' + seconds;    
  }
}
