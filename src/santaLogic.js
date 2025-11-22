// Self-draw for participants within the same amount group
export function drawForSelf(giverId, participants, assignments) {
  // Check if already assigned
  const existing = assignments.find(a => a.giverId === giverId);
  if (existing) return { already: existing };

  // Find the giver
  const giver = participants.find(p => p.id === giverId);
  if (!giver) return { error: "Participant not found!" };

  // Filter participants in the same amount group, excluding self and already assigned
  const available = participants.filter(p =>
    p.amount === giver.amount &&
    p.id !== giverId &&
    !assignments.some(a => a.receiverId === p.id)
  );

  if (available.length === 0) return { error: "No available participants left in your amount group!" };

  const randomIndex = Math.floor(Math.random() * available.length);
  const receiver = available[randomIndex];

  return {
    giverId,
    receiverId: receiver.id,
    receiver: receiver.name,
    receiverWishlist: Array.isArray(receiver.wishlist) ? receiver.wishlist : [receiver.wishlist],
    amount: receiver.amount
  };
}
