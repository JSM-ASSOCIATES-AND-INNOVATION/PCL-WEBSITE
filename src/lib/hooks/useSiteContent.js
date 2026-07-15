import { useState, useEffect } from 'react';
import { supabase } from '../SUPABASE/supabaseClient';

export function useSiteContent(pagePath, sectionName) {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchContent() {
            try {
                const { data, error: fetchError } = await supabase
                    .from('website_content')
                    .select('content')
                    .eq('page_path', pagePath)
                    .eq('section_name', sectionName)
                    .maybeSingle();

                if (fetchError) throw fetchError;
                
                if (data && data.content) {
                    setContent(data.content);
                }
            } catch (err) {
                console.error(`Failed to fetch content for ${pagePath} - ${sectionName}:`, err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchContent();
    }, [pagePath, sectionName]);

    return { content, loading, error };
}
