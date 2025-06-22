// src/types/env.d.ts
declare module '@expo/constants' {
    export interface AppConstants {
      expoConfig: {
        extra: {
          supabaseUrl: string;
          supabaseAnonKey: string;
          openaiApiKey: string;
        };
      };
    }
  }