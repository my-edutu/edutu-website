import { useState, useCallback, useEffect, useMemo, useReducer } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

export type GoalStatus = 'active' | 'completed' | 'archived';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  deadline?: string;
  progress: number;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  priority?: 'low' | 'medium' | 'high';
  source?: 'template' | 'custom' | 'imported';
  template_id?: string;
}

export interface GoalInput {
  title: string;
  description?: string;
  category?: string;
  deadline?: string;
  progress?: number;
  priority?: 'low' | 'medium' | 'high';
  source?: 'template' | 'custom' | 'imported';
  templateId?: string;
}

export type GoalUpdate = Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>;

interface GoalsState {
  goals: Goal[];
  isLoading: boolean;
}

type GoalsAction =
  | { type: 'SET_GOALS'; payload: Goal[] }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: { id: string; updates: GoalUpdate } }
  | { type: 'DELETE_GOAL'; payload: { id: string } }
  | { type: 'SET_LOADING'; payload: boolean };

function goalsReducer(state: GoalsState, action: GoalsAction): GoalsState {
  switch (action.type) {
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    case 'ADD_GOAL':
      return { ...state, goals: [action.payload, ...state.goals] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((goal) => {
          if (goal.id !== action.payload.id) return goal;
          return { ...goal, ...action.payload.updates, updated_at: new Date().toISOString() };
        })
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((goal) => goal.id !== action.payload.id) };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function useGoals(supabase: SupabaseClient, userId: string | null) {
  const [state, dispatch] = useReducer(goalsReducer, { goals: [], isLoading: true });

  const loadGoals = useCallback(async () => {
    if (!userId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      dispatch({ type: 'SET_GOALS', payload: data as Goal[] });
    } catch (error: any) {
      if (error.code === '22P02') {
        console.error('Error loading goals: Supabase expects a UUID for user_id, but received a Clerk ID string. Please update the user_id column type in your database to TEXT or map Clerk IDs to UUIDs.');
      } else {
        console.error('Error loading goals:', error);
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [supabase, userId]);

  const createGoal = useCallback(async (input: GoalInput): Promise<Goal> => {
    if (!userId) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    const newGoalData = {
      user_id: userId,
      title: input.title.trim(),
      description: input.description?.trim(),
      category: input.category,
      deadline: input.deadline,
      progress: input.progress ?? 0,
      status: (input.progress ?? 0) >= 100 ? 'completed' : 'active',
      created_at: now,
      updated_at: now,
      completed_at: (input.progress ?? 0) >= 100 ? now : null,
      priority: input.priority,
      source: input.source,
      template_id: input.templateId
    };

    const { data, error } = await supabase
      .from('goals')
      .insert([newGoalData])
      .select()
      .single();

    if (error) throw error;

    const createdGoal = data as Goal;
    dispatch({ type: 'ADD_GOAL', payload: createdGoal });
    return createdGoal;
  }, [supabase, userId]);

  const updateGoal = useCallback(async (id: string, updates: GoalUpdate): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    dispatch({ type: 'UPDATE_GOAL', payload: { id, updates } });
  }, [supabase, userId]);

  const deleteGoal = useCallback(async (id: string): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    dispatch({ type: 'DELETE_GOAL', payload: { id } });
  }, [supabase, userId]);

  useEffect(() => {
    if (userId) {
      loadGoals();
    } else {
      dispatch({ type: 'SET_GOALS', payload: [] });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [userId, loadGoals]);

  return {
    goals: state.goals,
    isLoading: state.isLoading,
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal
  };
}
