import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'your_supabase_url')
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;


export function isSupabaseConfigured() {
    return supabase !== null;
}

export async function signUp(email, password) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

export async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export function onAuthStateChange(callback) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => { } } } };
    return supabase.auth.onAuthStateChange(callback);
}

// ========================
// Resume CRUD
// ========================

export async function saveResume({ fileName, resumeText, wordCount, pageCount }) {
    if (!supabase) return null;
    const user = await getCurrentUser();
    if (!user) return null;

    // Upsert — update if exists, insert if not
    // First check if user has a resume
    const { data: existing } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

    if (existing) {
        const { data, error } = await supabase
            .from('resumes')
            .update({ file_name: fileName, resume_text: resumeText, word_count: wordCount, page_count: pageCount })
            .eq('id', existing.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase
            .from('resumes')
            .insert({ user_id: user.id, file_name: fileName, resume_text: resumeText, word_count: wordCount, page_count: pageCount })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
}

export async function loadResume() {
    if (!supabase) return null;
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
}

// ========================
// Analysis CRUD
// ========================

export async function saveAnalysis(type, result) {
    if (!supabase) return null;
    const user = await getCurrentUser();
    if (!user) return null;

    // Get user's latest resume
    const { data: resume } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (!resume) return null; // Can't save analysis without a resume

    // Delete old analysis of same type for this resume
    await supabase
        .from('analyses')
        .delete()
        .eq('resume_id', resume.id)
        .eq('type', type);

    const { data, error } = await supabase
        .from('analyses')
        .insert({ resume_id: resume.id, user_id: user.id, type, result })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function loadAnalysis(type) {
    if (!supabase) return null;
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.result || null;
}

export default supabase;
