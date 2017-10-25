/**
 * `p4-start-page` P4 splash screen
 *
 * @summary P4 splash screen.
 * @customElement
 * @polymer
 * @extends {Polymer.Element}
 */
class P4StartPage extends Polymer.Element {
  /**
     * String providing the tag name to register the element under.
     */
  static get is() {
    return 'p4-start-page';
  }

  /**
     * Object describing property-related metadata used by Polymer features
     */
  static get properties() {
    return {
      route: Object,
      _gameRooms: {
        type: Array,
      },
      _gameRoomName: String,
      player: {
        type: Object,
        notify: true,
      },
      _isCollapseOpened: {
        type: Boolean,
        observer: '_collapseChanged',
      },
    };
  }

  /**
  * Use for one-time configuration of your component after local DOM is initialized.
  */
  ready() {
    super.ready();
  }

  _collapseChanged(isCollapseOpened) {
    if (isCollapseOpened) {
      this.$.startBtn.style.display = 'none';
      this.$.input.focus();
    } else {
      this.$.startBtn.style.display = 'block';
    }
  }

  _toggleCollapse() {
    this.$.collapse.toggle();
  }

  _handleOkBtn() {
    if (this._gameRoomName !== '') {
      this._initGameRoom(this._gameRoomName);
    }
  }

  _handleInputKeyUp(e) {
    const gameRoomName = e.currentTarget.value;
    if (e.keyCode === 13 && gameRoomName !== '') {
      this._initGameRoom(gameRoomName);
    }
  }

  _initGameRoom(gameRoomName) {
    this.$.collapse.toggle();
    const board = this._getNewBoard();
    const player1 = this._getPlayer1();
    const name = gameRoomName;
    const newGameRoom = this.$.query.ref.push({
      board,
      name,
    });
    // wait for firebase to return game and player IDs and redirect the player to the game room
    newGameRoom.once('value').then((gameRoomSnapshot) => {
      const newPlayer = this._addPlayer(gameRoomSnapshot.key, player1);
      newPlayer.once('value').then((playerSnapshot) => {
        this.set('player', playerSnapshot.val());
        this._goToGameRoom(gameRoomSnapshot.key);
      });
    });
  }

  _joinGameRoom(e) {
    const gameRoomId = e.model.get('gameRoom.$key');
    const player2 = this._getPlayer2();
    const newPlayer = this._addPlayer(gameRoomId, player2);
    newPlayer.once('value').then((playerSnapshot) => {
      this.set('player', playerSnapshot.val());
      this._goToGameRoom(gameRoomId);
    });
  }

  _addPlayer(gameRoomdId, player) {
    return this.$.query.ref.child(`${gameRoomdId}/players`).push(player);
  }

  _goToGameRoom(gameRoomId) {
    this.set('route.path', `/gameroom/${gameRoomId}`);
  }

  _getPlayer1() {
    return {
      id: 1,
      name: 'Player 1',
    };
  }

  _getPlayer2() {
    return {
      id: 2,
      name: 'Player 2',
    };
  }

  _getNewBoard() {
    return [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ];
  }

  /* Return games with a free spot */
  _getGameRooms(gameRooms) {
    return gameRooms.base.filter((gameRoom) => {
      if (gameRoom.players) {
        return Object.keys(gameRoom.players).length < 2;
      }
      return false;
    });
  }

  _hasGameRooms(gameRooms) {
    if (gameRooms.base.length > 0) {
      return true;
    }
    return false;
  }

  _hasFreeSpot(players) {
    return Object.keys(players).length < 2;
  }
}

window.customElements.define(P4StartPage.is, P4StartPage);
