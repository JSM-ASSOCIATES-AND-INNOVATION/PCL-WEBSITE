/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../lib/supabase/supabaseClient";

export default function SQLStudio() {
    const [query, setQuery] = useState("SELECT * FROM profiles LIMIT 5;");
    const [results, setResults] = useState(null);
    const [error, setError] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);

    const handleExecute = async () => {
        if (!query.trim()) return;
        setIsExecuting(true);
        setError("");
        setResults(null);
        
        const startTime = performance.now();

        try {
            // Call the secure RPC function created in the Supabase Dashboard
            const { data, error: rpcError } = await supabase.rpc('admin_exec_sql', {
                query_text: query.trim()
            });

            if (rpcError) throw rpcError;

            // Handle the response which should be JSON
            if (data && data.status === "success") {
                // Non-returning query (INSERT, UPDATE, DELETE)
                setResults([{ Message: data.message }]);
            } else if (Array.isArray(data)) {
                // Standard SELECT returning rows
                setResults(data);
            } else {
                setResults([{ Message: "Query executed successfully. (Unknown response format)" }]);
            }
            
        } catch (err) {
            console.error("SQL Execution Error:", err);
            setError(err.message || "An error occurred while executing the query.");
        } finally {
            const endTime = performance.now();
            setExecutionTime((endTime - startTime).toFixed(2));
            setIsExecuting(false);
        }
    };

    const handleKeyDown = (e) => {
        // Cmd+Enter or Ctrl+Enter to execute
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleExecute();
        }
    };

    return (
        <div className="w-full max-w-[1920px] mx-auto animate-fade-in relative selection:bg-emerald-500/30">
            <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)] pb-8">
                
                {/* Header */}
                <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#1c1c1c] border-[length:var(--border-width)] border-emerald-500/20 flex items-center justify-center shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                            <i className="fa-solid fa-terminal text-emerald-400 relative z-10"></i>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-themeText tracking-tight flex items-center gap-2">
                                Supabase SQL Studio
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border-[length:var(--border-width)] border-emerald-500/20">RPC Secured</span>
                            </h2>
                            <p className="text-xs text-themeTextSec font-mono mt-0.5">Direct Database Access Layer</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 border-[length:var(--border-width)] border-themeBorder bg-themeElevated px-4 py-2 rounded-lg">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-themeTextSec uppercase tracking-widest">Connection</span>
                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Studio Area */}
                <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                    
                    {/* Left: Editor */}
                    <div className="flex-1 flex flex-col bg-[#0a0a0a] border-[length:var(--border-width)] border-neutral-800 rounded-themePanel overflow-hidden shadow-2xl relative group">
                        
                        {/* Editor Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b-[length:var(--border-width)] border-neutral-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
                                </div>
                                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest ml-2">query.sql</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-neutral-500 hidden sm:block">Cmd + Enter to Run</span>
                                <button 
                                    onClick={handleExecute} 
                                    disabled={isExecuting}
                                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 text-[10px] px-4 py-1.5 rounded-md font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2 active:scale-95"
                                >
                                    {isExecuting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play"></i>}
                                    Execute
                                </button>
                            </div>
                        </div>

                        {/* Textarea */}
                        <div className="flex-1 relative">
                            {/* Line numbers dummy (visual only) */}
                            <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#0d0d0d] border-r-[length:var(--border-width)] border-neutral-800/50 flex flex-col items-center py-4 text-[11px] font-mono text-neutral-600 select-none pointer-events-none">
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                            </div>
                            <textarea 
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                spellCheck={false}
                                className="w-full h-full bg-transparent text-[#d4d4d4] font-mono text-sm p-4 pl-14 focus:outline-none resize-none leading-relaxed selection:bg-emerald-500/30"
                                placeholder="SELECT * FROM profiles;"
                            ></textarea>
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="flex-1 flex flex-col bg-[#111] border-[length:var(--border-width)] border-neutral-800 rounded-themePanel overflow-hidden shadow-2xl relative">
                        
                        {/* Results Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b-[length:var(--border-width)] border-neutral-800 shrink-0">
                            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-table text-neutral-500"></i>
                                Results output
                            </span>
                            {results && !error && (
                                <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border-[length:var(--border-width)] border-emerald-500/20">
                                    {results.length} row{results.length !== 1 ? 's' : ''} • {executionTime}ms
                                </span>
                            )}
                        </div>

                        {/* Results Body */}
                        <div className="flex-1 overflow-auto p-4 custom-scrollbar relative">
                            {error ? (
                                <div className="bg-rose-500/10 border-[length:var(--border-width)] border-rose-500/30 rounded-lg p-4 text-rose-400 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner">
                                    <div className="flex items-center gap-2 mb-2 font-black text-rose-500">
                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                        Execution Error
                                    </div>
                                    {error}
                                </div>
                            ) : results ? (
                                results.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                                        <i className="fa-solid fa-check-circle text-3xl mb-3 text-emerald-500/50"></i>
                                        <span className="font-mono text-xs">Query executed successfully (0 rows)</span>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded border-[length:var(--border-width)] border-neutral-800">
                                        <table className="w-full text-left border-collapse text-xs font-mono whitespace-nowrap">
                                            <thead>
                                                <tr className="bg-[#0a0a0a] border-b-[length:var(--border-width)] border-neutral-800">
                                                    {Object.keys(results[0]).map((key, i) => (
                                                        <th key={i} className="py-2.5 px-4 text-[#9cdcfe] font-semibold sticky top-0 bg-[#0a0a0a]">{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.map((row, i) => (
                                                    <tr key={i} className="border-b-[length:var(--border-width)] border-neutral-800/50 hover:bg-[#1a1a1a] transition-colors">
                                                        {Object.values(row).map((val, j) => (
                                                            <td key={j} className="py-2 px-4 text-[#ce9178]">
                                                                {val === null ? <span className="text-[#569cd6] italic">null</span> : 
                                                                 typeof val === 'boolean' ? <span className="text-[#569cd6]">{String(val)}</span> :
                                                                 typeof val === 'number' ? <span className="text-[#b5cea8]">{val}</span> :
                                                                 typeof val === 'object' ? <span className="text-[#d16969]">{JSON.stringify(val)}</span> : 
                                                                 String(val)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600 select-none">
                                    <i className="fa-solid fa-code text-4xl mb-4 opacity-30"></i>
                                    <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">Awaiting Execution</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
