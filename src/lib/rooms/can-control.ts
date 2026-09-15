import prisma from "@/lib/db/prisma";

export async function canControlRoom(
  roomId: string,
  userId: string,
): Promise<boolean> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      mode: true,
      members: { where: { userId }, select: { role: true } },
    },
  });
  if (!room || room.members.length === 0) return false;
  if (room.mode === "FREE_FOR_ALL") return true;
  return room.members[0].role === "HOST";
}
