import { Component } from '@angular/core';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import * as io from 'socket.io-client';
declare var particlesJS: any;
declare var iziToast: any;

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
  roomId: number;

  constructor() {
    this.socket = io('http://localhost:3000');
    let gameMovementListener = Observable.fromEvent(this.socket, 'recieveGameMovement');
    gameMovementListener.subscribe((idMarked) => {
      if (this.playerName == undefined) {
        this.playerName = "Player 2";
        this.disableBoard();
        this.isPlaying = true;
      }
      this.printOptionSelected(idMarked);
      this.enableBoard();
    });

    let roomListener = Observable.fromEvent(this.socket, 'sendIdRoom');
    roomListener.subscribe((idRoom) => {
      console.log(`Room No. ${idRoom}`);
      this.roomId = Number(idRoom);
    });

    let gameOverListener = Observable.fromEvent(this.socket, 'recieveGameOver');
    gameOverListener.subscribe((solution) => {
      this.printSolution(<number[]>solution);
      this.printLoseMessage();
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



    particlesJS.load('particles-js', 'assets/particles.json', null);
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
    this.disableBoard();
    this.addOptionToPlayer(id);
    if (!this.validateWin()) {
      this.socket.emit('sendGameMovement', this.roomId, id);
    } else {
      this.printWinMessage();
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

  validateNamePlayer(): void {
    if (this.movementsPlayer.length == 0 && !this.isPlaying) {
      this.playerName = "Player 1";
      this.isPlaying = true;
    }
  }

  disableBoard(): void {
    for (let i = 1; i < 10; i++) {
      var element = <HTMLInputElement>document.getElementById(i.toString());
      element.disabled = true;
    }
  }

  addOptionToPlayer(option: number): void {
    this.movementsPlayer.push(option);
  }

  validateWin(): boolean {
    for (let index = 0; index < this.solutions.length; index++) {
      if (this.validateSingleCombination(this.solutions[index])) {
        return true;
      }
    }
    return false;
  }

  validateSingleCombination(combination: number[]): boolean {
    let result = true;
    for (let i = 0; i < combination.length; i++) {
      if (!this.movementsPlayer.includes(combination[i])) {
        result = false;
      }
      if (i == combination.length - 1 && result) {
        this.printSolution(combination);
        this.sendWinAlert(combination);
        return result;
      }
    }
  }

  enableBoard(): void {
    for (let i = 1; i < 10; i++) {
      var element = <HTMLInputElement>document.getElementById(i.toString());
      if (element.innerHTML == "") {
        element.disabled = false;
      }
    }
  }

  printSolution(solution: number[]): void {
    solution.forEach(s => {
      let el = document.getElementById(s.toString());
      el.style.backgroundColor = "green";
    });
  }

  sendWinAlert(solution: number[]): void {
    this.socket.emit('sendGameOver', this.roomId, solution);
  }

  printWinMessage(): void {
    let n = Math.floor((Math.random() * 5) + 1);

    iziToast.show({
      color: 'green',
      image: `assets/images/success/${n}.jpg`,
      imageWidth: 100,
      timeout: 6000,
      close: false,
      title: 'Hey',
      message: 'Congratulations, you have won!',
      position: 'topCenter',
      progressBarColor: 'rgb(0, 255, 184)',
      buttons: [
        ['<button>Close</button>', function (instance, toast) {
          instance.hide(toast, {
            transitionOut: 'fadeOutUp'
          }, 'close', 'buttonName');
        }]
      ]
    });
  }

  printLoseMessage(): void {
    let n = Math.floor((Math.random() * 5) + 1);

    iziToast.show({
      color: 'red',
      image: `assets/images/fail/${n}.jpg`,
      imageWidth: 100,
      timeout: 6000,
      close: false,
      title: 'Hey',
      message: 'You were defeated :(',
      position: 'topCenter',
      progressBarColor: 'rgb(0, 255, 184)',
      buttons: [
        ['<button>Close</button>', function (instance, toast) {
          instance.hide(toast, {
            transitionOut: 'fadeOutUp'
          }, 'close', 'buttonName');
        }]
      ]
    });
  }

}
