import React from 'react';
import { theme } from '../../../theme';

export default function PageHeader({ icon, title, subtitle, rightContent, isEmbedded = false }) {
    return (
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${!isEmbedded ? theme.layout.panelElevated + " p-6 lg:p-8 rounded-[2rem]" : ""}`}>
            {!isEmbedded && (
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeApp/80 backdrop-blur-md border border-themeBorderStrong rounded-[2rem] flex items-center justify-center text-themeAccent text-2xl lg:text-3xl shrink-0 shadow-sm">
                            <i className={icon}></i>
                        </div>
                    )}
                    <div>
                        <h1 className="font-sans font-black text-2xl lg:text-3xl text-themeText mb-1 tracking-tight">
                            {title}
                        </h1>
                        <p className="text-themeTextSec text-xs lg:text-sm font-medium">
                            {subtitle}
                        </p>
                    </div>
                </div>
            )}
            
            {rightContent && (
                <div className="w-full md:w-auto">
                    {rightContent}
                </div>
            )}
        </div>
    );
}
