import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xanqnthtsbydvhjxzeou.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhbnFudGh0c2J5ZHZoanh6ZW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDc4NTQsImV4cCI6MjA2Mjg4Mzg1NH0.J3NK8qzqE7hcbI_IrLmAP-kMCB7_YcolgBO7UUt4ojk";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY){
    throw new Error(
        "Supabase URL ou chave não estão configuradas corrretamente"
    );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);