// Copy this file to cloud-config.js after creating a Supabase project and a Cloudflare Worker.
// The Supabase anon key is intentionally public. Never add a service-role key or OpenAI key here.
window.SHORTFORM_CLOUD_CONFIG = {
  enabled: true,
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
  workerUrl: "https://shortform-ai-proxy.YOUR_ACCOUNT.workers.dev",
};
