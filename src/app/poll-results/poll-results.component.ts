import { Component, OnInit, Input } from '@angular/core';
import * as Chart from 'chart.js'
import { Log } from '../logger';

@Component({
  selector: 'app-poll-results',
  templateUrl: './poll-results.component.html',
  styleUrls: ['./poll-results.component.css']
})
export class PollResultsComponent implements OnInit {

  constructor() { }

  @Input() results : any = {
    'Yes' : 32,
    'No' : 15,
  };
  @Input() question : string;
  canvas : any;
  ctx: any;

  colors = ['#2c3e50', '#18bc9c', '#3498db', '#e74c3c', '#f39c12', '#7b8a8b', '#c5395e' , '#694aab'];

  ngOnInit() {
    this.draw();
  }

  draw() {
    this.canvas = document.getElementById('pollResults');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    } else {
      Log.e(this, "Error getting canvas for graph drawing")
    }

    let values = []
    let keys = []
    Object.keys(this.results).forEach((key) => {
      keys.push(key);
      values.push(this.results[key])
    });

    let backgroundColors = []
    
    for (var i = 0; i < values.length; i++) {
      Log.d(this, this.colors)
      backgroundColors.push(this.colors[i % this.colors.length]);
    }

    let data = {
      datasets: [{
          data: values,
          backgroundColor: backgroundColors
      }],
  
      labels: keys
    };

    Log.ds(this, data)

    let myPieChart = new Chart(this.ctx, {
      type: 'pie',
      data: data
    });
  }
}
