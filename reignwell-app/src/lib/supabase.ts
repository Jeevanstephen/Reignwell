import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isConfigured =
  supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://');

// SecureStore has a 2KB value limit — chunk large tokens
const CHUNK_SIZE = 1900;

const SecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunkCount) {
      const chunks: string[] = [];
      for (let i = 0; i < parseInt(chunkCount, 10); i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
        if (chunk) chunks.push(chunk);
      }
      return chunks.join('');
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
    } else {
      const chunks = Math.ceil(value.length / CHUNK_SIZE);
      await SecureStore.setItemAsync(`${key}_chunks`, String(chunks));
      for (let i = 0; i < chunks; i++) {
        await SecureStore.setItemAsync(
          `${key}_chunk_${i}`,
          value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        );
      }
    }
  },
  async removeItem(key: string): Promise<void> {
    const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunkCount) {
      await SecureStore.deleteItemAsync(`${key}_chunks`);
      for (let i = 0; i < parseInt(chunkCount, 10); i++) {
        await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
