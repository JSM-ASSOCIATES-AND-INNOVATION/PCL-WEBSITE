import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERP } from '../../context/ErpContext';
import { supabase } from '../../LIB/supabase/supabaseClient';

export default function IntelligentBot() {
    const { userSession } = useERP();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting based on role
    useEffect(() => {
        if (userSession) {
            if (userSession.role === 'admin') {
                setMessages([{ id: '1', sender: 'bot', text: 'Admin Command Mode Active. You can type commands like "suspend student [ID]", "draft notice", or "add seats".' }]);
            } else {
                setMessages([{ id: '1', sender: 'bot', text: 'Hello! I am your Intelligent ERP Assistant. How can I help you today?' }]);
            }
        }
    }, [userSession]);

    // Auto-scroll to the latest message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Return null entirely so it doesn't crash on the login screen
    if (!userSession) return null;

    // NLP Keyword Arrays
    const scheduleKeywords = ['class', 'sched', 'time', 'table', 'nxt', 'clss', 'timetable'];
    const syllabusKeywords = ['syllabus', 'material', 'notes', 'pdf', 'book', 'reading'];
    const urgentKeywords = ['harass', 'urgent', 'critical', 'emergency', 'broken'];
    const examKeywords = ['exam', 'test', 'assessment'];

    // NLP Fuzzy Matching
    const matchKeywords = (text, keywords) => {
        const lowerText = text.toLowerCase();
        return keywords.some(kw => lowerText.includes(kw));
    };

    // Performance: Fetch Data with Promise.all and sessionStorage caching
    const fetchBotData = async () => {
        const cacheKey = 'erp_bot_data_cache';
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        try {
            const [scheduleRes, materialsRes] = await Promise.all([
                supabase.from('batch_courses').select('*').limit(3),
                supabase.from('course_materials').select('*').limit(3)
            ]);

            const data = {
                schedule: scheduleRes.data || [],
                materials: materialsRes.data || []
            };

            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error("Error fetching bot data:", error);
            return { schedule: [], materials: [] };
        }
    };

    // Auto-Escalation
    const handleEscalation = async (userMsg) => {
        try {
            await supabase.from('helpdesk_tickets').insert([{
                subject: '[AI ESCALATION] Urgent Request',
                description: userMsg,
                priority: 'High'
            }]);
        } catch (err) {
            console.error('Escalation failed:', err);
        }
    };

    const handleAdminCommands = (text) => {
        const lowerText = text.toLowerCase();
        
        // Example 1: Suspend / Disciplinary
        if (lowerText.includes('suspend') || lowerText.includes('disciplinary')) {
            setTimeout(() => {
                setIsOpen(false);
                navigate('/admin/users'); 
            }, 1200);
            return "Navigating to Identity & Access Management for disciplinary actions...";
        }

        // Example 2: Draft Notice
        if (lowerText.includes('draft notice') || lowerText.includes('new notice')) {
            setTimeout(() => {
                setIsOpen(false);
                navigate('/admin/notices');
            }, 1200);
            return "Opening the Broadcast Center to draft a new notice...";
        }

        // Example 3: Add Seats
        if (lowerText.includes('add seats') || lowerText.includes('increase capacity')) {
            setTimeout(() => {
                setIsOpen(false);
                navigate('/admin/curriculum'); 
            }, 1200);
            return "Navigating to Master Timetable Builder to manage batch capacities. (Mock SQL trigger execution logged).";
        }

        return null; 
    };

    const processMessage = (textToShow, textToProcess = textToShow) => {
        if (!textToShow.trim()) return;

        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: textToShow }]);
        setIsTyping(true);

        // Simulate processing time
        setTimeout(async () => {
            let botReply = null;

            // Check Admin commands first if role is admin
            if (userSession?.role === 'admin') {
                botReply = handleAdminCommands(textToProcess);
            }

            if (!botReply) {
                if (matchKeywords(textToProcess, urgentKeywords) || textToProcess === '🚨 Help!') {
                    await handleEscalation(textToProcess);
                    botReply = "Your request has been escalated. An admin has been notified immediately.";
                } else if (matchKeywords(textToProcess, examKeywords)) {
                    botReply = "You can check your detailed examination schedule and admit card in the 'Examinations' portal.";
                } else if (matchKeywords(textToProcess, scheduleKeywords)) {
                    const data = await fetchBotData();
                    if (data.schedule && data.schedule.length > 0) {
                        botReply = "Here is your upcoming schedule:\n" + data.schedule.map(s => `- ${s.course_name || s.name || s.title || 'Class'} at ${s.scheduled_time || s.start_time || s.time || 'TBA'}`).join('\n');
                    } else {
                        botReply = "You don't have any upcoming classes scheduled at the moment.";
                    }
                } else if (matchKeywords(textToProcess, syllabusKeywords)) {
                    const data = await fetchBotData();
                    if (data.materials && data.materials.length > 0) {
                        botReply = "Here are your latest course materials:\n" + data.materials.map(m => `- ${m.title || m.name || m.file_name || 'Document'}`).join('\n');
                    } else {
                        botReply = "No recent course materials found in your profile.";
                    }
                } else if (matchKeywords(textToProcess, ['hi', 'hello', 'hey', 'help'])) {
                    if (userSession?.role === 'admin') {
                        botReply = "Hello! I am the Admin Command Parser. I can execute commands like 'draft notice' or 'suspend student'.";
                    } else {
                        botReply = "Hello! I am the ERP Assistant. I can help you with your schedule, course materials, or escalate urgent issues.";
                    }
                } else {
                    if (userSession?.role === 'admin') {
                        botReply = "Command not recognized. Try 'draft notice', 'suspend [student]', or 'add seats'.";
                    } else {
                        botReply = "I'm not quite sure about that. I can check your schedule, find course materials, or help with urgent issues. Could you rephrase?";
                    }
                }
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: botReply }]);
            setIsTyping(false);
        }, 800);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const userMsg = inputText;
        setInputText('');
        processMessage(userMsg);
    };

    const handleChipClick = (chipText) => {
        if (isTyping) return;
        processMessage(chipText);
    };

    return (
        <div className="fixed lg:bottom-6 right-6 z-[9999]" style={{ bottom: window.innerWidth < 1024 ? '7rem' : '' }}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-themePanel border-2 border-themeBorder shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform relative group"
                    aria-label="Open Assistant"
                >
                    <i className="fa-solid fa-landmark text-themeAccent text-xl"></i>
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-themePanel rounded-full animate-pulse"></span>
                </button>
            ) : (
                <div className="w-80 h-[500px] bg-themePanel border border-themeBorder shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                    {/* Header */}
                    <div className="bg-themePanel border-b border-themeBorder p-4 flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-themeAccent/10 flex items-center justify-center">
                                    <i className="fa-solid fa-robot text-themeAccent"></i>
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-themePanel rounded-full animate-pulse"></span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-themeText text-sm">
                                    {userSession?.role === 'admin' ? 'Admin Bot' : 'ERP Assistant'}
                                </h3>
                                <p className="text-[10px] text-green-500 font-medium">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-themeText/60 hover:text-themeText transition-colors"
                            aria-label="Close Assistant"
                        >
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    {/* Messages Area - Dark backdrop inside */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 backdrop-blur-sm bg-black/80 flex flex-col">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`max-w-[85%] p-3 text-sm flex flex-col shadow-sm ${
                                    msg.sender === 'user'
                                        ? 'bg-themeAccent text-white self-end rounded-2xl rounded-tr-sm'
                                        : 'bg-themePanel border border-themeBorder text-themeText self-start rounded-2xl rounded-tl-sm bot-msg-anim'
                                }`}
                            >
                                <span className="whitespace-pre-line leading-relaxed">{msg.text}</span>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="bg-themePanel border border-themeBorder text-themeText self-start rounded-2xl rounded-tl-sm p-3 max-w-[85%] bot-msg-anim flex gap-1.5 items-center shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-themeText/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-themeText/40 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-themeText/40 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Preset Chips Area */}
                    <div className="bg-themePanel border-t border-themeBorder px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-shrink-0 z-10">
                        {userSession?.role === 'admin' ? (
                            [
                                'Draft Notice',
                                'Suspend ID',
                                'Add Seats',
                                'Help!'
                            ].map((chip, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleChipClick(chip)}
                                    disabled={isTyping}
                                    className="whitespace-nowrap px-3 py-1.5 rounded-full border border-themeBorder bg-themePanel hover:bg-themeAccent/10 text-xs text-themeText transition-colors flex-shrink-0 disabled:opacity-50 cursor-pointer"
                                >
                                    {chip}
                                </button>
                            ))
                        ) : (
                            [
                                '🗓️ Next Class?',
                                '📚 Syllabus?',
                                '📝 Exams?',
                                '🚨 Help!'
                            ].map((chip, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleChipClick(chip)}
                                    disabled={isTyping}
                                    className="whitespace-nowrap px-3 py-1.5 rounded-full border border-themeBorder bg-themePanel hover:bg-themeAccent/10 text-xs text-themeText transition-colors flex-shrink-0 disabled:opacity-50 cursor-pointer"
                                >
                                    {chip}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="border-t border-themeBorder p-3 bg-themePanel flex items-center gap-2 z-10 flex-shrink-0">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-transparent border border-themeBorder rounded-full px-4 py-2 text-sm text-themeText focus:outline-none focus:border-themeAccent transition-colors placeholder:text-themeText/40"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isTyping}
                            className="w-10 h-10 rounded-full bg-themeAccent flex items-center justify-center text-white cursor-pointer hover:bg-themeAccent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            aria-label="Send Message"
                        >
                            <i className="fa-solid fa-paper-plane text-sm"></i>
                        </button>
                    </form>
                </div>
            )}
            <style>{`
                @keyframes botMessageFadeIn {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .bot-msg-anim {
                    animation: botMessageFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
