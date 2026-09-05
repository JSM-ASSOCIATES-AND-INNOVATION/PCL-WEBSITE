/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { registerDialogContainer } from "../../utils/DialogManager";
import { motion, AnimatePresence } from "framer-motion";

export default function DialogContainer() {
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        type: 'alert', // 'alert' | 'confirm'
        title: '',
        message: '',
        onConfirm: () => {},
        onCancel: () => {},
    });

    useEffect(() => {
        registerDialogContainer(setDialogState);
    }, []);

    const isConfirm = dialogState.type === 'confirm';

    return (
        <AnimatePresence>
            {dialogState.isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                >
                    {/* Dark Blurred Overlay */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-[20px]"
                        onClick={isConfirm ? dialogState.onCancel : dialogState.onConfirm}
                    />
                    
                    {/* Modal Content */}
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="relative w-full max-w-sm bg-black/5 dark:bg-white/10 backdrop-blur-[80px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Edge Specular */}
                        {/* Header */}
                        <div className="p-6 pb-4 flex flex-col items-center gap-4 text-center">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1, stiffness: 400, damping: 25 }}
                                className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${isConfirm ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'}`}
                            >
                                <i className={`fa-solid text-xl ${isConfirm ? 'fa-circle-question' : 'fa-check'}`}></i>
                            </motion.div>
                            <h3 className="font-black tracking-widest uppercase text-white text-lg drop-shadow-sm dark:drop-shadow-md">
                                {dialogState.title}
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="px-8 pb-8 text-center relative z-10">
                            <p className="text-white/70 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                {dialogState.message}
                            </p>
                        </div>

                        {/* Footer Controls */}
                        <div className="p-4 bg-black/20 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row gap-3 relative z-10">
                            {isConfirm && (
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={dialogState.onCancel}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/80 border border-black/5 dark:border-white/10 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-colors"
                                >
                                    Cancel
                                </motion.button>
                            )}
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={dialogState.onConfirm}
                                className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors shadow-lg ${isConfirm ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30'}`}
                            >
                                {isConfirm ? ((dialogState.title?.toLowerCase() || "").includes("sign out") || (dialogState.title?.toLowerCase() || "").includes("session") ? "Sign Out" : "Confirm") : "Understood"}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
