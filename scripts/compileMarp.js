import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Configuration for slide breaking in explanations
 * Adjust these values to control how explanations are split into multiple slides
 */
const SLIDE_BREAKING_CONFIG = {
  // Maximum number of lines per slide before creating a new slide
  MAX_LINES_PER_SLIDE: 22,
  
  // Maximum number of characters per slide before creating a new slide
  MAX_CHARS_PER_SLIDE: 700,
  
  // Maximum length of a single line before creating a new slide
  // Useful for preventing very long lines from making slides too crowded
  MAX_LINE_LENGTH: 120
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

// Function to break long explanations into multiple slides
function breakExplanationIntoSlides(explanation) {
  if (!explanation) return '';
  
  const lines = explanation.split('\n');
  let currentSlide = [];
  let slides = [];
  let currentLineCount = 0;
  let currentCharCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines at the beginning of a slide
    if (currentSlide.length === 0 && line.trim() === '') {
      continue;
    }
    
    // Check if this line looks like a reference (starts with a number or name followed by a period)
    const isReference = /^\d+\.|\w+\s+\w+,\s+\w+\s+\w+/.test(line.trim());
    
    // Add the current line to the current slide
    currentSlide.push(line);
    currentLineCount++;
    currentCharCount += line.length;
    
    // Check if we need to create a new slide after adding this line
    // Only check if this isn't the last line
    if (i < lines.length - 1) {
      // Don't break in the middle of a reference
      if (isReference) {
        continue;
      }
      
      const shouldBreak = 
        currentLineCount >= SLIDE_BREAKING_CONFIG.MAX_LINES_PER_SLIDE || 
        currentCharCount >= SLIDE_BREAKING_CONFIG.MAX_CHARS_PER_SLIDE || 
        line.length > SLIDE_BREAKING_CONFIG.MAX_LINE_LENGTH;
      
      if (shouldBreak) {
        // Only add the slide if it has content
        if (currentSlide.length > 0 && currentSlide.some(l => l.trim() !== '')) {
          slides.push(currentSlide.join('\n'));
        }
        // Reset for the next slide
        currentSlide = [];
        currentLineCount = 0;
        currentCharCount = 0;
      }
    }
  }
  
  // Add the last slide if there's anything left and it has content
  if (currentSlide.length > 0 && currentSlide.some(l => l.trim() !== '')) {
    slides.push(currentSlide.join('\n'));
  }
  
  // Join all slides with page breaks
  return slides.join('\n\n---\n\n');
}

async function getImagesInDirectory(dirPath, questionNumber) {
  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file))
      .map(file => {
        return {
          name: path.basename(file, path.extname(file)),
          path: `./${questionNumber}/explain_figures/${file}`
        };
      });
  } catch {
    return [];
  }
}

async function compileQuestionToMarp(questionDir) {
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

  // Get explanation figures
  const explainFigures = await getImagesInDirectory(
    path.join(questionDir, 'explain_figures'),
    questionNumber
  );

  // Format the question in Marp markdown format
  let marpContent = `## Question ${questionNumber}\n\n${question}\n\n`;
  
  // Add options
  if (optionA) marpContent += `- A. ${optionA}\n`;
  if (optionB) marpContent += `- B. ${optionB}\n`;
  if (optionC) marpContent += `- C. ${optionC}\n`;
  if (optionD) marpContent += `- D. ${optionD}\n`;
  if (optionE) marpContent += `- E. ${optionE}\n`;
  
  // Add correct answer and break explanation into multiple slides if needed
  marpContent += `\n### Correct Answer ${correctAnswer}\n\n`;
  
  // Break explanation into multiple slides
  marpContent += breakExplanationIntoSlides(explanation) + '\n\n';
  
  // Add figures if there are any
  if (explainFigures.length > 0) {
    // No "### Figures" heading
    for (let i = 0; i < explainFigures.length; i++) {
      const figure = explainFigures[i];
      marpContent += `---\n\n#### ${figure.name}\n\n![bg w:1150px h:650px](${figure.path})\n\n`;
    }
  }
  
  return {
    id: parseInt(questionNumber),
    content: marpContent
  };
}

async function compileMarp() {
  const qabankPath = path.join(projectRoot, 'public/qabank');
  const outputDir = path.join(projectRoot, 'dist/qabank');
  const outputPath = path.join(outputDir, 'all.md');
  const frontmatterPath = path.join(projectRoot, 'public/marpfrontmatter.md');

  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Get all question directories
    const dirs = await fs.readdir(qabankPath);
    const questionDirs = dirs
      .filter(dir => /^\d+$/.test(dir))
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(dir => path.join(qabankPath, dir));

    // Group questions by 30s for section headers
    const questionsByGroup = {};
    
    // Compile all questions
    const questions = await Promise.all(questionDirs.map(compileQuestionToMarp));
    
    // Sort questions by ID
    questions.sort((a, b) => a.id - b.id);
    
    // Group questions in sections of 30
    questions.forEach(q => {
      const groupStart = Math.floor((q.id - 1) / 30) * 30 + 1;
      const groupEnd = groupStart + 29;
      const groupKey = `${String(groupStart).padStart(3, '0')}-${String(groupEnd).padStart(3, '0')}`;
      
      if (!questionsByGroup[groupKey]) {
        questionsByGroup[groupKey] = [];
      }
      
      questionsByGroup[groupKey].push(q);
    });
    
    // Generate the final markdown content
    let finalContent = '';
    
    // Read frontmatter content if it exists
    try {
      const frontmatterContent = await fs.readFile(frontmatterPath, 'utf-8');
      finalContent += frontmatterContent + '\n\n';
    } catch (error) {
      console.warn('Marp frontmatter file not found or could not be read. Continuing without it.');
    }
    
    for (const [groupKey, groupQuestions] of Object.entries(questionsByGroup)) {
      finalContent += `# Questions ${groupKey}\n\n`;
      
      const groupQuestionsCount = groupQuestions.length;
      for (let i = 0; i < groupQuestionsCount; i++) {
        const question = groupQuestions[i];
        finalContent += question.content;
        
        // Add separator between questions, but not after the last question in a group
        if (i < groupQuestionsCount - 1) {
          finalContent += `---\n\n`;
        }
      }
      
      // Add separator between groups if not the last group
      const groupKeys = Object.keys(questionsByGroup);
      const isLastGroup = groupKey === groupKeys[groupKeys.length - 1];
      if (!isLastGroup) {
        finalContent += `\n---\n\n`;
      }
    }
    
    // Write to output file
    await fs.writeFile(outputPath, finalContent);
    console.log(`Successfully compiled ${questions.length} questions to ${outputPath}`);
  } catch (error) {
    console.error('Error compiling questions to Marp format:', error);
  }
}

// Execute the compilation
compileMarp();
