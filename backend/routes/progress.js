// routes/progress.js
router.post("/complete", auth, async (req, res) => {
  const { lessonId, xp } = req.body;

  const user = await User.findById(req.user.id);

  if (!user.completedLessons.includes(lessonId)) {
    user.completedLessons.push(lessonId);
    user.xp += xp;

    if (user.xp > user.level * 100) {
      user.level += 1;
    }

    await user.save();
  }

  res.json(user);
});
