import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Configuration for slide breaking in explanations
 * Adjust these values to control how explanations are split into multiple slides
 */
const SLIDE_BREAKING_CONFIG = {
  // Maximum number of lines per slide
  MAX_LINES_PER_SLIDE: 18,
  
  // Maximum length of a single line
  MAX_LINE_LENGTH: 105,
  
  // Number of questions per group
  QUESTIONS_PER_GROUP: 20
};

// Document configuration
const DOCUMENT_CONFIG = {
  // Title for the document - uses the APP_TITLE from .env file
  TITLE: process.env.APP_TITLE
};

async function readTextFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.trim();
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return '';
  }
}

/**
 * Breaks explanation text into multiple slides if it's too long
 * @param {string} explanation - The explanation text to break
 * @returns {string[]} - Array of explanation parts, each representing a slide
 */
function breakExplanationIntoSlides(explanation) {
  // Split explanation into lines
  const lines = explanation.split('\n');
  
  // Preprocess each line into a dictionary with metadata
  const processedLines = lines.map((content, index) => {
    const charCount = content.length;
    const linesNeeded = Math.ceil(charCount / SLIDE_BREAKING_CONFIG.MAX_LINE_LENGTH);
    
    return {
      index,
      content,
      charCount,
      linesNeeded: linesNeeded > 0 ? linesNeeded : 1 // Even empty lines take up 1 line
    };
  });
  
  // Group lines into slides based on linesNeeded
  const slides = [];
  let currentSlide = [];
  let currentLinesCount = 0;
  
  for (const line of processedLines) {
    // Check if adding this line would exceed the limit
    if (currentLinesCount + line.linesNeeded > SLIDE_BREAKING_CONFIG.MAX_LINES_PER_SLIDE) {
      // Add current slide to slides array if not empty
      if (currentSlide.length > 0) {
        slides.push(currentSlide.map(l => l.content).join('\n'));
      }
      
      // Start a new slide with this line
      currentSlide = [line];
      currentLinesCount = line.linesNeeded;
    } else {
      // Add the line to the current slide
      currentSlide.push(line);
      currentLinesCount += line.linesNeeded;
    }
  }
  
  // Add the last slide if it's not empty
  if (currentSlide.length > 0) {
    slides.push(currentSlide.map(l => l.content).join('\n'));
  }
  
  return slides;
}

async function compileQuestionToMarp(questionDir) {
  const questionNumber = path.basename(questionDir);
  
  try {
    // Read question, options, explanation, and figures
    const question = await readTextFile(path.join(questionDir, 'question.txt'));
    const optionA = await readTextFile(path.join(questionDir, 'option_A.txt'));
    const optionB = await readTextFile(path.join(questionDir, 'option_B.txt'));
    const optionC = await readTextFile(path.join(questionDir, 'option_C.txt'));
    const optionD = await readTextFile(path.join(questionDir, 'option_D.txt'));
    const optionE = await readTextFile(path.join(questionDir, 'option_E.txt'));
    const explanation = await readTextFile(path.join(questionDir, 'explain.txt'));
    const correctAnswer = await readTextFile(path.join(questionDir, 'correct_answer.txt'));
    
    // Read explanation figures
    const explainFiguresDir = path.join(questionDir, 'explain_figures');
    let explainFigures = [];
    try {
      const explainFigureFiles = await fs.readdir(explainFiguresDir);
      explainFigures = explainFigureFiles
        .filter(file => !file.startsWith('.')) // Skip hidden files
        .map(file => ({
          name: path.basename(file, path.extname(file)),
          path: `./${questionNumber}/explain_figures/${file}`
        }));
    } catch (error) {
      // No explanation figures or directory doesn't exist, continue without them
    }
    
    // Format the question in Marp markdown format
    let marpContent = `## Question ${questionNumber}\n\n${question}\n\n`;
    
    // Add options if there are any
    marpContent += `- A. ${optionA}\n`;
    marpContent += `- B. ${optionB}\n`;
    marpContent += `- C. ${optionC}\n`;
    marpContent += `- D. ${optionD}\n`;
    marpContent += `- E. ${optionE}\n\n`;
    
    // Add correct answer if there is one
    if (correctAnswer) {
      marpContent += `### Correct Answer ${correctAnswer}\n\n`;
    }
    
    // Add explanation if there is one, breaking into multiple slides if needed
    if (explanation) {
      // Apply slide breaking logic to the explanation
      const explanationSlides = breakExplanationIntoSlides(explanation);
      
      // Add each slide with a page break
      for (let i = 0; i < explanationSlides.length; i++) {
        if (i > 0) {
          marpContent += `---\n\n`;
        }
        marpContent += explanationSlides[i] + '\n\n';
      }
    }
    
    // Add figures if there are any, each on its own slide
    for (let i = 0; i < explainFigures.length; i++) {
      const figure = explainFigures[i];
      marpContent += `---\n\n![w:1150px h:650px](${figure.path})\n\n> ${figure.name}\n\n`;
    }
    
    return {
      id: parseInt(questionNumber),
      content: marpContent
    };
  } catch (error) {
    console.error(`Error compiling question ${questionNumber}:`, error);
    return {
      id: parseInt(questionNumber),
      content: `## Question ${questionNumber}\n\nError loading question content: ${error.message}`
    };
  }
}

async function compileMarp() {
  try {
    // Initialize the final content with the front matter
    let finalContent = '';
    let hasTitleInFrontmatter = false;
    
    // Try to read the front matter template
    const frontmatterPath = path.join(projectRoot, 'public', 'marpfrontmatter.md');
    try {
      const frontmatterContent = await fs.readFile(frontmatterPath, 'utf-8');
      finalContent += frontmatterContent;
      
      // Check if the frontmatter already contains a title
      hasTitleInFrontmatter = frontmatterContent.includes(`title: "${DOCUMENT_CONFIG.TITLE}"`);
    } catch (error) {
      console.warn('Marp frontmatter file not found or could not be read. Continuing without it.');
    }
    
    // Add the document title (only once)
    if (!hasTitleInFrontmatter) {
      finalContent += `\n\n# ${DOCUMENT_CONFIG.TITLE}\n\n`;
    }
    
    // Get all question directories
    const qabankDir = path.join(projectRoot, 'public', 'qabank');
    const questionDirs = await fs.readdir(qabankDir);
    
    // Filter out non-directory items and sort by question number
    const filteredDirs = [];
    for (const dir of questionDirs) {
      if (dir.startsWith('.')) continue; // Skip hidden files
      
      try {
        const stat = await fs.stat(path.join(qabankDir, dir));
        if (stat.isDirectory()) {
          filteredDirs.push(dir);
        }
      } catch (error) {
        // Skip if there's an error
      }
    }
    
    // Sort directories by question number
    filteredDirs.sort((a, b) => parseInt(a) - parseInt(b));
    
    // Compile each question to Marp markdown
    const questions = [];
    for (const dir of filteredDirs) {
      try {
        const questionDir = path.join(qabankDir, dir);
        const compiledQuestion = await compileQuestionToMarp(questionDir);
        questions.push(compiledQuestion);
      } catch (error) {
        console.error(`Error compiling question ${dir}:`, error);
      }
    }
    
    // Sort questions by ID
    questions.sort((a, b) => a.id - b.id);
    
    // Group questions in sections of SLIDE_BREAKING_CONFIG.QUESTIONS_PER_GROUP
    const questionsByGroup = {};
    
    questions.forEach(q => {
      const groupStart = Math.floor((q.id - 1) / SLIDE_BREAKING_CONFIG.QUESTIONS_PER_GROUP) * SLIDE_BREAKING_CONFIG.QUESTIONS_PER_GROUP + 1;
      const groupEnd = groupStart + SLIDE_BREAKING_CONFIG.QUESTIONS_PER_GROUP - 1;
      const groupKey = `${String(groupStart).padStart(3, '0')}-${String(groupEnd).padStart(3, '0')}`;
      
      if (!questionsByGroup[groupKey]) {
        questionsByGroup[groupKey] = [];
      }
      
      questionsByGroup[groupKey].push(q);
    });
    
    // Process each question group
    for (const [groupKey, groupQuestions] of Object.entries(questionsByGroup).sort()) {
      finalContent += `# Questions ${groupKey}\n\n`;
      
      for (const question of groupQuestions) {
        finalContent += question.content;
      }
    }
    
    // Write the final content to the output file
    const outputDir = path.join(projectRoot, 'dist', 'qabank');
    const outputPath = path.join(outputDir, 'all.md');
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, finalContent);
    
    console.log(`Successfully compiled ${questions.length} questions to ${outputPath}`);
  } catch (error) {
    console.error('Error compiling questions to Marp format:', error);
  }
}

// Execute the compilation
compileMarp();
