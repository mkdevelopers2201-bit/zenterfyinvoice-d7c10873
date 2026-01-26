import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xvlnlertpfdkgvitlfsc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bG5sZXJ0cGZka2d2aXRsZnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMjk4NjYsImV4cCI6MjA4NDkwNTg2Nn0.y0YpOijw8yPQsuKj6zy8xaxlKHwhSwf7Y1Fm-EI-QVw';

// Use 'export default' instead of just 'export const'
const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
