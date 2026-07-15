// src/theme.js

// Premium Enterprise Dynamic Theme System
export const theme = {
    layout: {
        appBase: "bg-themeApp text-themeText min-h-screen flex selection:bg-themeAccent/20",
        panel: "bg-themePanel border-theme border-themeBorder rounded-themePanel", 
        panelElevated: "bg-themeElevated border-theme border-themeBorderStrong shadow-themeElevated rounded-themePanel", 
        divider: "border-themeBorder", 
    },

    text: {
        primary: "text-themeText", 
        secondary: "text-themeTextSec", 
        muted: "text-themeTextSec opacity-70", 
        accent: "text-themeAccent",
        heading: "font-serif font-semibold tracking-wide text-themeAccent",
        overline: "text-[10px] font-bold uppercase tracking-widest text-themeTextSec", 
    },

    action: {
        rowBase: "w-full flex items-center gap-3 px-4 py-3 rounded-themeBtn text-xs font-medium transition-colors duration-300",
        rowActive: "bg-themeElevated text-themeAccent border-theme border-themeBorderStrong",
        rowInactive: "text-themeTextSec hover:text-themeText hover:bg-themePanel border-theme border-transparent",

        btnPrimary: "bg-themeAccent text-black font-bold px-6 py-3 rounded-themeBtn hover:bg-themeAccentMuted transition-colors flex items-center justify-center gap-2",
        btnSecondary: "bg-themePanel text-themeText border-theme border-themeBorder hover:border-themeBorderStrong px-6 py-3 rounded-themeBtn transition-colors flex items-center justify-center gap-2",
        btnDanger: "bg-[#1a0f0f] text-rose-500 border-theme border-rose-500/20 hover:border-rose-500 hover:bg-rose-950 px-6 py-3 rounded-themeBtn transition-colors flex items-center justify-center gap-2",
        
        iconBtn: "w-9 h-9 rounded-themeBtn hover:bg-themePanel flex items-center justify-center text-themeTextSec hover:text-themeAccent transition-colors border-theme border-transparent hover:border-themeBorder",
    },

    ui: {
        avatar: "rounded-themeBtn bg-themePanel border-theme border-themeBorder flex items-center justify-center font-bold text-themeAccent font-serif",
        card: "bg-themePanel border-theme border-themeBorder rounded-themePanel p-6",
        logoBox: "w-10 h-10 bg-themeApp border-theme border-themeBorderStrong rounded-themeBtn flex items-center justify-center text-themeAccent shadow-themeElevated",
    }
};