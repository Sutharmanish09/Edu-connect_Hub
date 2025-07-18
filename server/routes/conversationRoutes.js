router.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = new Conversation({ participants: [senderId, receiverId] });
    await conversation.save();
  }

  res.json(conversation);
});
