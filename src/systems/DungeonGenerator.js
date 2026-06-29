/* Procedural dungeon generator — scatter rooms + MST corridors */
const DungeonGenerator = {

  generate(floor = 1) {
    const W = C.MAP_W, H = C.MAP_H;
    const tiles = Array.from({ length: H }, () => new Array(W).fill(C.TILE_VOID));
    const rooms = [];

    // Place rooms
    const attempts = C.NUM_ROOMS * 20;
    for (let i = 0; i < attempts && rooms.length < C.NUM_ROOMS; i++) {
      const rw = randInt(C.ROOM_MIN_W, C.ROOM_MAX_W);
      const rh = randInt(C.ROOM_MIN_H, C.ROOM_MAX_H);
      const rx = randInt(2, W - rw - 2);
      const ry = randInt(2, H - rh - 2);
      const room = { x: rx, y: ry, w: rw, h: rh,
                     cx: rx + Math.floor(rw / 2),
                     cy: ry + Math.floor(rh / 2) };

      if (!this._overlaps(room, rooms, 2)) {
        rooms.push(room);
        this._paintFloor(tiles, room);
      }
    }

    // Connect rooms with Prim-style MST corridors
    if (rooms.length > 1) {
      const connected = new Set([0]);
      while (connected.size < rooms.length) {
        let best = { dist: Infinity, from: -1, to: -1 };
        for (const i of connected) {
          for (let j = 0; j < rooms.length; j++) {
            if (connected.has(j)) continue;
            const d = Math.hypot(rooms[i].cx - rooms[j].cx, rooms[i].cy - rooms[j].cy);
            if (d < best.dist) best = { dist: d, from: i, to: j };
          }
        }
        this._carveCorridor(tiles, rooms[best.from], rooms[best.to]);
        connected.add(best.to);
      }
    }

    // Build walls around floor
    this._addWalls(tiles, W, H);

    // Assign room types
    rooms[0].type = C.ROOM_START;
    rooms[rooms.length - 1].type = C.ROOM_BOSS;
    for (let i = 1; i < rooms.length - 1; i++) {
      rooms[i].type = (i % 3 === 0) ? C.ROOM_CHEST : C.ROOM_NORMAL;
    }

    return { tiles, rooms, width: W, height: H };
  },

  _overlaps(room, existing, margin = 0) {
    return existing.some(r =>
      room.x < r.x + r.w + margin &&
      room.x + room.w + margin > r.x &&
      room.y < r.y + r.h + margin &&
      room.y + room.h + margin > r.y
    );
  },

  _paintFloor(tiles, room) {
    for (let ty = room.y; ty < room.y + room.h; ty++)
      for (let tx = room.x; tx < room.x + room.w; tx++)
        tiles[ty][tx] = C.TILE_FLOOR;
  },

  _carveCorridor(tiles, a, b) {
    // Randomly choose: H-then-V or V-then-H
    if (Math.random() < 0.5) {
      this._carveH(tiles, a.cx, b.cx, a.cy);
      this._carveV(tiles, a.cy, b.cy, b.cx);
    } else {
      this._carveV(tiles, a.cy, b.cy, a.cx);
      this._carveH(tiles, a.cx, b.cx, b.cy);
    }
  },

  _carveH(tiles, x0, x1, y) {
    const [lo, hi] = x0 < x1 ? [x0, x1] : [x1, x0];
    for (let x = lo; x <= hi; x++) tiles[y][x] = C.TILE_FLOOR;
  },

  _carveV(tiles, y0, y1, x) {
    const [lo, hi] = y0 < y1 ? [y0, y1] : [y1, y0];
    for (let y = lo; y <= hi; y++) tiles[y][x] = C.TILE_FLOOR;
  },

  _addWalls(tiles, W, H) {
    const orig = tiles.map(row => [...row]);
    const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (orig[y][x] !== C.TILE_VOID) continue;
        const nearFloor = dirs.some(([dy, dx]) => {
          const ny = y + dy, nx = x + dx;
          return ny >= 0 && ny < H && nx >= 0 && nx < W && orig[ny][nx] === C.TILE_FLOOR;
        });
        if (nearFloor) tiles[y][x] = C.TILE_WALL;
      }
    }
  },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
