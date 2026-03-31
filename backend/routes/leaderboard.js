// routes/leaderboard.js
router.get("/", async (req, res) => {
  const topUsers = await User.find()
    .sort({ xp: -1 })
    .limit(10)
    .select("username xp level");

  res.json(topUsers);
});
