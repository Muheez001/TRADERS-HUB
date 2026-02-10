/**
 * Supabase Client Configuration
 * Used for authentication on the client side
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tkysghkdlcxslmvrfysb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRreXNnaGtkbGN4c2xtdnJmeXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzY1NjAsImV4cCI6MjA4NDU1MjU2MH0.R3N_lFLFRLu9BNlBlzfNTaxQ5VpRQT5WhxyEGUUzR8E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
