import { MessageReaction } from "@/types/chat";

export type ReactionUser = MessageReaction["user"];

export const setUserReaction = (
  reactions: MessageReaction[],
  messageId: string,
  user: ReactionUser,
  emoji: string | null,
): MessageReaction[] => {
  const others = reactions.filter((r) => r.userId !== user.id);
  if (!emoji) return others;
  return [
    ...others,
    { id: `${messageId}-${user.id}`, emoji, userId: user.id, user },
  ];
};

export const onePerUser = (reactions: MessageReaction[]) => {
  const byUser = new Map<string, MessageReaction>();
  for (const reaction of reactions) byUser.set(reaction.userId, reaction);
  return [...byUser.values()];
};
