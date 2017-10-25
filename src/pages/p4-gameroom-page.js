/* eslint-disable no-mixed-operators */
/**
 * `p4-game-page` P4 game page
 *
 * @summary P4 game page.
 * @customElement
 * @polymer
 * @extends {Polymer.Element}
 */
class P4GameroomPage extends Polymer.Element {
  /**
     * String providing the tag name to register the element under.
     */
  static get is() {
    return 'p4-gameroom-page';
  }

  /**
     * Object describing property-related metadata used by Polymer features
     */
  static get properties() {
    return {
      subroute: Object,
      playerGuid: {
        type: String,
      },
      _routeData: Object,
      _gameRoomId: String,
      _gameRoom: Object,
      player: Object,
      _isGameRoomFull: {
        type: Boolean,
        value: false,
      },
      _dialogMessage: String,
      _fitDialogElementInto: Object,
      _board: Array,
      _isWinner: {
        type: Boolean,
        value: false,
      },
      _isGameFinished: {
        type: Boolean,
        value: false,
      },
    };
  }

  /**
    * Array of strings describing multi-property observer methods and their
    * dependant properties
    */
  static get observers() {
    return [
      '_routeDataChanged(_routeData)',
      '_gameRoomChanged(_gameRoom.*)',
      '_winnerChanged(_gameRoom.winner)',
      '_isGameRoomFullChanged(_isGameRoomFull)',
      '_waitMyTurn(_gameRoom.currentPlayer, _isGameRoomFull, player)',
    ];
  }

  /**
     * Use for one-time configuration of your component after local DOM is initialized.
     */
  ready() {
    super.ready();
    this._fitDialogElementInto = this.shadowRoot.querySelector('.boardContainer');
  }

  _gameRoomChanged(gameRoom) {
    const gr = gameRoom.base;
    if (!this._isGameRoomFull && gr.players && Object.keys(gr.players).length === 2) {
      this._isGameRoomFull = true;
      this._setStartingPlayer(gr);
    }
  }

  _setStartingPlayer() {
    const startingPlayerId = Math.floor(Math.random() * (2 - 1 + 1) + 1);
    this.set('_gameRoom.currentPlayer', startingPlayerId);
    this.$.query.setStoredValue(this.$.query.path, this._gameRoom);
  }

  _routeDataChanged(routeData) {
    this._gameRoomId = routeData.game_id;
  }

  _waitMyTurn(currentPlayerId, isGameRoomFull, player) {
    const isMyTurn = this._isMyTurn(currentPlayerId, player.id);
    if (isGameRoomFull && !isMyTurn) {
      this._dialogMessage = 'Please wait for your opponent to play...';
      this.$.board.disabled = true;
      this.$.dialog.open();
    } else if (isGameRoomFull && isMyTurn) {
      this.$.board.disabled = false;
      this.$.dialog.close();
    }
  }

  _isGameRoomFullChanged(isGameRoomFull) {
    if (!isGameRoomFull) {
      this._dialogMessage = 'Please wait for an opponent to join...';
      this.$.board.disabled = true;
      this.$.dialog.open();
    } else {
      this.$.board.disabled = false;
      this.$.dialog.close();
    }
  }

  _winnerChanged(winner) {
    if (winner) {
      if (winner === this.player.id) {
        this._isWinner = true;
        this._dialogMessage = 'Congrats you won the game !';
      } else {
        this._isWinner = false;
        this._dialogMessage = 'Sorry you lost the game !';
      }
      this._isGameFinished = true;
      this.$.board.disabled = true;
      this.$.dialog.notifyResize(); // Fix dialog centering.
      this.$.dialog.open();
    }
  }

  _handleWinner() {
    this.set('_gameRoom.winner', this.player.id);
  }

  _getPlayers(players) {
    if (players) {
      return Object.values(players);
    }
    return null;
  }

  _isMyTurn(currentPlayerId, playerId) {
    if (playerId !== currentPlayerId) {
      return false;
    }
    return true;
  }

  _getActiveClass(currentPlayerId, playerId) {
    if (this._isMyTurn(currentPlayerId, playerId)) {
      return 'active';
    }
    return '';
  }

  _isMe(currentPlayerId, playerId) {
    if (currentPlayerId === playerId) {
      return true;
    }

    return false;
  }
}

window.customElements.define(P4GameroomPage.is, P4GameroomPage);
