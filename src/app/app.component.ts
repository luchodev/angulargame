import { Component } from '@angular/core';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  options: any[];
  solutions: any[];
  tooglePlayer = true;

  ngOnInit() {
    this.options = [
      [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ],
      [
        { id: 4 },
        { id: 5 },
        { id: 6 }
      ],
      [
        { id: 7 },
        { id: 8 },
        { id: 9 }
      ]
    ];

    this.solutions = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      [7, 5, 3],
      [9, 5, 1]
    ];

    this.backgroundPicture();
  }

  backgroundPicture(): void {
    let n = Math.floor((Math.random() * 5) + 1);
    let clase = 'c' + n;
    let el = document.getElementById('particles-js');
    el.classList.add(clase);
  }

  sendAction(id, propagate) {
    this.printSymbol(id);
  }

  printSymbol(id) {
    let elemento = document.getElementById(id);
    if (this.tooglePlayer) {
      elemento.innerHTML = 'X'
    } else {
      elemento.innerHTML = 'O'
    }
  }

}
