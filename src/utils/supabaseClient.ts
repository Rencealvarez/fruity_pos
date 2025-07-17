import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pagxbuttmgowwoifaabi.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZ3hidXR0bWdvd3dvaWZhYWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDgzMjIsImV4cCI6MjA2NDYyNDMyMn0.l3znCjqqm5MAtLGEksg4qMnlZdZ2cpSOr50q0Q65ou8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
