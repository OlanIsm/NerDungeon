import type { Region } from "./state.ts";

const lessons = [
  {
    title: "Reaksi Terang", material: "Reaksi terang terjadi pada membran tilakoid kloroplas. Klorofil menangkap energi cahaya. Pemecahan air menghasilkan oksigen, sedangkan transfer elektron membantu membentuk ATP dan NADPH untuk siklus Calvin.",
    questions: [
      ["Di mana reaksi terang berlangsung?", ["Membran tilakoid", "Inti sel", "Sitoplasma", "Dinding sel"], 0, "Reaksi terang berlangsung pada membran tilakoid di kloroplas."],
      ["Dari molekul apa oksigen pada fotosintesis berasal?", ["Karbon dioksida", "Air", "Glukosa", "ATP"], 1, "Pemecahan air pada reaksi terang melepaskan oksigen."],
      ["Apa hasil reaksi terang yang digunakan oleh siklus Calvin?", ["Oksigen dan air", "Glukosa dan air", "ATP dan NADPH", "Nitrogen dan oksigen"], 2, "ATP menyediakan energi dan NADPH menyediakan elektron untuk siklus Calvin."],
    ],
  },
  {
    title: "Siklus Calvin", material: "Siklus Calvin terjadi di stroma kloroplas. Rubisco membantu mengikat karbon dioksida pada RuBP. ATP dan NADPH dari reaksi terang digunakan untuk menghasilkan G3P, bahan pembentuk gula, serta meregenerasi RuBP.",
    questions: [
      ["Di mana siklus Calvin terjadi?", ["Stroma", "Membran sel", "Inti sel", "Mitokondria"], 0, "Siklus Calvin berlangsung di stroma kloroplas."],
      ["Gas apa yang diikat pada siklus Calvin?", ["Oksigen", "Karbon dioksida", "Nitrogen", "Hidrogen"], 1, "Karbon dioksida menjadi sumber karbon untuk pembentukan gula."],
      ["Enzim apa yang membantu fiksasi karbon?", ["Amilase", "Pepsin", "Rubisco", "Lipase"], 2, "Rubisco membantu mengikat karbon dioksida pada RuBP."],
    ],
  },
  {
    title: "Metabolisme", material: "Fotosintesis menyimpan energi cahaya sebagai energi kimia dalam senyawa organik. Respirasi sel melepaskan energi dari senyawa organik untuk membentuk ATP. Tumbuhan melakukan fotosintesis dan respirasi; respirasi juga berlangsung ketika tidak ada cahaya.",
    questions: [
      ["Bagaimana fotosintesis mengubah energi?", ["Cahaya menjadi energi kimia", "Panas menjadi bunyi", "Kimia menjadi cahaya", "Bunyi menjadi listrik"], 0, "Fotosintesis menyimpan energi cahaya dalam senyawa organik."],
      ["Apakah tumbuhan melakukan respirasi sel?", ["Tidak pernah", "Ya", "Hanya setelah mati", "Hanya di bunga"], 1, "Tumbuhan melakukan respirasi untuk mendapatkan ATP dari senyawa organik."],
      ["Apa fungsi utama ATP dalam sel?", ["Membentuk dinding sel saja", "Menyimpan informasi genetik", "Menyediakan energi untuk proses sel", "Menggantikan semua enzim"], 2, "ATP menyediakan energi untuk berbagai proses di dalam sel."],
    ],
  },
] as const;

export function tutorialRegions(): Region[] {
  return lessons.map((lesson, index) => ({
    chapter: index + 1, title: lesson.title, summary: lesson.material, material: lesson.material,
    topics: [lesson.title], questions: lesson.questions.length, enemies: index + 1,
    questionBank: lesson.questions.map(([prompt, options, answerIndex, explanation], questionIndex) => ({
      id: `${index + 1}-${questionIndex + 1}`, prompt, options: [...options], answerIndex, explanation, sourcePage: 1,
    })),
  }));
}
