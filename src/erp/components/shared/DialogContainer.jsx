import React, { useState, useEffect } from "react";
import { registerDialogContainer } from "../../utils/DialogManager";
import { theme } from "../../theme";

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
        // Register this component's state setter with the global DialogManager
        registerDialogContainer(setDialogState);
    }, []);

    if (!dialogState.isOpen) return null;

    const isConfirm = dialogState.type === 'confirm';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-sm ${theme.layout.panelElevated} overflow-hidden animate-in zoom-in-95 duration-200`}>
                {/* Header */}
                <div className={`p-4 border-b ${theme.layout.divider} bg-themePanel/50 flex items-center gap-3`}>
                    <div className="w-8 h-8 rounded-full bg-themeElevated border-2 border-themeBorder flex items-center justify-center shrink-0">
                        <i className={`fa-solid ${isConfirm ? 'fa-circle-question text-amber-500' : 'fa-bell text-themeAccent'} text-sm`}></i>
                    </div>
                    <h3 className={`font-black tracking-widest uppercase ${theme.text.primary} text-sm`}>
                        {dialogState.title}
                    </h3>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className={`${theme.text.secondary} text-sm font-medium leading-relaxed whitespace-pre-wrap`}>
                        {dialogState.message}
                    </p>
                </div>

                {/* Footer Controls */}
                <div className={`p-4 bg-themePanel/50 border-t ${theme.layout.divider} flex flex-col sm:flex-row gap-3`}>
                    {isConfirm && (
                        <button 
                            onClick={dialogState.onCancel}
                            className={`flex-1 ${theme.action.btnSecondary} text-xs uppercase tracking-widest`}
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        onClick={dialogState.onConfirm}
                        className={`flex-1 ${theme.action.btnPrimary} text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                    >
                        {isConfirm ? "Confirm" : "Understood"}
                    </button>
                </div>
            </div>
        </div>
    );
}
