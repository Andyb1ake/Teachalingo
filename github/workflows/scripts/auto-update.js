// scripts/auto-update.js — ALL-IN-ONE AI CONTENT GENERATOR

const fs = require('fs');
const path = require('path');
const { Groq } = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askAI(prompt) {
  const res = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    max_tokens: 8192,
  });
  return res.choices[0]?.message?.content?.trim() || '{}';
}

async function generateSection(course) {
  const circles = course === 'math' ? 12 : 15;
  const lessonsPerCircle = course === 'math' ? 6 : 8;

  const prompt = `Generate EXACTLY 250 new units for the ${course} course.
Return ONLY valid JSON — no other text:

{
  "sectionId": ${Date.now()},
  "units": [
    {
      "unitId": number,
      "title": "short title",
      "description": "one sentence",
      "lessonCircles": [
        {
          "lessons": [
            {
              "questions": [
                {"type": "multiple-choice", "question": "...", "options": ["..."], "correct": "..."}
                // 15 questions per lesson
              ]
            }
            // ${lessonsPerCircle} lessons per circle
          ]
        }
        // ${circles} circles per unit
      ]
    }
    // 250 units
  ]
}

Content starts beginner, ends at adult/college level. ONLY JSON.`;

  const raw = await askAI(prompt);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error('JSON parse failed for', course, e);
    return;
  }

  const file = path.join(__dirname, `../public/data/${course}.json`);
  let data = { sections: [] };
  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  data.sections.push(parsed);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`Added 250-unit section to ${course}`);
}

async function generateRolePlays() {
  const prompt = `Generate EXACTLY 300 new role-play scenarios.
Return ONLY JSON:

{
  "scenarios": [
    {
      "id": number,
      "title": "string",
      "description": "string",
      "category": "string (e.g. Daily Life, Food, Travel, Work, Health, etc.)"
    }
  ]
}

Varied, practical, multilingual-friendly. ONLY JSON.`;

  const raw = await askAI(prompt);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error('Role-play parse failed', e);
    return;
  }

  const file = path.join(__dirname, '../public/data/roleplays.json');
  let data = { scenarios: [] };
  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  data.scenarios.push(...parsed.scenarios);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Added 300 role-plays');
}

(async () => {
  const today = new Date();
  const day = today.getUTCDate();

  if (day === 1) {
    await generateSection('math');
    await generateSection('science');
  }

  if (day % 10 === 0) {
    await generateRolePlays();
  }
})();
