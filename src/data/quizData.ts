export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const quizData: QuizQuestion[] = [
  {
    id: 1,
    question: "Which of the following is a characteristic feature of BRCA1-mutated breast cancers?",
    options: [
      "A. Usually ER/PR positive",
      "B. Triple-negative phenotype",
      "C. HER2 overexpression",
      "D. Low-grade histology"
    ],
    correctAnswer: 1,
    explanation: "BRCA1-mutated breast cancers are most commonly associated with a triple-negative phenotype (negative for estrogen receptor, progesterone receptor, and HER2). They typically exhibit high-grade histology, pushing margins, and prominent lymphocytic infiltration. These cancers often affect younger women and are associated with an increased risk of bilateral disease and concomitant ovarian cancer risk."
  },
  {
    id: 2,
    question: "A 65-year-old patient with metastatic non-small cell lung cancer (NSCLC) is found to have an EGFR exon 19 deletion. Which first-line treatment would be most appropriate?",
    options: [
      "A. Platinum-based chemotherapy",
      "B. Pembrolizumab (anti-PD-1)",
      "C. Osimertinib (EGFR TKI)",
      "D. Bevacizumab (anti-VEGF)"
    ],
    correctAnswer: 2,
    explanation: "Osimertinib is the preferred first-line EGFR tyrosine kinase inhibitor (TKI) for patients with metastatic NSCLC harboring EGFR exon 19 deletions or exon 21 L858R mutations. Osimertinib has demonstrated superior progression-free survival compared to earlier generation EGFR TKIs and has improved CNS penetration. EGFR mutations are predictive biomarkers for response to EGFR TKIs, and targeted therapy is preferred over chemotherapy or immunotherapy for these patients."
  },
  {
    id: 3,
    question: "Which statement about tumor mutational burden (TMB) as a biomarker for immunotherapy response is correct?",
    options: [
      "A. High TMB predicts response to targeted therapies like BRAF inhibitors",
      "B. High TMB is associated with increased neoantigen production and better response to immune checkpoint inhibitors",
      "C. TMB is most useful in predicting response to platinum-based chemotherapy",
      "D. Low TMB tumors typically have better responses to anti-PD-1/PD-L1 therapy"
    ],
    correctAnswer: 1,
    explanation: "High tumor mutational burden (TMB) is associated with increased neoantigen production, which can enhance tumor immunogenicity and improve response to immune checkpoint inhibitors like anti-PD-1/PD-L1 therapies. Tumors with DNA repair deficiencies (such as microsatellite instability-high or mismatch repair deficient tumors) often have high TMB and show improved responses to immunotherapy. TMB is one of several biomarkers used to predict immunotherapy response, along with PD-L1 expression and immune cell infiltration patterns."
  }
];
