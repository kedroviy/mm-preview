function notSupported(name: string): never {
  throw new Error(
    `${name} is not wired to movie-match; use roomsApi from @mm-preview/sdk`,
  );
}

export async function RoomsController_createRoom(_body: unknown) {
  return notSupported("RoomsController_createRoom");
}

export async function RoomsController_getMyRooms() {
  return notSupported("RoomsController_getMyRooms");
}

export async function RoomsController_getRoom(_path: { id: string }) {
  return notSupported("RoomsController_getRoom");
}

export async function RoomsController_joinRoom(_body: unknown) {
  return notSupported("RoomsController_joinRoom");
}

export async function RoomsController_leaveRoom(
  _path: { id: string },
  _body: unknown,
) {
  return notSupported("RoomsController_leaveRoom");
}

export async function RoomsController_chooseMovie(
  _path: { id: string },
  _body: unknown,
) {
  return notSupported("RoomsController_chooseMovie");
}

export async function RoomsController_getRoomMembers(_path: { id: string }) {
  return notSupported("RoomsController_getRoomMembers");
}

export async function RoomsController_removeUserFromRoom(_path: {
  id: string;
  userId: string;
}) {
  return notSupported("RoomsController_removeUserFromRoom");
}

export async function RoomsController_getChatHistory(_path: { id: string }) {
  return notSupported("RoomsController_getChatHistory");
}

export async function RoomsController_muteUser(
  _path: { id: string; userId: string },
  _body: unknown,
) {
  return notSupported("RoomsController_muteUser");
}

export async function RoomsController_unmuteUser(_path: {
  id: string;
  userId: string;
}) {
  return notSupported("RoomsController_unmuteUser");
}
