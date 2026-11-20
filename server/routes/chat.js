const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/chat  — last 50 messages
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT role, content, created_at FROM chat_history WHERE user_id=? ORDER BY created_at DESC LIMIT 50').all(req.userId);
  res.json(rows.reverse());
});

// POST /api/chat  — save message + get AI response
router.post('/', (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'message required' });

  // Persist user message
  db.prepare('INSERT INTO chat_history (user_id, role, content) VALUES (?,?,?)').run(req.userId, 'user', message);

  // Build context from user data
  const latestBlood = db.prepare(`
    SELECT b1.marker, b1.value, b1.unit, b1.status FROM blood_markers b1
    INNER JOIN (SELECT marker, MAX(test_date) AS latest FROM blood_markers WHERE user_id=? GROUP BY marker) b2
    ON b1.marker=b2.marker AND b1.test_date=b2.latest AND b1.user_id=?
  `).all(req.userId, req.userId);

  const todayFood = db.prepare(`
    SELECT SUM(kcal) AS kcal, SUM(protein_g) AS prot, SUM(carbs_g) AS carbs, SUM(fat_g) AS fat
    FROM food_logs WHERE user_id=? AND date=date('now')
  `).get(req.userId);

  const user = db.prepare('SELECT name, goal_kcal FROM users WHERE id=?').get(req.userId);

  // Rule-based intelligent response engine
  const lower = message.toLowerCase();
  const response = generateResponse(lower, { latestBlood, todayFood, user });

  // Persist AI response
  db.prepare('INSERT INTO chat_history (user_id, role, content) VALUES (?,?,?)').run(req.userId, 'assistant', response);

  res.json({ response });
});

function generateResponse(query, ctx) {
  const { latestBlood, todayFood, user } = ctx;

  const low = latestBlood.filter(m => m.status === 'low' || m.status === 'critical');
  const high = latestBlood.filter(m => m.status === 'high');
  const lowNames = low.map(m => m.marker).join(', ');

  const kcalLeft = user ? (user.goal_kcal - (todayFood?.kcal || 0)) : null;

  if (/vitamin d|vit d/.test(query)) {
    const vd = latestBlood.find(m => m.marker === 'Vitamin D');
    return vd
      ? `Your Vitamin D is ${vd.value} ${vd.unit} — ${vd.status === 'low' ? 'below the optimal range of 50–80 ng/mL. I recommend 2000–4000 IU daily with a fatty meal for best absorption.' : 'looking good! Maintain with 1000 IU daily.'}`
      : "Vitamin D isn't logged yet. Optimal is 50–80 ng/mL. Fatty fish, egg yolks, and 20 min of midday sun help — but most people need supplements. Add a blood test to track your level.";
  }

  if (/folate|folic/.test(query)) {
    const f = latestBlood.find(m => m.marker === 'Folate');
    return f
      ? `Folate at ${f.value} ${f.unit}. ${f.value < 5 ? 'This is critically low — impacts DNA synthesis, mood, and energy. 5-MTHF form (the active version) is better absorbed than folic acid. Eat more spinach, lentils, and asparagus.' : f.value < 10 ? 'Below optimal (10+ ng/mL). Leafy greens daily + 400–800mcg supplement recommended.' : 'Your folate is in a healthy range!'}`
      : "Folate drives cell repair, mood regulation, and energy metabolism. Optimal is 10+ ng/mL. Leafy greens, lentils, and chickpeas are top sources. Want me to suggest a meal plan?";
  }

  if (/iron|ferritin/.test(query)) {
    const fe = latestBlood.find(m => m.marker === 'Ferritin');
    return fe
      ? `Ferritin (iron storage) at ${fe.value} ${fe.unit}. ${fe.status === 'low' ? 'Low ferritin causes fatigue and brain fog. Pair iron-rich foods (red meat, lentils, spinach) with Vitamin C for better absorption. Avoid coffee/tea within 1 hr of iron-rich meals.' : 'Iron storage is healthy!'}`
      : "Ferritin is the best measure of iron stores. Symptoms of low ferritin: fatigue, cold hands, hair loss. I'd recommend logging a blood test to see where you stand.";
  }

  if (/b12|vitamin b/.test(query)) {
    const b12 = latestBlood.find(m => m.marker === 'B12');
    return b12
      ? `Your B12 is ${b12.value} ${b12.unit}. ${b12.status === 'low' ? 'B12 deficiency causes fatigue, nerve damage, and cognitive issues. Methylcobalamin form is better than cyanocobalamin. Animal products (meat, eggs, dairy) are the main sources.' : 'B12 is well within range!'}`
      : "B12 is essential for nerve function and energy production. Vegans and vegetarians often need supplements. Optimal range is 400–900 pg/mL.";
  }

  if (/food|eat|cal|calorie|macro|diet|nutrition/.test(query)) {
    if (!todayFood || todayFood.kcal === 0) return `No food logged today yet. Your goal is ${user?.goal_kcal || 2100} kcal. Tap the food tab to log your meals with the AI camera.`;
    return `Today you've had ${todayFood.kcal || 0} kcal — ${kcalLeft > 0 ? `${kcalLeft} kcal left to hit your ${user.goal_kcal} goal` : 'you\'ve hit your calorie goal!'}. Protein: ${Math.round(todayFood.prot || 0)}g, Carbs: ${Math.round(todayFood.carbs || 0)}g, Fat: ${Math.round(todayFood.fat || 0)}g.`;
  }

  if (/blood|test|report|marker/.test(query)) {
    if (!latestBlood.length) return "No blood test data logged yet. Go to the Blood tab to add your latest results — I'll give you a full analysis.";
    const summary = low.length
      ? `Your panel shows ${low.length} marker${low.length > 1 ? 's' : ''} below optimal: ${lowNames}. ${high.length ? `${high.map(m=>m.marker).join(', ')} is high. ` : ''}I'd prioritize fixing ${low[0].marker} first.`
      : "Your tracked blood markers all look healthy! Keep maintaining your supplement routine and check in every 3–6 months.";
    return summary;
  }

  if (/supplement|pill|vitamin|mineral/.test(query)) {
    return "Your supplement stack is designed around your blood markers. Take fat-soluble vitamins (D, Omega-3) with meals. Magnesium Glycinate works best at night — it also improves sleep quality. Folate (5-MTHF) should be taken in the morning. Consistency matters more than timing.";
  }

  if (/sleep/.test(query)) {
    return "Sleep quality directly impacts your blood markers. Poor sleep raises cortisol → depletes Magnesium faster. It also increases ghrelin (hunger hormone) and reduces insulin sensitivity. Your Magnesium Glycinate helps here — take it 30 min before bed. 7–8 hrs is optimal for nutrient metabolism.";
  }

  if (/weight|bmi|body|fat|muscle/.test(query)) {
    return "Weight management is closely tied to your nutrition data. I track your food log and calorie balance. Log your weight in the Blood tab to see trends over time. Protein intake is key for muscle retention — are you hitting your protein goal?";
  }

  if (/hello|hi|hey|good morning|good evening/.test(query)) {
    const name = user?.name?.split(' ')[0] || 'there';
    if (low.length) return `Hey ${name}! Your ${lowNames} ${low.length > 1 ? 'are' : 'is'} showing low — that's the top priority right now. Want a targeted plan?`;
    return `Hey ${name}! Everything's looking good. ${todayFood?.kcal ? `You've had ${todayFood.kcal} kcal today. ` : 'Log your first meal to get started. '}What can I help with?`;
  }

  if (/plan|recommend|suggest|what should|help me/.test(query)) {
    if (low.length) {
      return `Based on your data, here's your priority plan:\n\n${low.map((m, i) => `${i+1}. Fix ${m.marker} (currently ${m.value} ${m.unit}) — increase through diet + supplementation`).join('\n')}\n\nFood goals: hit your protein target daily and include at least 2 servings of leafy greens. Want me to suggest specific meals?`;
    }
    return "Your markers all look healthy! Focus on: 1) Maintaining supplement consistency, 2) Hitting your daily protein goal, 3) Logging blood work every 3–6 months to catch any early shifts.";
  }

  // Default contextual response
  if (low.length) {
    return `Based on your profile, your ${lowNames} ${low.length > 1 ? 'levels are' : 'level is'} the main area to address. ${kcalLeft != null ? `You have ${Math.max(0, kcalLeft)} kcal left today. ` : ''}What specific aspect would you like to explore?`;
  }
  return `I've looked at your data. ${todayFood?.kcal ? `You've logged ${todayFood.kcal} kcal today. ` : ''}Your blood markers${latestBlood.length ? ` (${latestBlood.length} logged)` : ' (not yet logged)'} help me give you better recommendations. What would you like to know?`;
}

module.exports = router;
