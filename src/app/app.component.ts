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
  roomId: string;

  constructor() {
    this.socket = io('http://localhost:3000');

    let roomListener = Observable.fromEvent(this.socket, 'receiveConnectionInfo');
    roomListener.subscribe((connectionInfo: any) => {
      console.log(`Room No: ${connectionInfo.idRoom} Player Number: ${connectionInfo.numberPlayer}`);
      this.roomId = connectionInfo.idRoom;
      if (connectionInfo.isActive) {
        this.disableBoard();
        this.printNoOpponentMessage();
      } else {
        this.enableBoard();
        this.printOpponentConnectedMessage();
      }
    });

    let disconnectListener = Observable.fromEvent(this.socket, 'userDisconnected');
    disconnectListener.subscribe((connectionInfo) => {
      this.printOpponentHasLeaveMessage();
    });

    let gameMovementListener = Observable.fromEvent(this.socket, 'receiveGameMovement');
    gameMovementListener.subscribe((idMarked) => {
      if (this.playerName == undefined) {
        this.playerName = "Player 2";
        this.isPlaying = true;
        this.disableBoard();
      }
      this.printOptionSelected(idMarked);
      this.enableBoard();
    });

    let gameOverListener = Observable.fromEvent(this.socket, 'receiveGameOver');
    gameOverListener.subscribe((solution) => {
      this.printSolution(<number[]>solution);
      this.printLoseMessage();
    });

    let newGameListener = Observable.fromEvent(this.socket, 'receiveNewGame');
    newGameListener.subscribe(() => {
      this.resetGame();
      this.printNewGameMessage();
    });

    let noWinnerListener = Observable.fromEvent(this.socket, 'receiveNoWinner');
    noWinnerListener.subscribe(() => {
      this.printNoWinnerMessage();
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
      this.sendGameMovementNotification(id);
    } else {
      this.printWinMessage();
    }
    this.validateATie();
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

  validateATie(): void {
    let sum = 0;
    for (let i = 1; i < 10; i++) {
      var element = <HTMLInputElement>document.getElementById(i.toString());
      if (element.innerHTML != "") {
        sum++;
      }
    }

    if (sum == 9) {
      this.printNoWinnerMessage();
      this.sendNoWinnerNotification();
    }
  }

  validateSingleCombination(combination: number[]): boolean {
    let result = true;
    for (let i = 0; i < combination.length; i++) {
      if (!this.movementsPlayer.includes(combination[i])) {
        result = false;
      }
      if (i == combination.length - 1 && result) {
        this.printSolution(combination);
        this.sendWinNotification(combination);
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
      if (el.innerHTML == "") {
        this.printOptionSelected(s);
      }
      el.style.backgroundColor = "green";
    });
  }

  sendWinNotification(solution: number[]): void {
    this.socket.emit('sendGameOver', this.roomId, solution);
  }

  sendNewGameNotification(): void {
    this.socket.emit('sendNewGame', this.roomId);
  }

  sendGameMovementNotification(id: number): void {
    this.socket.emit('sendGameMovement', this.roomId, id);
  }

  sendNoWinnerNotification(): void {
    this.socket.emit('noWinner', this.roomId);
  }

  printNoOpponentMessage(): void {
    let n = Math.floor((Math.random() * 3) + 1);

    iziToast.show({
      theme: 'dark',
      image: `assets/images/no-opponent/${n}.jpg`,
      imageWidth: 100,
      timeout: false,
      close: false,
      title: 'Bad news :(',
      message: 'No opponent connected, yet..',
      position: 'topCenter',
      progressBarColor: 'rgb(0, 255, 184)',
      buttons: [
        ['<button id="no-opponent-message-id">Close</button>', function (instance, toast) {
          instance.hide(toast, {
            transitionOut: 'fadeOutUp'
          }, 'close', 'buttonName');
        }]
      ]
    });
  }

  printOpponentConnectedMessage(): void {
    let n = Math.floor((Math.random() * 3) + 1);
    let el = document.getElementById('no-opponent-message-id');
    if (el != null) { el.click(); }

    iziToast.show({
      color: 'blue',
      image: `assets/images/new-opponent/${n}.jpg`,
      imageWidth: 100,
      timeout: 5000,
      close: false,
      title: 'Good news!',
      message: "You opponent has connected, let's play!",
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

  printOpponentHasLeaveMessage(): void {
    let n = Math.floor((Math.random() * 3) + 1);
    this.disableBoard();
    iziToast.show({
      theme: 'light',
      image: `assets/images/leave-game/${3}.jpg`,
      imageWidth: 100,
      timeout: false,
      close: false,
      title: 'Stop !',
      message: 'Your opponent has disconnected',
      position: 'topCenter',
      progressBarColor: 'rgb(0, 255, 184)',
      buttons: [
        ['<button>Close</button>', function (instance, toast) {
          instance.hide(toast, {
            transitionOut: 'fadeOutUp'
          }, 'close', 'buttonName');
        }],
        ['<button>Reload To connect another Opponents</button>', function (instance, toast) {
          location.reload();
        }, true]
      ]
    });
  }

  printWinMessage(): void {
    let n = Math.floor((Math.random() * 5) + 1);
    let self = this;

    iziToast.show({
      color: 'green',
      image: `assets/images/success/${n}.jpg`,
      imageWidth: 100,
      timeout: false,
      close: false,
      title: 'Hey!',
      message: 'Congratulations, you have won!',
      position: 'topCenter',
      progressBarColor: 'rgb(0, 255, 184)',
      buttons: [
        ['<button id="win-message-id">Close</button>', function (instance, toast) {
          instance.hide(toast, {
            transitionOut: 'fadeOutUp'
          }, 'close', 'buttonName');
        }],
        ['<button>Reset Game</button>', function (instance, toast) {
          self.resetGame();
          self.sendNewGameNotification();
          instance.hide(toast, {
            transitionOut: 'fadeOutUp'
          }, 'close', 'buttonName');
        }, true]
      ]
    });
  }

  printLoseMessage(): void {
    let n = Math.floor((Math.random() * 5) + 1);
    let self = this;

    iziToast.show({
      color: 'red',
      image: `assets/images/fail/${n}.jpg`,
      imageWidth: 100,
      timeout: false,
      close: false,
      title: 'Hey!',
      message: 'You were defeated :(',
      position: 'topCenter',
      progressBarColor: 'rgb(0, 255, 184)',
      buttons: [
        ['<button id="lose-message-id">Close</button>', function (instance, toast) {
          instance.hide(toast, {
            transitionOut: 'fadeOutUp'
          }, 'close', 'buttonName');
        }],
        ['<button>Reset Game</button>', function (instance, toast) {
          self.resetGame();
          self.sendNewGameNotification();
          instance.hide(toast, {
            transitionOut: 'fadeOutUp'
          }, 'close', 'buttonName');
        }, true]
      ]
    });
  }

  printNewGameMessage(): void {
    let n = Math.floor((Math.random() * 3) + 1);
    let el = document.getElementById('lose-message-id');
    if (el != null) { el.click(); }
    el = document.getElementById('win-message-id');
    if (el != null) { el.click(); }
    el = document.getElementById('no-winner-message-id');
    if (el != null) { el.click(); }

    iziToast.show({
      theme: 'dark',
      image: `assets/images/new-opponent/${n}.jpg`,
      imageWidth: 100,
      timeout: 5000,
      close: false,
      title: 'Hey!',
      message: 'It seems your oponent want another game!',
      position: 'topCenter',
      progressBarColor: 'rgb(0, 255, 184)',
      buttons: [
        ['<button>Ok</button>', function (instance, toast) {
          instance.hide(toast, {
            transitionOut: 'fadeOutUp'
          }, 'close', 'buttonName');
        }]
      ]
    });
  }

  printNoWinnerMessage(): void {
    let n = Math.floor((Math.random() * 2) + 1);
    let self = this;

    iziToast.show({
      theme: 'dark',
      image: `assets/images/no-winner/${n}.png`,
      imageWidth: 100,
      timeout: false,
      close: false,
      title: 'Hey!',
      message: 'Nobody has won!',
      position: 'topCenter',
      progressBarColor: 'rgb(0, 255, 184)',
      buttons: [
        ['<button id="no-winner-message-id">Close</button>', function (instance, toast) {
          instance.hide(toast, {
            transitionOut: 'fadeOutUp'
          }, 'close', 'buttonName');
        }],
        ['<button>Reset Game</button>', function (instance, toast) {
          self.resetGame();
          self.sendNewGameNotification();
          instance.hide(toast, {
            transitionOut: 'fadeOutUp'
          }, 'close', 'buttonName');
        }, true]
      ]
    });
  }

  resetGame(): void {
    for (let i = 1; i < 10; i++) {
      var el = <HTMLInputElement>document.getElementById(i.toString());
      el.innerHTML = "";
      el.disabled = false;
      el.style.backgroundColor = 'rgb(' + 51 + ',' + 122 + ',' + 183 + ')';
    }

    this.movementsPlayer = [];
  }

}
