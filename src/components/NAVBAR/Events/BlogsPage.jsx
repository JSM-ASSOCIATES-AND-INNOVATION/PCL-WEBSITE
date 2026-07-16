import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Preloader from '../../UI/Preloader/Preloader';

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const { data, error } = await supabase
                    .from('admin_notices')
                    .select('*')
                    .eq('is_public', true)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                setBlogs(data || []);
            } catch (err) {
                console.error("Error fetching blogs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) return <Preloader />;

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-[150px] pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#c4a661] mb-4 tracking-wider">PCL Blogs & Announcements</h1>
                    <p className="text-white/60 max-w-2xl mx-auto font-light">Stay updated with the latest news, legal insights, and campus announcements from Prudentia College of Law.</p>
                </div>

                {blogs.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <i className="fa-solid fa-folder-open text-4xl text-[#c4a661] mb-4"></i>
                        <h3 className="text-xl font-medium text-white mb-2">No Posts Yet</h3>
                        <p className="text-white/50">Check back later for new updates.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <div key={blog.id} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-[#c4a661]/50 transition-all duration-300 group flex flex-col h-full">
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#c4a661] bg-[#c4a661]/10 px-3 py-1 rounded-full">
                                            {blog.category || 'Announcement'}
                                        </span>
                                        <span className="text-xs text-white/40">
                                            {new Date(blog.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#c4a661] transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-white/60 text-sm mb-6 flex-1 line-clamp-4">
                                        {blog.content}
                                    </p>
                                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/10">
                                        <div className="w-8 h-8 rounded-full bg-[#c4a661]/20 flex items-center justify-center text-[#c4a661] text-xs font-bold">
                                            {blog.author ? blog.author.charAt(0).toUpperCase() : 'A'}
                                        </div>
                                        <span className="text-sm font-medium text-white/80">{blog.author || 'Admin'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
