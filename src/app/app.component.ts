import { Component } from '@angular/core';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  options: any[];
  solutions: any[];

  movementsPlayer: number[];
  tooglePlayer: boolean;
  isPlaying: boolean;
  playerName: string;
  socket = null;

  constructor() {
    this.socket = io('http://localhost:3000');
    let listener = Observable.fromEvent(this.socket, 'recieveGameMovement');
    listener.subscribe((idMarked) => {
      if (this.playerName == undefined) {
        this.playerName = "Player 2";
        this.isPlaying = true;
      }
      this.printOptionSelected(idMarked);
      console.log(`It have been marked ${idMarked}`);
      console.log(`Player: ${this.tooglePlayer}`)
    });
  }

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

    this.tooglePlayer = true;
    this.movementsPlayer = [];

    this.backgroundPicture();
  }

  backgroundPicture(): void {
    let n = Math.floor((Math.random() * 5) + 1);
    let clase = 'c' + n;
    let el = document.getElementById('particles-js');
    el.classList.add(clase);
  }

  onOptionMarked(id) {
    this.printOptionSelected(id);
    this.validateNamePlayer();
    this.addOptionToPlayer(id);
    this.socket.emit('sendGameMovement', id);
  }

  addOptionToPlayer(option: number): void {
    this.movementsPlayer.push(option);
  }

  validateNamePlayer(): void {
    if (this.movementsPlayer.length == 0 && !this.isPlaying) {
      this.playerName = "Player 1";
      this.isPlaying = true;
    }
  }

  printOptionSelected(id): void {
    let elemento = document.getElementById(id);
    if (this.tooglePlayer) {
      elemento.innerHTML = 'X'
    } else {
      elemento.innerHTML = 'O'
    }
    this.tooglePlayer = !this.tooglePlayer;
  }

}
