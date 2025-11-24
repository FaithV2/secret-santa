export function drawForSelf(giverId, participants, assignments) {
  // Check if this giver already has an assignment
  const existing = assignments.find(a => a.giverId === giverId);
  if (existing) return { already: existing };

  // Find the giver
  const giver = participants.find(p => p.id === giverId);
  if (!giver) return { error: "Participant not found!" };

  // Filter people in the same amount group who:
  // - are not the giver
  // - have not been assigned as a receiver yet
  const available = participants.filter(p =>
    p.amount === giver.amount &&
    p.id !== giverId &&
    !assignments.some(a => a.receiverId === p.id)
  );

  if (available.length === 0) {
    return { error: "No available participants left in your amount group!" };
  }

  const receiver = available[Math.floor(Math.random() * available.length)];

  // Return the assignment (must be saved by caller!)
  return {
    giverId,
    receiverId: receiver.id,
    receiver: receiver.name,
    receiverWishlist: Array.isArray(receiver.wishlist) ? receiver.wishlist : [receiver.wishlist],
    amount: receiver.amount
  };
}
