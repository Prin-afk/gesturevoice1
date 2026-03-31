export default function Achievements({ user }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold">Your Badges</h2>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {user.badges.map((badge, i) => (
          <div key={i} className="bg-yellow-300 p-4 rounded-xl shadow">
            {badge}
          </div>
        ))}
      </div>
    </div>
  );
}
