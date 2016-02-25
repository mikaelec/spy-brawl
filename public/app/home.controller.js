class HomeController {
  constructor(socketService, userService) {
    this.socket = socketService;
    this.userService = userService;

    this._setup();
  }

  createRoom() {

  }

  _setup() {
    this.socket.emit('conn', null, data => {
      this.userService.userSid = data.userSid;
      this.userService.username = data.username;
      this.rooms = data.rooms;
      this.users = data.users;
    });

    this.socket.on('user:connect', data => {
      this.users.push(data.user);
    });

    this.socket.on('user:disconnect', data => {
      this.users.splice(this.users.indexOf(data.user));
    });
  }
}

HomeController.$inject = ['socketService', 'userService'];

export { HomeController }
