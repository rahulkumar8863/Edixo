'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Text, Image as ImageIcon, FileText, Link2, Sparkles, Upload, FileUp, Globe, X, CheckCircle, AlertCircle, Loader2, Plus, Trash2, Save, FolderOpen, File } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Question } from '../types';

export type ExtractSource = 'text' | 'image' | 'document' | 'url';

interface ExtractPanelProps {
  onSaveQuestions: (questions: Question[]) => void;
  onClose?: () => void;
}

export const ExtractPanel: React.FC<ExtractPanelProps> = ({ onSaveQuestions, onClose }) => {
  const [activeSource, setActiveSource] = useState<ExtractSource>('text');
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<Partial<Question>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState('General Knowledge');
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('English');

  // File and folder management
  const [fileName, setFileName] = useState('');
  const [folderName, setFolderName] = useState('');
  const [existingFolders, setExistingFolders] = useState<string[]>([]);
  const [showFolderInput, setShowFolderInput] = useState(false);

  // Load folders from localStorage on mount
  useEffect(() => {
    const savedFolders = localStorage.getItem('qbank-extract-folders');
    if (savedFolders) {
      try {
        setExistingFolders(JSON.parse(savedFolders));
      } catch (e) {
        console.error('Failed to load folders:', e);
      }
    }
  }, []);

  // Save folders to localStorage whenever they change
  useEffect(() => {
    if (existingFolders.length > 0) {
      localStorage.setItem('qbank-extract-folders', JSON.stringify(existingFolders));
    }
  }, [existingFolders]);

  // History state
  const [extractHistory, setExtractHistory] = useState<Array<{
    id: string;
    timestamp: Date;
    source: ExtractSource;
    sourceText: string;
    questions: Partial<Question>[];
    subject: string;
    difficulty: string;
    language: string;
    fileName?: string;
    folderName?: string;
  }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const subjects = ['General Knowledge', 'Science', 'Mathematics', 'History', 'Geography', 'English', 'Hindi', 'Current Affairs', 'Reasoning', 'Computer'];
  const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
  const languages = ['English', 'Hindi', 'Bilingual'];

  // File and folder management functions
  const createFolder = (folderName: string) => {
    if (folderName && !existingFolders.includes(folderName)) {
      const newFolders = [...existingFolders, folderName];
      setExistingFolders(newFolders);
      setFolderName(folderName);
      setShowFolderInput(false);
      // Save to localStorage immediately
      localStorage.setItem('qbank-extract-folders', JSON.stringify(newFolders));
    }
  };

  const deleteFolder = (folderToDelete: string) => {
    const newFolders = existingFolders.filter(f => f !== folderToDelete);
    setExistingFolders(newFolders);
    if (folderName === folderToDelete) {
      setFolderName('');
    }
    // Save to localStorage immediately
    localStorage.setItem('qbank-extract-folders', JSON.stringify(newFolders));
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    console.log('handleFileUpload called', { type, event: e });
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Processing file:', file.name, file.type, file.size);

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (event) => {
        console.log('Image file loaded');
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For documents, read the text content
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        console.log('Document content loaded, length:', text.length);
        // Store both file and its content
        setUploadedFile(file);
        // Store content in a hidden state or use ref
        (window as any).uploadedDocumentContent = text;
        console.log(`Document ${file.name} loaded, content length: ${text.length}`);
      };

      if (file.type === 'application/pdf') {
        // For PDFs, just set the file - we'll send it to Gemini directly
        setUploadedFile(file);
        // Clear any previous error
        setError(null);
        console.log(`PDF file ${file.name} uploaded (size: ${(file.size / 1024).toFixed(1)} KB)`);

      } else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        reader.readAsText(file);
      } else {
        // Try to read as text anyway
        reader.readAsText(file);
      }
    }

    // Reset input value to allow re-selecting the same file
    e.target.value = '';
  }, []);

  const handleExtract = async () => {
    setIsExtracting(true);
    setError(null);

    try {
      let prompt = '';

      switch (activeSource) {
        case 'text':
          if (!inputText.trim()) {
            setError('Please enter some text to extract questions from');
            setIsExtracting(false);
            return;
          }
          prompt = `You are an expert question generator. Analyze the following text and create high-quality multiple-choice questions.

Text to analyze:
"""${inputText}"""

Your task:
1. Read and understand the text thoroughly
2. Create ${Math.min(5, Math.max(3, Math.floor(inputText.length / 200)))} relevant multiple-choice questions
3. Each question must test understanding of the text
4. Questions should be ${difficulty} level difficulty
5. Subject: ${subject}
6. Language: ${language === 'Bilingual' ? 'both English and Hindi' : language}

For EACH question, provide:
- Clear question text
- 4 distinct options (A, B, C, D)
- Only ONE correct answer
- Brief explanation

CRITICAL: Return ONLY a valid JSON array. Do not include any explanations outside the JSON.

Example format:
[
  {
    "question_eng": "What is the capital of France?",
    "question_hin": "फ्रांस की राजधानी क्या है?",
    "option1_eng": "London",
    "option1_hin": "लंदन",
    "option2_eng": "Paris",
    "option2_hin": "पेरिस",
    "option3_eng": "Berlin",
    "option3_hin": "बर्लिन",
    "option4_eng": "Madrid",
    "option4_hin": "मैड्रिड",
    "answer": "2",
    "solution_eng": "Paris is the capital city of France.",
    "solution_hin": "पेरिस फ्रांस की राजधानी शहर है।",
    "subject": "${subject}",
    "difficulty": "${difficulty}"
  }
]`;
          break;

        case 'url':
          if (!inputUrl.trim()) {
            setError('Please enter a URL to extract questions from');
            setIsExtracting(false);
            return;
          }
          prompt = `You are an expert content analyzer. Extract and create questions from the content at this URL: ${inputUrl}

Your task:
1. Create 3-5 relevant multiple-choice questions based on the URL content
2. Questions should be ${difficulty} level
3. Subject: ${subject}
4. Language: ${language === 'Bilingual' ? 'both English and Hindi' : language}

For EACH question, provide:
- Clear question text
- 4 distinct options (A, B, C, D)
- Only ONE correct answer (1, 2, 3, or 4)
- Brief explanation

CRITICAL: Return ONLY a valid JSON array. No extra text.

Format:
[
  {
    "question_eng": "Question text",
    "question_hin": "Hindi question",
    "option1_eng": "Option A",
    "option1_hin": "A in Hindi",
    "option2_eng": "Option B",
    "option2_hin": "B in Hindi",
    "option3_eng": "Option C",
    "option3_hin": "C in Hindi",
    "option4_eng": "Option D",
    "option4_hin": "D in Hindi",
    "answer": "2",
    "solution_eng": "Explanation",
    "solution_hin": "Hindi explanation",
    "subject": "${subject}",
    "difficulty": "${difficulty}"
  }
]`;
          break;

        case 'image':
          if (!uploadedImage) {
            setError('Please upload an image first');
            setIsExtracting(false);
            return;
          }
          // For image, we'll use a different approach with vision model
          prompt = `Analyze this image and extract any questions visible in it, or create questions based on the content shown.

Subject: ${subject}
Difficulty: ${difficulty}
Language: ${language}

Return ONLY a valid JSON array with questions.`;
          break;

        case 'document':
          if (!uploadedFile) {
            setError('Please upload a document first');
            setIsExtracting(false);
            return;
          }

          let documentContent = '';

          // Special handling for PDF files - Extract text client-side
          if (uploadedFile.type === 'application/pdf') {
            console.log(`Extracting text from PDF document: ${uploadedFile.name}`);
            try {
              // Dynamically import the parser to avoid loading it when not needed
              const { extractTextFromPDF } = await import('../utils/pdfParser');
              documentContent = await extractTextFromPDF(uploadedFile);
              console.log(`Extracted ${documentContent.length} characters from PDF`);
            } catch (error) {
              console.error('PDF text extraction failed:', error);
              setError('Failed to read PDF content. Please try copying the text manually.');
              setIsExtracting(false);
              return;
            }
          } else {
            // Get the document content for other types (txt, doc, etc.)
            documentContent = (window as any).uploadedDocumentContent || '';
          }

          if (!documentContent.trim()) {
            setError('Could not read document content. Please try uploading again or copy-paste the content in the TEXT tab.');
            setIsExtracting(false);
            return;
          }

          console.log(`Extracting from document: ${uploadedFile.name}`);

          prompt = `You are an expert document analyzer. Analyze the following document content and create questions based on ACTUAL content from the document.

Document Name: ${uploadedFile.name}
Document Content:
"""${documentContent.substring(0, 25000)}"""

IMPORTANT: 
- Create questions ONLY from the content above
- Do NOT generate generic questions about the subject
- Focus on specific facts, concepts, and information present in this document
- If the document is about Mathematics, create math questions from the actual content
- If the document is about Science, create science questions from the actual content

Your task:
1. Read the document content thoroughly
2. Identify the main topics and concepts in this specific document
3. Create 3-5 multiple-choice questions based on SPECIFIC information in this document
4. Questions should be ${difficulty} level
5. Subject: ${subject} (but base questions on document's actual content)
6. Language: ${language === 'Bilingual' ? 'both English and Hindi' : language}

For EACH question, provide:
- Clear question text based on document content
- 4 distinct options (A, B, C, D) related to the document
- Only ONE correct answer (1, 2, 3, or 4)
- Brief explanation from document content

CRITICAL: Return ONLY a valid JSON array. No extra text.

Format:
[
  {
    "question_eng": "Question based on document content",
    "question_hin": "Hindi question",
    "option1_eng": "Option A from document",
    "option1_hin": "A in Hindi",
    "option2_eng": "Option B from document",
    "option2_hin": "B in Hindi",
    "option3_eng": "Option C from document",
    "option3_hin": "C in Hindi",
    "option4_eng": "Option D from document",
    "option4_hin": "D in Hindi",
    "answer": "2",
    "solution_eng": "Explanation from document",
    "solution_hin": "Hindi explanation",
    "subject": "${subject}",
    "difficulty": "${difficulty}"
  }
]`;
          break;
      }

      // Use Gemini for extraction
      // Pass text only, as we've already extracted the content. Using gemini-1.5-flash as default for text.
      const filesToPass = undefined;
      const response = await geminiService.generateRaw(prompt, 'gemini-1.5-flash');

      // Parse the response to extract JSON
      let questions: Partial<Question>[] = [];
      try {
        console.log('Raw AI Response:', response);

        // Try to extract JSON from the response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: try to parse the entire response
          questions = JSON.parse(response);
        }

        // Validate questions array
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('No questions generated');
        }

        // Validate each question has required fields
        const validQuestions = questions.filter(q =>
          q.question_eng &&
          q.option1_eng && q.option2_eng && q.option3_eng && q.option4_eng &&
          q.answer && ['1', '2', '3', '4'].includes(q.answer.toString())
        );

        if (validQuestions.length === 0) {
          throw new Error('No valid questions generated');
        }

        questions = validQuestions;
        console.log('Parsed Questions:', questions);

      } catch (parseError: any) {
        console.error('Failed to parse questions:', parseError);
        console.error('Response was:', response);
        setError(`Failed to generate questions: ${parseError?.message || 'Invalid response format'}. Please try again with different content.`);
        setIsExtracting(false);
        return;
      }

      // Add IDs and metadata to questions
      const processedQuestions = questions.map((q, idx) => ({
        ...q,
        id: `extracted-${Date.now()}-${idx}`,
        createdDate: new Date().toISOString(),
        language: language,
        aiGenerated: true,
      }));

      setExtractedQuestions(processedQuestions);

      // Show success message
      setError(null);

    } catch (err: any) {
      console.error('Extraction failed:', err);

      // If AI fails, provide a fallback sample question
      const fallbackQuestion = {
        id: `fallback-${Date.now()}`,
        question_eng: `Sample question about ${subject}`,
        question_hin: language === 'Bilingual' || language === 'Hindi' ? `${subject} के बारे में नमूना प्रश्न` : undefined,
        option1_eng: "Option A",
        option1_hin: language === 'Bilingual' || language === 'Hindi' ? "विकल्प अ" : undefined,
        option2_eng: "Option B",
        option2_hin: language === 'Bilingual' || language === 'Hindi' ? "विकल्प ब" : undefined,
        option3_eng: "Option C",
        option3_hin: language === 'Bilingual' || language === 'Hindi' ? "विकल्प स" : undefined,
        option4_eng: "Option D",
        option4_hin: language === 'Bilingual' || language === 'Hindi' ? "विकल्प ड" : undefined,
        answer: "1",
        solution_eng: "This is a sample question generated as a fallback",
        solution_hin: language === 'Bilingual' || language === 'Hindi' ? "यह एक नमूना प्रश्न है जो फॉलबैक के रूप में उत्पन्न हुआ है" : undefined,
        subject,
        difficulty: difficulty as any,
        createdDate: new Date().toISOString(),
        language: language,
        aiGenerated: true,
      };

      setExtractedQuestions([fallbackQuestion]);
      setError('AI extraction failed. Generated a sample question instead. Please edit and save.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    if (extractedQuestions.length === 0) return;

    // Validate file name
    if (!fileName.trim()) {
      setError('Please enter a file name before saving');
      return;
    }

    // Save to history
    const historyEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      source: activeSource,
      sourceText: activeSource === 'text' ? inputText : activeSource === 'url' ? inputUrl : uploadedFile?.name || uploadedImage ? 'Image' : 'Document',
      questions: [...extractedQuestions],
      subject,
      difficulty,
      language,
      fileName,
      folderName
    };

    setExtractHistory(prev => [historyEntry, ...prev].slice(0, 10)); // Keep last 10 entries

    // Add file and folder info to questions
    const questionsWithMetadata = extractedQuestions.map(q => ({
      ...q,
      fileName,
      folderName,
      extractedFrom: activeSource,
      extractedAt: new Date().toISOString()
    }));

    onSaveQuestions(questionsWithMetadata as Question[]);
    setExtractedQuestions([]);
    setInputText('');
    setInputUrl('');
    setUploadedFile(null);
    setUploadedImage(null);
    setFileName('');
    setFolderName('');
  };

  const handleClear = () => {
    setExtractedQuestions([]);
    setInputText('');
    setInputUrl('');
    setUploadedFile(null);
    setUploadedImage(null);
    setError(null);
  };

  const removeQuestion = (index: number) => {
    setExtractedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Source Tabs */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm mb-4">
        <div className="flex border-b border-[#E5E7EB]">
          {[
            { id: 'text', label: 'TEXT', icon: Text },
            { id: 'image', label: 'IMAGE', icon: ImageIcon },
            { id: 'document', label: 'DOCUMENT', icon: FileText },
            { id: 'url', label: 'URL', icon: Link2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSource(tab.id as ExtractSource);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${activeSource === tab.id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-[#6B7280] hover:text-slate-700 hover:bg-[#F9FAFB]'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Configuration Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#6B7280]">Subject:</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-8 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-xs font-medium text-slate-700 outline-none focus:border-primary"
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#6B7280]">Difficulty:</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="h-8 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-xs font-medium text-slate-700 outline-none focus:border-primary"
              >
                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#6B7280]">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-8 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-xs font-medium text-slate-700 outline-none focus:border-primary"
              >
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* File and Folder Management */}
          <div className="bg-[#F9FAFB] rounded-xl p-4 mb-4 border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-3">
              <File size={16} className="text-primary" />
              <span className="text-sm font-semibold text-slate-900">File & Folder Organization</span>
            </div>

            <div className="space-y-3">
              {/* File Name Input */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#6B7280] min-w-[60px]">File Name:</span>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name (e.g., science_questions_ch1)"
                  className="flex-1 h-8 px-3 bg-white border border-[#E5E7EB] rounded-[10px] text-xs font-medium text-slate-700 outline-none focus:border-primary placeholder-[#9CA3AF]"
                />
              </div>

              {/* Folder Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#6B7280] min-w-[60px]">Folder:</span>
                <select
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="flex-1 h-8 px-3 bg-white border border-[#E5E7EB] rounded-[10px] text-xs font-medium text-slate-700 outline-none focus:border-primary"
                >
                  <option value="">Select folder (optional)</option>
                  {existingFolders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <button
                  onClick={() => setShowFolderInput(!showFolderInput)}
                  className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-primary transition-all"
                  title="Create new folder"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* New Folder Input */}
              {showFolderInput && (
                <div className="flex items-center gap-2 pl-[68px]">
                  <input
                    type="text"
                    placeholder="New folder name"
                    className="flex-1 h-8 px-3 bg-white border border-[#E5E7EB] rounded-[10px] text-xs font-medium text-slate-700 outline-none focus:border-primary placeholder-[#9CA3AF]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        createFolder(input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                      if (input) {
                        createFolder(input.value);
                        input.value = '';
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-success transition-all"
                    title="Create folder"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => setShowFolderInput(false)}
                    className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-error transition-all"
                    title="Cancel"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Existing Folders */}
              {existingFolders.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-[68px]">
                  {existingFolders.map(f => (
                    <div
                      key={f}
                      className="flex items-center gap-1 px-2 py-1 bg-white border border-[#E5E7EB] rounded-[8px] text-xs font-medium text-slate-600"
                    >
                      <FolderOpen size={12} />
                      <span>{f}</span>
                      <button
                        onClick={() => deleteFolder(f)}
                        className="ml-1 text-[#9CA3AF] hover:text-error transition-all"
                        title="Delete folder"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Source Input Area */}
          <div className="mb-4">
            {activeSource === 'text' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Source Text / Topic
                  </label>
                  <span className="text-xs text-[#9CA3AF]">{inputText.length} chars</span>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a topic (e.g., 'Solar System') or paste your study material here..."
                  className="w-full h-40 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-slate-700 placeholder:text-[#9CA3AF] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none transition-all"
                />
                <p className="text-xs text-[#6B7280] flex items-center gap-1">
                  <Sparkles size={12} className="text-primary" />
                  The AI will analyze this text to generate relevant questions.
                </p>
              </div>
            )}

            {activeSource === 'image' && (
              <div className="space-y-4">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    console.log('Image file input changed');
                    handleFileUpload(e, 'image');
                  }}
                  className="hidden"
                  id="image-file-input"
                />
                {!uploadedImage ? (
                  <div className="space-y-3">
                    <div
                      onClick={() => {
                        console.log('Image upload area clicked');
                        if (imageInputRef.current) {
                          imageInputRef.current.click();
                        } else {
                          const input = document.getElementById('image-file-input');
                          if (input) {
                            input.click();
                          }
                        }
                      }}
                      className="h-48 border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <ImageIcon size={40} className="text-[#9CA3AF]" />
                      <p className="text-sm font-medium text-[#6B7280]">Click to upload image</p>
                      <p className="text-xs text-[#9CA3AF]">JPG, PNG, WEBP supported</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <label className="text-xs text-[#6B7280]">Or </label>
                      <label
                        htmlFor="image-file-input"
                        className="ml-2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-primary/90 transition-all"
                      >
                        Choose Image
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img src={uploadedImage} alt="Uploaded" className="max-h-48 rounded-xl border border-[#E5E7EB]" />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-[#6B7280] hover:text-error transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSource === 'document' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    console.log('Document file input changed');
                    handleFileUpload(e, 'document');
                  }}
                  className="hidden"
                  id="document-file-input"
                />
                {!uploadedFile ? (
                  <div className="space-y-3">
                    <div
                      onClick={() => {
                        console.log('Document upload area clicked');
                        console.log('fileInputRef.current:', fileInputRef.current);
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        } else {
                          // Fallback: get element by ID
                          const input = document.getElementById('document-file-input');
                          if (input) {
                            input.click();
                          } else {
                            console.error('File input not found');
                          }
                        }
                      }}
                      className="h-48 border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <FileUp size={40} className="text-[#9CA3AF]" />
                      <p className="text-sm font-medium text-[#6B7280]">Click to upload document</p>
                      <p className="text-xs text-[#9CA3AF]">PDF, DOC, DOCX, TXT supported</p>
                    </div>
                    {/* Alternative file input */}
                    <div className="flex items-center justify-center">
                      <label className="text-xs text-[#6B7280]">Or </label>
                      <label
                        htmlFor="document-file-input"
                        className="ml-2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-primary/90 transition-all"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                      <FileText size={32} className="text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-[#6B7280]">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                        {uploadedFile.type === 'application/pdf' && (
                          <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                            <AlertCircle size={10} />
                            PDF uploaded - use TEXT tab for content
                          </p>
                        )}
                        {(window as any).uploadedDocumentContent && uploadedFile.type !== 'application/pdf' && (
                          <p className="text-xs text-success flex items-center gap-1 mt-1">
                            <CheckCircle size={10} />
                            Content loaded successfully
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setUploadedFile(null);
                          (window as any).uploadedDocumentContent = null;
                          setError(null);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-error transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {(window as any).uploadedDocumentContent && uploadedFile.type !== 'application/pdf' && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <strong>Content Preview:</strong> {(window as any).uploadedDocumentContent.substring(0, 150)}...
                        </p>
                      </div>
                    )}
                    {uploadedFile.type === 'application/pdf' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700">
                          <strong>PDF File Detected:</strong> For PDF files, please copy the text content and paste it in the TEXT tab for question extraction.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeSource === 'url' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider flex items-center gap-2">
                  <Globe size={14} />
                  Website URL
                </label>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full h-11 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-slate-700 placeholder:text-[#9CA3AF] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <p className="text-xs text-[#6B7280]">
                  Enter a URL to extract questions from web content.
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExtract}
              disabled={isExtracting}
              className="flex-1 h-11 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isExtracting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Extract Questions
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              className="h-11 px-4 border border-[#E5E7EB] text-[#6B7280] rounded-xl font-medium hover:bg-[#F9FAFB] transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Extracted Questions */}
      {extractedQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-success" />
              <h3 className="font-semibold text-slate-900">
                Extracted Questions ({extractedQuestions.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExtractedQuestions([])}
                className="h-8 px-3 text-xs font-medium text-[#6B7280] hover:text-error transition-all"
              >
                Discard All
              </button>
              <button
                onClick={handleSave}
                className="h-8 px-4 bg-primary text-white rounded-[10px] text-xs font-semibold hover:bg-primary-hover transition-all flex items-center gap-1.5"
              >
                <Save size={14} />
                Save All
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {extractedQuestions.map((q, idx) => (
              <div key={idx} className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 mb-2" dangerouslySetInnerHTML={{ __html: q.question_eng || '' }} />
                    {q.question_hin && (
                      <p className="text-xs text-[#6B7280] italic mb-2" dangerouslySetInnerHTML={{ __html: q.question_hin }} />
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {[q.option1_eng, q.option2_eng, q.option3_eng, q.option4_eng].map((opt, oi) => (
                        <div
                          key={oi}
                          className={`px-3 py-2 rounded-lg text-xs border flex items-center gap-2 ${parseInt(q.answer || '0') === oi + 1
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-white border-[#E5E7EB] text-slate-600'
                            }`}
                        >
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${parseInt(q.answer || '0') === oi + 1
                            ? 'bg-green-500 text-white'
                            : 'bg-[#F9FAFB] text-[#6B7280]'
                            }`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span dangerouslySetInnerHTML={{ __html: opt || '' }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-semibold ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {q.difficulty}
                      </span>
                      <span className="px-2 py-1 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                        {q.subject}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeQuestion(idx)}
                    className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-error transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extraction History */}
      {extractHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm mt-4">
          <div className="p-4 border-b border-[#E5E7EB]">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Save size={18} className="text-primary" />
              Extraction History
            </h3>
            <p className="text-xs text-[#6B7280] mt-1">Recently extracted questions (last 10)</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {extractHistory.map((entry) => (
              <div key={entry.id} className="p-4 border-b border-[#E5E7EB] last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary uppercase">
                        {entry.source}
                      </span>
                      <span className="text-xs text-[#6B7280]">
                        {entry.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] truncate mb-2">
                      {entry.sourceText}
                    </p>
                    {/* File and Folder Info */}
                    {(entry.fileName || entry.folderName) && (
                      <div className="flex items-center gap-2 mb-2">
                        {entry.fileName && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-[6px]">
                            <File size={10} className="text-gray-500" />
                            <span className="text-[10px] font-medium text-gray-600">{entry.fileName}</span>
                          </div>
                        )}
                        {entry.folderName && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-[6px]">
                            <FolderOpen size={10} className="text-blue-500" />
                            <span className="text-[10px] font-medium text-blue-600">{entry.folderName}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                        {entry.subject}
                      </span>
                      <span className={`px-2 py-1 rounded text-[10px] font-semibold ${entry.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        entry.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {entry.difficulty}
                      </span>
                      <span className="text-xs text-[#6B7280]">
                        {entry.questions.length} questions
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setExtractedQuestions(entry.questions);
                        setSubject(entry.subject);
                        setDifficulty(entry.difficulty);
                        setLanguage(entry.language);
                        setActiveSource(entry.source);
                        setFileName(entry.fileName || '');
                        setFolderName(entry.folderName || '');
                        if (entry.source === 'text') setInputText(entry.sourceText);
                        if (entry.source === 'url') setInputUrl(entry.sourceText);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-primary transition-all"
                      title="Load this extraction"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => onSaveQuestions(entry.questions as Question[])}
                      className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-success transition-all"
                      title="Save these questions"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => setExtractHistory(prev => prev.filter(h => h.id !== entry.id))}
                      className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-error transition-all"
                      title="Remove from history"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtractPanel;
