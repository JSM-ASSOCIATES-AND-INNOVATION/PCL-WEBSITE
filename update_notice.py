import re

with open('src/components/UI/NoticeBanner.jsx', 'r') as f:
    content = f.read()

# Change bg-red-700 to a transparent or subtle glass style
content = content.replace('className="bg-red-700 text-white overflow-hidden relative z-50 shadow-none border-b border-red-800"', 'className="text-white overflow-hidden relative z-50 shadow-none border-b border-white/10" style={{ background: "rgba(0,0,0,0.2)" }}')

# Change the "Announcements" badge to something more premium
content = content.replace('bg-red-800', 'bg-[var(--primary-color)] text-black')
content = content.replace('text-red-200', 'text-[var(--primary-color)] opacity-70')
content = content.replace('text-red-700', 'text-black')

with open('src/components/UI/NoticeBanner.jsx', 'w') as f:
    f.write(content)
