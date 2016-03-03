class RoomController {
  constructor($state, params, toastr, socket, userService, $uibModal) {
    this.$state = $state;
    this.toastr = toastr;
    this.socket = socket;
    this.userService = userService;
    this.roomId = params.roomId;
    this.$modal = $uibModal;

    this.messages = [];
    this._setup(this.roomId);
  }

  sendMessage() {
    this.socket.emit('msg', {
      roomId: this.roomId,
      chatMsg: this.chatMsg
    }, data => {

    });
    this.chatMsg = '';
  }

  startGame() {
    this.socket.emit('startgame', { roomId: this.roomId }, (data, error) => {
      if (error) {
        this.toastr.warning(error);
      }
    });
  }
  
  pause(intent) {
    this.socket.emit('pause', { roomId: this.roomId, intent: intent }, (data, error) => {
      if (error) {
        this.toastr.error(error);
      } else {
        if (data.isSpy) {
          var theModal = this.$modal.open({
              animation: true,
              size: 'sm',
              templateUrl: '/views/select-pause-action-modal',
              controller: selectPauseActionController,
              resolve: {
                roomId: () => this.roomId
              }
          });
        }
      }
    });
  }

  toggleReady() {
    this.socket.emit('toggleready', {
      roomId: this.roomId
    });
  }

  _setup(roomId) {
    this.log = angular.element(document.querySelector('#chatLog'));

    this.socket.emit('join', { roomId }, (data, error) => {
      if (error) {
        this.toastr.error(error);
        this.$state.go('home');
      }
      else {
        this.users = data.users;
        this.isHost = data.isHost;
        this.host = data.host
      }
    });

    this.socket.on('user:join', data => {
      this.users[data.user] = false;
    });

    this.socket.on('user:disconnect', data => {
      delete this.users[data.user];
    });

    this.socket.on('user:msg', data => {
      this.messages.push(data.chatMsg);
    });

    this.socket.on('user:change-username', data => {
      this.users[data.newUsername] = this.users[data.oldUsername];
      delete this.users[data.oldUsername];
    });
    
    this.socket.on('user:toggleready', data => {
      this.users[data.user] = data.isReady;
    });

    this.socket.on('user:startgame', data => {
      this.startTime = data.startTime;
      this.endTime = data.endTime;
      this.isPaused = false;
    });
  }
}

RoomController.$inject = ['$state', '$stateParams', 'toastr', 'socketService', 'userService', '$uibModal'];


selectPauseActionController.$inject = ['$scope', '$uibModalInstance', 'socketService', 'roomId'];
function selectPauseActionController ($scope, theModal, socket, roomId) {
  $scope.accuse = accuse;
  $scope.guessLocation = guessLocation;
  
  function accuse() {
    socket.emit('pause', { roomId: roomId, intent: 'accuse'}, (data, error) => {
      if (error) {
        theModal.dismiss(error);
      } else {
        theModal.close();
      }
    });
  }
  
  function guessLocation() {
    socket.emit('pause', { roomId: roomId, intent: 'guessLocation'}, (data, error) => {
      if (error) {
        theModal.dismiss(error);
      } else {
        theModal.close();
      }
    });
  }
}

export { RoomController };
