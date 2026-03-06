
import { Question, QuestionSet, ExamResult } from '../types';
import { supabase } from '../../lib/supabase';

export const storageService = {
  // --- Questions ---
  // --- Questions ---
  getQuestions: async (): Promise<Question[]> => {
    // 8-second timeout — if Supabase is offline, fail fast
    const timeout = new Promise<Question[]>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase timeout — server may be offline')), 8000)
    );

    const fetchQuestions = async (): Promise<Question[]> => {
      // 1. Fetch from legacy 'questions' table
      let legacyRes: any = { data: null, error: null };
      try {
        legacyRes = await supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false });
      } catch (err: any) {
        console.warn(`[Supabase Legacy Table Timeout/Fail] ${err?.message || 'Network Error'}`);
        legacyRes.error = err;
      }

      if (legacyRes?.error) {
        console.warn('Error fetching legacy questions:', legacyRes.error);
      }

      const legacyQuestions: Question[] = legacyRes?.data || [];

      // 2. Fetch from 'questions_master' table (only if exists)
      let newQuestions: Question[] = [];
      try {
        let masterRes: any = { data: null, error: null };
        try {
          masterRes = await supabase
            .from('questions_master')
            .select('*')
            .order('created_at', { ascending: false });
        } catch (err: any) {
          console.warn(`[Supabase Master Table Timeout/Fail] ${err?.message || 'Network Error'}`);
          masterRes.error = err;
        }

        if (!masterRes.error && masterRes.data) {
          newQuestions = masterRes.data.map((row: any) => ({
            id: String(row.question_id),
            question_unique_id: String(row.question_id),
            question_hin: row.language_type === 'English' ? '' : row.question_text,
            question_eng: row.language_type === 'Hindi' ? '' : row.question_text,
            subject: row.subject_name || 'General',
            chapter: row.topic_name || 'General',
            option1_hin: row.option_a || '',
            option1_eng: row.option_a || '',
            option2_hin: row.option_b || '',
            option2_eng: row.option_b || '',
            option3_hin: row.option_c || '',
            option3_eng: row.option_c || '',
            option4_hin: row.option_d || '',
            option4_eng: row.option_d || '',
            answer: row.correct_answer,
            solution_hin: row.answer_explanation || '',
            solution_eng: row.answer_explanation || '',
            type: 'MCQ',
            difficulty: row.difficulty_level || 'Medium',
            language: row.language_type || 'Bilingual',
            tags: [],
            createdDate: row.created_at,
            exam: row.question_source
          }));
        }
      } catch {
        // questions_master table may not exist — that's ok
      }

      return [...legacyQuestions, ...newQuestions];
    };

    try {
      return await Promise.race([fetchQuestions(), timeout]);
    } catch (err: any) {
      console.warn(`[Supabase Promise.race Timeout/Fail] ${err?.message || 'Network Error'}`);
      return [];
    }
  },

  saveQuestion: async (question: Question): Promise<void> => {
    let currentUserId: string | null = null;

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.warn('Error fetching current user for saveQuestion:', error);
      } else if (data?.user) {
        currentUserId = data.user.id;
      }
    } catch (err: any) {
      console.warn(`Unexpected error fetching current user for saveQuestion: ${err?.message}`);
    }

    // Only include fields that exist in the Supabase 'questions' table schema
    // Filter out extra frontend-only fields that don't have database columns
    const allowedFields = {
      id: question.id,
      question_unique_id: question.question_unique_id,
      question_hin: question.question_hin,
      question_eng: question.question_eng,
      subject: question.subject,
      chapter: question.chapter,
      option1_hin: question.option1_hin,
      option1_eng: question.option1_eng,
      option2_hin: question.option2_hin,
      option2_eng: question.option2_eng,
      option3_hin: question.option3_hin,
      option3_eng: question.option3_eng,
      option4_hin: question.option4_hin,
      option4_eng: question.option4_eng,
      option5_hin: question.option5_hin,
      option5_eng: question.option5_eng,
      answer: question.answer,
      solution_hin: question.solution_hin,
      solution_eng: question.solution_eng,
      type: question.type,
      difficulty: question.difficulty,
      language: question.language,
      tags: question.tags,
      createdDate: question.createdDate,
      exam: question.exam,
      year: question.year,
      date: question.date,
      flagged: question.flagged,
      created_by_user_id: currentUserId
    };

    const { error } = await supabase
      .from('questions')
      .upsert(allowedFields);

    if (error) {
      console.warn('Error saving question:', error);
      throw error;
    }
  },

  saveQuestionsBulk: async (newQuestions: Question[]): Promise<void> => {
    let currentUserId: string | null = null;

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching current user for saveQuestionsBulk:', error);
      } else if (data?.user) {
        currentUserId = data.user.id;
      }
    } catch (err) {
      console.error('Unexpected error fetching current user for saveQuestionsBulk:', err);
    }

    // Filter each question to only include allowed database fields
    // Also remove null/undefined values to prevent database errors
    const filteredQuestions = newQuestions.map(q => {
      const cleaned: Record<string, any> = {
        id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        question_unique_id: q.question_unique_id || q.id,
        question_hin: q.question_hin || '',
        question_eng: q.question_eng || '',
        subject: q.subject || 'General',
        chapter: q.chapter || '',
        option1_hin: q.option1_hin || '',
        option1_eng: q.option1_eng || '',
        option2_hin: q.option2_hin || '',
        option2_eng: q.option2_eng || '',
        option3_hin: q.option3_hin || '',
        option3_eng: q.option3_eng || '',
        option4_hin: q.option4_hin || '',
        option4_eng: q.option4_eng || '',
        answer: q.answer || '1',
        solution_hin: q.solution_hin || '',
        solution_eng: q.solution_eng || '',
        type: q.type || 'MCQ',
        difficulty: q.difficulty || 'Medium',
        language: q.language || 'Bilingual',
        tags: Array.isArray(q.tags) ? q.tags : [],
        createdDate: q.createdDate || new Date().toISOString(),
        created_by_user_id: currentUserId
      };

      // Only add optional fields if they have valid non-null values
      if (q.option5_hin) cleaned.option5_hin = q.option5_hin;
      if (q.option5_eng) cleaned.option5_eng = q.option5_eng;
      if (q.exam) cleaned.exam = q.exam;
      if (q.year) cleaned.year = q.year;
      if (q.date) cleaned.date = q.date;
      if (typeof q.flagged === 'boolean') cleaned.flagged = q.flagged;

      return cleaned;
    });

    console.log('Saving questions:', filteredQuestions.length, filteredQuestions[0]);

    const { error } = await supabase
      .from('questions')
      .insert(filteredQuestions);

    if (error) {
      console.error('Error bulk saving questions:', error);
      throw error;
    }
  },

  updateQuestionsBulk: async (ids: string[], updates: Partial<Question>): Promise<void> => {
    const { error } = await supabase
      .from('questions')
      .update(updates)
      .in('id', ids);

    if (error) {
      console.error('Error bulk updating questions:', error);
      throw error;
    }
  },

  deleteQuestion: async (id: string): Promise<void> => {
    console.log('[DELETE] Attempting to delete question:', id);
    let deleted = false;

    // Try deleting from legacy 'questions' table
    const { error: legacyError, count: legacyCount } = await supabase
      .from('questions')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (legacyError) {
      console.error('[DELETE] Error deleting from questions:', legacyError);
    } else if (legacyCount && legacyCount > 0) {
      console.log('[DELETE] Deleted from questions table, count:', legacyCount);
      deleted = true;
    }

    // Also try deleting from 'questions_master' table
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      const { error: masterError, count: masterCount } = await supabase
        .from('questions_master')
        .delete({ count: 'exact' })
        .eq('question_id', numericId);

      if (masterError) {
        console.error('[DELETE] Error deleting from questions_master:', masterError);
      } else if (masterCount && masterCount > 0) {
        console.log('[DELETE] Deleted from questions_master table, count:', masterCount);
        deleted = true;
      }
    }

    // Also try questions_master with string id column in case it uses 'id' not 'question_id'
    if (!deleted) {
      const { error: masterIdError, count: masterIdCount } = await supabase
        .from('questions_master')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (!masterIdError && masterIdCount && masterIdCount > 0) {
        console.log('[DELETE] Deleted from questions_master by id column, count:', masterIdCount);
        deleted = true;
      }
    }

    if (!deleted) {
      console.warn('[DELETE] Question not found in any table:', id);
    }
  },

  deleteQuestionsBulk: async (ids: string[]): Promise<void> => {
    console.log('[BULK DELETE] Attempting to delete', ids.length, 'questions:', ids);

    // Delete from legacy 'questions' table
    const { error: legacyError, count: legacyCount } = await supabase
      .from('questions')
      .delete({ count: 'exact' })
      .in('id', ids);

    if (legacyError) {
      console.error('[BULK DELETE] Error from questions:', legacyError);
    } else {
      console.log('[BULK DELETE] Deleted from questions table, count:', legacyCount);
    }

    // Delete from 'questions_master' by question_id (numeric)
    const numericIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    if (numericIds.length > 0) {
      const { error: masterError, count: masterCount } = await supabase
        .from('questions_master')
        .delete({ count: 'exact' })
        .in('question_id', numericIds);

      if (masterError) {
        console.error('[BULK DELETE] Error from questions_master:', masterError);
      } else {
        console.log('[BULK DELETE] Deleted from questions_master by question_id, count:', masterCount);
      }
    }

    // Also try questions_master with string 'id' column
    const { error: masterIdError, count: masterIdCount } = await supabase
      .from('questions_master')
      .delete({ count: 'exact' })
      .in('id', ids);

    if (!masterIdError) {
      console.log('[BULK DELETE] Deleted from questions_master by id, count:', masterIdCount);
    }
  },

  // --- Sets ---
  getSets: async (): Promise<QuestionSet[]> => {
    try {
      const { data, error } = await supabase
        .from('sets')
        .select('*')
        .order('createdDate', { ascending: false });

      if (error) {
        console.error('Error fetching sets:', error);
        return [];
      }
      return data || [];
    } catch (err: any) {
      console.warn(`[Supabase Sets Table Timeout/Fail] ${err?.message || 'Network Error'}`);
      return [];
    }
  },

  getSetById: async (setId: string): Promise<QuestionSet | undefined> => {
    try {
      const { data, error } = await supabase
        .from('sets')
        .select('*')
        .eq('setId', setId)
        .single();

      if (error) {
        console.error('Error fetching set by ID:', error);
        return undefined;
      }
      return data;
    } catch (err: any) {
      console.warn(`[Supabase getSetById Timeout/Fail] ${err?.message || 'Network Error'}`);
      return undefined;
    }
  },

  saveSet: async (set: QuestionSet): Promise<void> => {
    const { error } = await supabase
      .from('sets')
      .upsert(set, { onConflict: 'setId' });

    if (error) {
      console.error('Error saving set:', error);
      throw error;
    }
  },

  deleteSet: async (setId: string): Promise<void> => {
    const { error } = await supabase
      .from('sets')
      .delete()
      .eq('setId', setId);

    if (error) {
      console.error('Error deleting set:', error);
      throw error;
    }
  },

  uploadClassNotePDF: async (blob: Blob, fileName: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('class-notes')
      .upload(`${fileName}`, blob, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading PDF:', error);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from('class-notes')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  },

  saveResult: async (result: ExamResult): Promise<void> => {
    const { error } = await supabase
      .from('results')
      .upsert(result);

    if (error) {
      console.error('Error saving result:', error);
      // Don't throw, just log. We don't want to crash the UI if stats fail.
    }
  }
};
