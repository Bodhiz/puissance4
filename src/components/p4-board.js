/**
 * `LowerCaseDashedName` Description
 *
 * @summary ShortDescription.
 * @customElement
 * @polymer
 * @extends {Polymer.Element}
 */
class P4Board extends Polymer.Element {
  /**
     * String providing the tag name to register the element under.
     */
  static get is() {
    return 'p4-board';
  }

  /**
     * Object describing property-related metadata used by Polymer features
     */
  static get properties() {
    return {
      board: {
        type: Array,
        notify: true,
      },
      nbColumns: {
        type: Number,
        value: 7,
      },
      nbRows: {
        type: Number,
        value: 6,
      },
      currentPlayer: {
        type: Number,
        notify: true,
      },
      disabled: {
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
    return ['_disabledChanged(disabled)'];
  }
  /**
     * Use for one-time configuration of your component after local DOM is initialized.
     */
  ready() {
    super.ready();
  }

  _disabledChanged(disabled) {
    if (disabled) {
      this.classList.add('disabled');
    } else {
      this.classList.remove('disabled');
    }
  }

  initBoard() {
    const board = [];
    for (let colIndex = 0; colIndex < this.nbColumns; colIndex += 1) {
      board[colIndex] = [];
      for (let rowIndex = 0; rowIndex < this.nbRows; rowIndex += 1) {
        board[colIndex][rowIndex] = 0;
      }
    }
    this.set('board', board);
  }

  _dropCoin(e) {
    if (!this.disabled) {
      const colIndex = e.model.get('colIndex');
      // Find the first free coin spot.
      const rowIndex = this.board[colIndex].lastIndexOf(0);
      this.set(`board.${colIndex}.${rowIndex}`, this.currentPlayer);
      const isWinner = this._isWinner(this.currentPlayer);
      if (!isWinner) {
        this._switchCurrentPlayer(this.currentPlayer);
      } else {
        this.dispatchEvent(new CustomEvent('winner', {}));
      }
    }
  }

  _isWinner(playerId) {
    if (
      this._parseVertical(playerId) !== -1 ||
      this._parseVertical(playerId) !== -1 ||
      this._parseAscendingDiagonal(playerId) !== -1 ||
      this._parseDescendingDiagonal(playerId) !== -1
    ) {
      return true;
    }

    return false;
  }

  _parseVertical(playerId) {
    for (let a = 0; a < this.board.length; a += 1) {
      for (let b = 3; b < this.board.length; b += 1) {
        if (
          this.board[a][b - 3] === playerId &&
          this.board[a][b - 2] === playerId &&
          this.board[a][b - 1] === playerId &&
          this.board[a][b] === playerId
        ) {
          return playerId;
        }
      }
    }
    return -1;
  }

  _parseHorizontal(playerId) {
    for (let a = 0; a < this.board.length; a += 1) {
      for (let b = 3; b < this.board.length; b += 1) {
        if (
          this.board[b - 3][a] === playerId &&
          this.board[b - 2][a] === playerId &&
          this.board[b - 1][a] === playerId &&
          this.board[b][a] === playerId
        ) {
          return playerId;
        }
      }
    }
    return -1;
  }

  _parseAscendingDiagonal(playerId) {
    for (let a = 3; a < 7; a += 1) {
      for (let b = 0; b < 3; b += 1) {
        if (
          this.board[a][b] === playerId &&
          this.board[a - 1][b + 1] === playerId &&
          this.board[a - 2][b + 2] === playerId &&
          this.board[a - 3][b + 3] === playerId
        ) {
          return playerId;
        }
      }
    }
    return -1;
  }

  _parseDescendingDiagonal(playerId) {
    for (let a = 0; a < 4; a += 1) {
      for (let b = 0; b < 3; b += 1) {
        if (
          this.board[a][b] === playerId &&
          this.board[a + 1][b + 1] === playerId &&
          this.board[a + 2][b + 2] === playerId &&
          this.board[a + 3][b + 3] === playerId
        ) {
          return playerId;
        }
      }
    }
    return -1;
  }

  _switchCurrentPlayer(currentPlayer) {
    if (currentPlayer === 1) {
      this.currentPlayer = 2;
    } else {
      this.currentPlayer = 1;
    }
  }

  _computeCoinColor(playerId) {
    if (playerId === 1) {
      return 'p1';
    } else if (playerId === 2) {
      return 'p2';
    }

    return '';
  }
}

window.customElements.define(P4Board.is, P4Board);
