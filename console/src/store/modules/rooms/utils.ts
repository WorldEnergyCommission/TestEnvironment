import { IPositionedRoom, IRoom } from "./types";

export function generateRoomsDndLayout(
  RoomPositions: any | undefined,
  rooms: IRoom[],
): IPositionedRoom[] {
  const sortedPositions = (RoomPositions || []).length
    ? RoomPositions.map((item: any) => ({ x: item.x, y: item.y })).sort(
        (a: { x: number; y: number }, b: { x: number; y: number }) => {
          if (a.x === b.x) {
            return a.y - b.y;
          }
          return a.x - b.x;
        },
      )
    : null;
  const lastPosition = sortedPositions ? sortedPositions[sortedPositions.length - 1] : null;

  return rooms.map((room: IRoom, index: number) => {
    const positions = () => {
      if (RoomPositions && RoomPositions.length) {
        const currentRoomPositions = RoomPositions.find((item: any) => item.i === room.id);
        return (
          currentRoomPositions || {
            x: (lastPosition.x + 1) % 6,
            y: lastPosition.x < 5 ? lastPosition.y : lastPosition.y + 1,
            i: room.id,
          }
        );
      }
      return {
        x: index % 6,
        y: Math.floor(index / 6),
        i: room.id,
      };
    };
    return {
      room,
      ...positions(),
    };
  });
}

// import { IRoom, IRoomDndLayout } from "./types";

// const positionRoom = (
//   currentPositions: IRoomDndLayout[] | undefined,
//   lastPosition: {
//     x: any;
//     y: any;
//   } | null
// ) => {
//   if (currentPositions?.length) {
//     const currentRoomPositions = currentPositions.find((item: any) => item.i === room.id);
//     return (
//       currentRoomPositions || {
//         x: (lastPosition?.x ?? 0 + 1) % 6,
//         y: lastPosition?.x ?? 0 < 5 ? lastPosition?.y : lastPosition?.y ?? 0 + 1,
//         i: room.id,
//       }
//     );
//   }
//   return {
//     x: index % 6,
//     y: 0,
//     i: room.id,
//   };
// };

// export function generateRoomsDndLayout(
//   currentPositions: IRoomDndLayout[] | undefined,
//   rooms: IRoom[]
// ): IPositionedRoom[] {
//   console.log();
//   const sortedPositions = (currentPositions || []).length
//     ? currentPositions
//         ?.map((item: any) => ({ x: item.x, y: item.y }))
//         .sort((a: any, b: any) => a.x - b.x)
//         .sort((a: any, b: any) => a.y - b.y)
//     : null;
//   const lastPosition = sortedPositions ? sortedPositions[sortedPositions.length - 1] : null;

//   return rooms.map((room: IRoom, index: number) => {
//     return {
//       room,
//       ...positionRoom(currentPositions, lastPosition),
//     };
//   });
// }
