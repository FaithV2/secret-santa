// santaLogic.js
export function assignSecretSantaByCategory(participants) {
  const groups = {};

  // Group participants by amount
  participants.forEach(p => {
    if (!groups[p.amount]) groups[p.amount] = [];
    groups[p.amount].push(p);
  });

  const allAssignments = [];

  Object.values(groups).forEach(group => {
    if (group.length < 2) return; // Must have at least 2 participants per group

    const shuffled = [...group].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      const giver = shuffled[i];
      const receiver = shuffled[(i + 1) % shuffled.length]; // Circular assignment
      allAssignments.push({
        giverId: giver.id,
        giver: giver.name,
        receiverId: receiver.id,
        receiver: receiver.name,
        receiverWishlist: Array.isArray(receiver.wishlist) ? receiver.wishlist : [receiver.wishlist],
        amount: receiver.amount
      });
    }
  });

  return allAssignments;
}
