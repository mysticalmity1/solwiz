const { v4: uuidv4 } = require('uuid');

// In-memory store for active and waiting battles
// Key: roomId, Value: Battle document (or similar state object)
const activeRooms = new Map();

/**
 * Creates a new room code.
 */
function createRoomCode() {
  // Generate a short 6-character alphanumeric code for easy sharing
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Validates if a room can be joined.
 */
function canJoinRoom(roomId) {
  const room = activeRooms.get(roomId);
  return room && room.state === 'waiting';
}

/**
 * Adds a room to tracking.
 */
function trackRoom(roomId, battleData) {
  activeRooms.set(roomId, battleData);
}

/**
 * Gets currently tracked room state.
 */
function getRoom(roomId) {
  return activeRooms.get(roomId);
}

/**
 * Removes a room from memory tracking.
 */
function untrackRoom(roomId) {
  activeRooms.delete(roomId);
}

module.exports = {
  createRoomCode,
  canJoinRoom,
  trackRoom,
  getRoom,
  untrackRoom,
  activeRooms
};
