import { createClient } from "@supabase/supabase-js";
const PUBLIC_SUPABASE_URL = "https://vtogtpnknnvcfzpcoetq.supabase.co";
const PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0b2d0cG5rbm52Y2Z6cGNvZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMjkyNjAsImV4cCI6MjA4MTcwNTI2MH0.kFKYyq25ELHFPujdpOHwNFoVPhF_smDM0gnIc9m1vpQ";
const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
export {
  supabase as s
};
