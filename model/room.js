class RoomUser {
  constructor(user, isHost) {
    this._user = user;
    this._ready = false;
    this._isHost = isHost;
  }

  get public() {
    return { user: this._user.public, ready: this._ready, isHost: this._isHost };
  }
}

class Room {
  constructor(hostId, user) {
    this._users = {};
    this._users[hostId] = new RoomUser(user, true);
  }

  get users() { return this._users; }

  addUser(id, user, isHost) { this._users[id] = new RoomUser(user, isHost || false); }
  removeUser(id) { delete this._users[id]; }

  getUserById(id) {
    var roomUser = this._users[id];
    if (!roomUser)
      return undefined;

    return roomUser.public;
  }

  getAll() {
    var result = {};
    Object.keys(this._users).forEach(id => {
      var roomUser = this.getUserById(id);
      result[roomUser.user.pid] = roomUser;
    });
    return result;
  }
}

class RoomCollection {
  constructor() {
    this._rooms = {};
  }

  get rooms() { return this._rooms; }

  addRoom(id, room) {
    if (!this._rooms[id])
      this._rooms[id] = room;
    else
      throw `Room with id ${id} already in roomCollection.`;
  }

  removeRoom(id) {
    if (this._rooms[id])
      delete this._rooms[id];
    else
      throw `Room with id ${id} not in roomCollection.`;
  }

  getRoomById(id) { return this._rooms[id]; }
}

module.exports = { Room, RoomCollection };