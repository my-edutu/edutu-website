import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = (url: string, key: string) => {
  if (!url || !key) {
    throw new Error('Missing Supabase URL or anon key');
  }

  return createClient(url, key, {
    realtime: {
      enabled: false, 
    },
  });
};