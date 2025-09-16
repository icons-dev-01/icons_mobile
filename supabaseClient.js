import { createClient } from '@supabase/supabase-js';
const supabaseUrl = "https://xttbiyomostvfgsqyduv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0dGJpeW9tb3N0dmZnc3F5ZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MjY2MDksImV4cCI6MjA3MTUwMjYwOX0.NBqBjM3cqE14Erri9MysjoFL0AkkDhs65Q_OlcaANEw";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);