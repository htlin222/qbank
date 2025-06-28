import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function readTextFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.trim();
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return '';
  }
}

async function getImagesInDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file))
      .map(file => `/qabank/${path.relative(path.join(projectRoot, 'public/qabank'), path.join(dirPath, file))}`);
  } catch {
    return [];
  }
}

async function compileQuestion(questionDir) {
  const questionNumber = path.basename(questionDir);
  
  // Read question text and options
  const question = await readTextFile(path.join(questionDir, 'question.txt'));
  const optionA = await readTextFile(path.join(questionDir, 'option_A.txt'));
  const optionB = await readTextFile(path.join(questionDir, 'option_B.txt'));
  const optionC = await readTextFile(path.join(questionDir, 'option_C.txt'));
  const optionD = await readTextFile(path.join(questionDir, 'option_D.txt'));
  const optionE = await readTextFile(path.join(questionDir, 'option_E.txt'));
  const explanation = await readTextFile(path.join(questionDir, 'explain.txt'));
  const correctAnswer = await readTextFile(path.join(questionDir, 'correct_answer.txt'));

  // Get question and explanation figures
  const questionFigures = await getImagesInDirectory(path.join(questionDir, 'question_figures'));
  const explainFigures = await getImagesInDirectory(path.join(questionDir, 'explain_figures'));

  return {
    id: parseInt(questionNumber),
    question,
    options: [optionA, optionB, optionC, optionD, optionE].filter(Boolean),
    correctAnswer: correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0),
    explanation,
    questionFigures,
    explainFigures
  };
}

async function compileQuestions() {
  const qabankPath = path.join(projectRoot, 'public/qabank');
  const outputPath = path.join(projectRoot, 'src/data/compiledQuestions.json');

  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Get all question directories
    const dirs = await fs.readdir(qabankPath);
    const questionDirs = dirs
      .filter(dir => /^\d+$/.test(dir))
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(dir => path.join(qabankPath, dir));

    // Compile all questions
    const questions = await Promise.all(questionDirs.map(compileQuestion));

    // Sort questions by ID before writing
    questions.sort((a, b) => a.id - b.id);

    // Write to output file
    await fs.writeFile(outputPath, JSON.stringify(questions, null, 2));
    console.log(`Successfully compiled ${questions.length} questions to ${outputPath}`);
  } catch (error) {
    console.error('Error compiling questions:', error);
  }
}

compileQuestions();
