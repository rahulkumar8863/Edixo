import { Question, QuestionSet, ExamResult } from '../types';
import { api } from '../../lib/api';

export const storageService = {
  // --- Questions ---
  getQuestions: async (): Promise<Question[]> => {
    try {
      const res = await api.get('/qbank/questions');
      if (!res.success) return [];

      return res.data.map((q: any) => ({
        id: q.id,
        question_unique_id: q.questionId,
        question_hin: q.textHi || '',
        question_eng: q.textEn || '',
        subject: q.topic?.name || 'General',
        chapter: q.topic?.name || 'General',
        option1_hin: q.options[0]?.textHi || q.options[0]?.textEn || '',
        option1_eng: q.options[0]?.textEn || '',
        option2_hin: q.options[1]?.textHi || q.options[1]?.textEn || '',
        option2_eng: q.options[1]?.textEn || '',
        option3_hin: q.options[2]?.textHi || q.options[2]?.textEn || '',
        option3_eng: q.options[2]?.textEn || '',
        option4_hin: q.options[3]?.textHi || q.options[3]?.textEn || '',
        option4_eng: q.options[3]?.textEn || '',
        answer: String(q.options.findIndex((o: any) => o.isCorrect) + 1),
        solution_hin: q.explanationHi || '',
        solution_eng: q.explanationEn || '',
        type: 'MCQ',
        difficulty: q.difficulty.charAt(0) + q.difficulty.slice(1).toLowerCase(),
        language: q.textHi && q.textEn ? 'Bilingual' : q.textHi ? 'Hindi' : 'English',
        tags: q.tags || [],
        createdDate: q.createdAt,
      }));
    } catch (err) {
      console.error('Error fetching questions:', err);
      return [];
    }
  },

  saveQuestion: async (question: Question): Promise<void> => {
    const payload = {
      textEn: question.question_eng,
      textHi: question.question_hin,
      explanationEn: question.solution_eng,
      explanationHi: question.solution_hin,
      difficulty: question.difficulty.toUpperCase(),
      options: [
        { textEn: question.option1_eng, textHi: question.option1_hin, isCorrect: question.answer === '1' },
        { textEn: question.option2_eng, textHi: question.option2_hin, isCorrect: question.answer === '2' },
        { textEn: question.option3_eng, textHi: question.option3_hin, isCorrect: question.answer === '3' },
        { textEn: question.option4_eng, textHi: question.option4_hin, isCorrect: question.answer === '4' },
      ]
    };

    if (question.id && !question.id.startsWith('q_')) {
      await api.patch(`/qbank/questions/${question.id}`, payload);
    } else {
      await api.post('/qbank/questions', payload);
    }
  },

  saveQuestionsBulk: async (newQuestions: Question[]): Promise<void> => {
    // For now, sequentially or handle in backend if supported.
    // We should probably add a bulk insert in the backend if frequent.
    // Given the task, I'll use individual posts for now or recommend the dedicated bulk-upload endpoint.
    for (const q of newQuestions) {
      await storageService.saveQuestion(q);
    }
  },

  updateQuestionsBulk: async (ids: string[], updates: Partial<Question>): Promise<void> => {
    // Current backend doesn't have bulk patch for fields, only single question patch.
    // Implementing sequential updates.
    for (const id of ids) {
      await api.patch(`/qbank/questions/${id}`, updates);
    }
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/qbank/questions/${id}`);
  },

  deleteQuestionsBulk: async (ids: string[]): Promise<void> => {
    await api.delete('/qbank/questions', { ids });
  },

  // --- Sets ---
  getSets: async (): Promise<QuestionSet[]> => {
    try {
      const res = await api.get('/qbank/sets');
      return res.data || [];
    } catch (err) {
      console.error('Error fetching sets:', err);
      return [];
    }
  },

  getSetById: async (setId: string): Promise<QuestionSet | undefined> => {
    try {
      const res = await api.get(`/qbank/sets/${setId}`);
      return res.data;
    } catch (err) {
      console.error('Error fetching set by ID:', err);
      return undefined;
    }
  },

  saveSet: async (set: QuestionSet): Promise<void> => {
    if (set.setId) {
      // Assuming PATCH is supported for sets similarly
      await api.post('/qbank/sets', set);
    } else {
      await api.post('/qbank/sets', set);
    }
  },

  deleteSet: async (setId: string): Promise<void> => {
    await api.delete(`/qbank/sets/${setId}`);
  },

  uploadClassNotePDF: async (blob: Blob, fileName: string): Promise<string | null> => {
    try {
      const res = await api.upload('/upload/pdf', blob);
      return res.data.url;
    } catch (err) {
      console.error('Error uploading PDF:', err);
      return null;
    }
  },

  saveResult: async (result: ExamResult): Promise<void> => {
    // results are currently handled by students module in mockbook context
    // but for public website, we can send to a generic test attempt endpoint if student
    try {
      await api.post('/tests/attempt', result);
    } catch (err) {
      console.error('Error saving result:', err);
    }
  }
};
