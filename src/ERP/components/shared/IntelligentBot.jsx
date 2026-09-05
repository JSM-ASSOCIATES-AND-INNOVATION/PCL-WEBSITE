/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERP } from '../../context/ErpContext';
import { supabase } from '../../lib/supabase/supabaseClient';

// Simple inline markdown parser for the bot
const formatMessage = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-themeAccent font-black">{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i} className="opacity-90 italic">{part.slice(1, -1)}</em>;
        } else if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
            const label = part.substring(1, part.indexOf(']'));
            const url = part.substring(part.indexOf('(') + 1, part.length - 1);
            return <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{label}</a>;
        }
        return <span key={i}>{part}</span>;
    });
};

export default function IntelligentBot() {
    const { userSession } = useERP();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting
    useEffect(() => {
        if (userSession && messages.length === 0) {
            const hour = new Date().getHours();
            const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
            
            if (userSession.role === 'admin') {
                setMessages([{ id: '1', sender: 'bot', text: `${greeting}, Admin. I am the Command Interface. Type **"draft notice"**, **"suspend student"**, or **"add seats"** to begin.` }]);
            } else if (userSession.role === 'faculty') {
                setMessages([{ id: '1', sender: 'bot', text: `${greeting}, Professor. I can help you check **notices**, **upcoming assignments**, or escalate urgent issues.` }]);
            } else {
                setMessages([{ id: '1', sender: 'bot', text: `${greeting}! I am your Intelligent ERP Assistant. Try asking me about **notices**, **assignments**, or **help**.` }]);
            }
        }
    }, [userSession, messages.length]);

    // Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, isOpen]);

    if (!userSession) return null;

    const noticeKeywords = ['notice', 'news', 'announcement', 'update', 'latest'];
    const assignmentKeywords = ['assignment', 'due', 'homework', 'task', 'project'];
    const urgentKeywords = ['harass', 'urgent', 'critical', 'emergency', 'broken', 'help'];
    const examKeywords = ['exam', 'test', 'assessment', 'marks', 'grade'];

    const matchKeywords = (text, keywords) => {
        const lower = text.toLowerCase();
        return keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower) || lower.includes(kw));
    };

    const fetchNotices = async () => {
        try {
            const { data } = await supabase.from('notices').select('title, created_at').eq('status', 'PUBLISHED').order('created_at', { ascending: false }).limit(3);
            if (data && data.length > 0) {
                return "Here are the latest notices:\n" + data.map(n => `• **${n.title}**`).join('\n');
            }
            return "There are no recent notices published.";
        } catch (e) {
            return "I couldn't retrieve the notices at this moment.";
        }
    };

    const fetchAssignments = async () => {
        try {
            const { data } = await supabase.from('assignments').select('title, due_date').order('created_at', { ascending: false }).limit(3);
            if (data && data.length > 0) {
                return "Here are the recent assignments:\n" + data.map(n => `• **${n.title}**`).join('\n');
            }
            return "You have no active assignments right now.";
        } catch (e) {
            return "I couldn't retrieve assignments at this moment.";
        }
    };

    const handleEscalation = async (userMsg) => {
        try {
            await supabase.from('helpdesk_tickets').insert([{
                subject: '[AI ESCALATION] Urgent Request',
                description: userMsg,
                priority: 'High',
                status: 'Open'
            }]);
        } catch (err) {
            console.error('Escalation failed:', err);
        }
    };

    const handleAdminCommands = (text) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('suspend') || lowerText.includes('disciplinary')) {
            setTimeout(() => { setIsOpen(false); navigate('/admin/users'); }, 1500);
            return "Navigating to **Identity & Access Management** for disciplinary actions...";
        }
        if (lowerText.includes('draft notice') || lowerText.includes('new notice')) {
            setTimeout(() => { setIsOpen(false); navigate('/admin/notices'); }, 1500);
            return "Opening the **Broadcast Center** to draft a new notice...";
        }
        if (lowerText.includes('add seats') || lowerText.includes('increase capacity')) {
            setTimeout(() => { setIsOpen(false); navigate('/admin/curriculum'); }, 1500);
            return "Navigating to **Master Timetable Builder** to manage capacities.";
        }
        return null; 
    };

    const processMessage = (textToShow, textToProcess = textToShow) => {
        if (!textToShow.trim()) return;

        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: textToShow }]);
        setIsTyping(true);

        setTimeout(async () => {
            let botReply = null;

            if (userSession?.role === 'admin') {
                botReply = handleAdminCommands(textToProcess);
            }

            if (!botReply) {
                if (matchKeywords(textToProcess, urgentKeywords)) {
                    await handleEscalation(textToProcess);
                    botReply = "⚠️ **Your request has been escalated.** An administrator has been notified immediately via the Helpdesk system.";
                } else if (matchKeywords(textToProcess, noticeKeywords)) {
                    botReply = await fetchNotices();
                } else if (matchKeywords(textToProcess, assignmentKeywords)) {
                    botReply = await fetchAssignments();
                } else if (matchKeywords(textToProcess, examKeywords)) {
                    botReply = "You can view your detailed examination schedule and admit card directly in the **Examinations Portal** on your dashboard.";
                } else if (matchKeywords(textToProcess, ['hi', 'hello', 'hey', 'greetings'])) {
                    botReply = "Hello! I am your Intelligent ERP Assistant. How can I help optimize your workflow today?";
                } else if (matchKeywords(textToProcess, ['clear', 'reset', 'restart'])) {
                    setMessages([{ id: Date.now().toString(), sender: 'bot', text: 'Chat history cleared. How can I help you today?' }]);
                    setIsTyping(false);
                    return;
                } else {
                    if (userSession?.role === 'admin') {
                        botReply = "Command not recognized. Try **'draft notice'**, **'suspend [student]'**, or **'add seats'**.";
                    } else {
                        botReply = "I couldn't perfectly match that. Try asking me about **notices**, **assignments**, or say **'help'** for emergencies.";
                    }
                }
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: botReply }]);
            setIsTyping(false);
        }, 600 + Math.random() * 400); // More natural typing delay
    };

    const handleSend = (e) => {
        e.preventDefault();
        const userMsg = inputText;
        if (!userMsg.trim()) return;
        setInputText('');
        processMessage(userMsg);
    };

    const handleChipClick = (chip) => {
        processMessage(chip);
    };

    return (
        <div className="fixed bottom-[110px] lg:bottom-6 right-4 lg:right-6 z-[200] flex flex-col items-end">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-themePanel/85 backdrop-blur-2xl shadow-premium border border-black/5 dark:border-white/10 flex items-center justify-center text-themeAccent hover:scale-110 hover:shadow-themeAccent/20 transition-all cursor-pointer group"
                    aria-label="Open Assistant"
                >
                    <i className="fa-solid fa-robot text-2xl group-hover:rotate-12 transition-transform"></i>
                    <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-themePanel rounded-full animate-pulse"></span>
                </button>
            ) : (
                <div className="w-[calc(100vw-2rem)] max-w-sm h-[550px] max-h-[80vh] bg-themePanel/95 backdrop-blur-3xl shadow-premium border border-black/5 dark:border-white/10 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-[fadeIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
                    {/* Header */}
                    <div className="bg-white/5 border-b border-white/5 p-4 flex justify-between items-center z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-themeAccent to-indigo-500 flex items-center justify-center shadow-lg shadow-themeAccent/20">
                                    <i className="fa-solid fa-robot text-white text-sm"></i>
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-themePanel rounded-full"></span>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-black text-themeText text-sm uppercase tracking-widest leading-none mb-1">
                                    {userSession?.role === 'admin' ? 'Admin Bot' : 'ERP Assistant'}
                                </h3>
                                <p className="text-[9px] text-green-400 font-bold uppercase tracking-widest leading-none">System Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setMessages([])} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-themeTextSec transition-colors" title="Clear Chat">
                                <i className="fa-solid fa-trash-can text-xs"></i>
                            </button>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-themeText transition-colors">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-b from-transparent to-black/20 flex flex-col no-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`max-w-[85%] px-4 py-3 text-[13px] leading-relaxed flex flex-col shadow-sm ${
                                    msg.sender === 'user'
                                        ? 'bg-themeAccent text-white self-end rounded-2xl rounded-tr-sm'
                                        : 'bg-[#111] border border-white/5 text-neutral-300 self-start rounded-2xl rounded-tl-sm bot-msg-anim shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                                }`}
                            >
                                <span className="whitespace-pre-line">{formatMessage(msg.text)}</span>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="bg-[#111] border border-white/5 self-start rounded-2xl rounded-tl-sm px-4 py-3.5 bot-msg-anim flex gap-1.5 items-center shadow-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-themeAccent/70 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-themeAccent/70 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-themeAccent/70 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    {/* Preset Chips */}
                    <div className="px-3 py-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0 bg-[#0a0a0a]/50 border-t border-white/5">
                        {(userSession?.role === 'admin' 
                            ? ['Draft Notice', 'Suspend ID', 'Add Seats', 'Clear']
                            : ['📰 Notices', '📝 Assignments', '🚨 Help', 'Clear']
                        ).map((chip, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleChipClick(chip)}
                                disabled={isTyping}
                                className="whitespace-nowrap px-4 py-1.5 rounded-full border border-black/5 dark:border-white/10 bg-white/5 hover:bg-themeAccent hover:border-themeAccent text-[11px] font-bold text-themeText transition-all flex-shrink-0 disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-[#0a0a0a] flex items-center gap-2 shrink-0">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Message Assistant..."
                            className="flex-1 bg-[#1a1a1a] border border-black/5 dark:border-white/10 rounded-full pl-5 pr-4 py-3 text-sm text-themeText focus:outline-none focus:border-themeAccent/50 focus:bg-[#222] transition-all placeholder:text-neutral-500 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isTyping}
                            className="w-11 h-11 rounded-full bg-themeAccent flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-themeAccent/20"
                            aria-label="Send Message"
                        >
                            <i className="fa-solid fa-paper-plane text-sm translate-x-[-1px] translate-y-[1px]"></i>
                        </button>
                    </form>
                </div>
            )}
            <style>{`
                @keyframes botMessageFadeIn {
                    0% { opacity: 0; transform: translateY(8px) scale(0.98); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .bot-msg-anim {
                    animation: botMessageFadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
