import React,
{
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';
import { supabase } from '../lib/supabaseClient';
import { syncUserGoalSummary } from '../services/analyticsAggregator';
import { taskTrackingService } from '../services/taskTrackingService';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export type GoalStatus = 'active' | 'completed' | 'archived';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  deadline?: string; // date string in ISO format
  progress: number;
  status: GoalStatus;
  created_at: string; // timestamp in ISO format
  updated_at: string; // timestamp in ISO format
  completed_at?: string | null; // timestamp in ISO format
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

interface GoalsContextValue {
  goals: Goal[];
  isLoading: boolean;
  createGoal: (goal: GoalInput) => Promise<Goal>;
  updateGoal: (id: string, updates: GoalUpdate) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  clearGoals: () => void; // This will only clear local state, not database
}

type GoalsAction =
  | { type: 'SET_GOALS'; payload: Goal[] }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: { id: string; updates: GoalUpdate } }
  | { type: 'DELETE_GOAL'; payload: { id: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_GOALS' };

const GoalsContext = createContext<GoalsContextValue | undefined>(undefined);

function goalsReducer(state: { goals: Goal[], isLoading: boolean }, action: GoalsAction): { goals: Goal[], isLoading: boolean } {
  switch (action.type) {
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    case 'ADD_GOAL':
      return { ...state, goals: [action.payload, ...state.goals] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((goal) => {
          if (goal.id !== action.payload.id) {
            return goal;
          }

          const nextStatus = action.payload.updates.status ?? goal.status;
          let nextCompletedAt: string | null = goal.completed_at ?? null;

          if (action.payload.updates.completed_at !== undefined) {
            nextCompletedAt = action.payload.updates.completed_at as string | null;
          } else if (nextStatus === 'completed' && !goal.completed_at) {
            nextCompletedAt = new Date().toISOString();
          } else if (nextStatus !== 'completed') {
            nextCompletedAt = null;
          }

          return {
            ...goal,
            ...action.payload.updates,
            status: nextStatus as GoalStatus,
            updated_at: new Date().toISOString(),
            completed_at: nextCompletedAt
          };
        })
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((goal) => goal.id !== action.payload.id) };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'CLEAR_GOALS':
      return { ...state, goals: [] };
    default:
      return state;
  }
}

function createGoalId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `goal-${Math.random().toString(36).slice(2, 11)}`;
}

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(goalsReducer, { goals: [], isLoading: true });
  const [session, setSession] = useState<Session | null>(null);

  const syncGoalAggregate = useCallback(
    (goalsList: Goal[]) => {
      if (!session?.user) {
        return;
      }

      const completedCount = goalsList.filter((goal) => goal.status === 'completed').length;

      const userId = session.user.id;

      void (async () => {
        try {
          await syncUserGoalSummary(userId, completedCount);
        } catch (error) {
          console.error('Failed to sync aggregated goal analytics', error);
        }
      })();
    },
    [session]
  );

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load goals when session changes
  useEffect(() => {
    if (session) {
      loadGoals();
    } else {
      // Clear goals if user is logged out
      dispatch({ type: 'SET_GOALS', payload: [] });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [session]);

  const loadGoals = async () => {
    if (!session?.user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const goals = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        description: item.description || undefined,
        category: item.category || undefined,
        deadline: item.deadline || undefined,
        progress: item.progress,
        status: item.status as GoalStatus,
        created_at: item.created_at,
        updated_at: item.updated_at,
        completed_at: item.completed_at || undefined,
        priority: item.priority as 'low' | 'medium' | 'high' || undefined,
        source: item.source as 'template' | 'custom' | 'imported' || undefined,
        template_id: item.template_id || undefined
      }));

      dispatch({ type: 'SET_GOALS', payload: goals });
      syncGoalAggregate(goals);
    } catch (error) {
      console.error('Error loading goals:', error);
      // Still set loading to false even if there's an error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createGoal = useCallback(async (input: GoalInput): Promise<Goal> => {
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    const now = new Date().toISOString();
    const newGoal: Goal = {
      id: createGoalId(), // Using our own ID to ensure consistency before DB insertion
      user_id: session.user.id,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      category: input.category || undefined,
      deadline: input.deadline || undefined,
      progress: Math.min(Math.max(input.progress ?? 0, 0), 100),
      status: input.progress && input.progress >= 100 ? 'completed' : 'active',
      created_at: now,
      updated_at: now,
      completed_at: input.progress && input.progress >= 100 ? now : null,
      priority: input.priority,
      source: input.source,
      template_id: input.templateId
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('goals')
      .insert([{ 
        ...newGoal,
        id: undefined // Let Supabase generate the ID
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      throw error;
    }

    // Transform the returned data to match our interface
    const createdGoal: Goal = {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description || undefined,
      category: data.category || undefined,
      deadline: data.deadline || undefined,
      progress: data.progress,
      status: data.status as GoalStatus,
      created_at: data.created_at,
      updated_at: data.updated_at,
      completed_at: data.completed_at || undefined,
      priority: data.priority as 'low' | 'medium' | 'high' || undefined,
      source: data.source as 'template' | 'custom' | 'imported' || undefined,
      template_id: data.template_id || undefined
    };

    dispatch({ type: 'ADD_GOAL', payload: createdGoal });
    const nextGoals = [createdGoal, ...state.goals];
    syncGoalAggregate(nextGoals);
    return createdGoal;
  }, [session, state.goals, syncGoalAggregate]);

  const updateGoal = useCallback(async (id: string, updates: GoalUpdate): Promise<void> => {
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    // Update in Supabase
    const { error } = await supabase
      .from('goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error updating goal:', error);
      throw error;
    }

    dispatch({
      type: 'UPDATE_GOAL',
      payload: {
        id,
        updates: { ...updates, updated_at: new Date().toISOString() }
      }
    });
    const updatedAt = new Date().toISOString();
    const nextGoals = state.goals.map((goal) => {
      if (goal.id !== id) {
        return goal;
      }

      const nextStatus = (updates.status ?? goal.status) as GoalStatus;
      let nextCompletedAt: string | null = goal.completed_at ?? null;

      if (updates.completed_at !== undefined) {
        nextCompletedAt = updates.completed_at as string | null;
      } else if (nextStatus === 'completed' && !goal.completed_at) {
        nextCompletedAt = updatedAt;
        // Track this as a completed task
        taskTrackingService.addCompletedTask({
          id: `goal-${id}`,
          title: `Completed goal: ${goal.title}`,
          source: 'goal',
          metadata: {
            goalId: goal.id,
            goalTitle: goal.title
          }
        });
      } else if (nextStatus !== 'completed') {
        nextCompletedAt = null;
      }

      return {
        ...goal,
        ...updates,
        status: nextStatus,
        updated_at: updatedAt,
        completed_at: nextCompletedAt ?? undefined
      };
    });
    syncGoalAggregate(nextGoals);
  }, [session, state.goals, syncGoalAggregate]);

  const deleteGoal = useCallback(async (id: string): Promise<void> => {
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    // Delete from Supabase
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }

    dispatch({ type: 'DELETE_GOAL', payload: { id } });
    const nextGoals = state.goals.filter((goal) => goal.id !== id);
    syncGoalAggregate(nextGoals);
  }, [session, state.goals, syncGoalAggregate]);

  const clearGoals = useCallback(() => {
    // Only clear local state - don't delete from database as that would be destructive
    dispatch({ type: 'CLEAR_GOALS' });
    syncGoalAggregate([]);
  }, [syncGoalAggregate]);

  const contextValue = useMemo<GoalsContextValue>(
    () => ({
      goals: state.goals,
      isLoading: state.isLoading,
      createGoal,
      updateGoal,
      deleteGoal,
      clearGoals
    }),
    [state.goals, state.isLoading, createGoal, updateGoal, deleteGoal, clearGoals]
  );

  return <GoalsContext.Provider value={contextValue}>{children}</GoalsContext.Provider>;
};

export function useGoals() {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}
