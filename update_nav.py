import re

with open('src/components/NAVBAR/Navbar.jsx', 'r') as f:
    content = f.read()

# Replace the header structure to combine NoticeBanner seamlessly
new_header = """
    <header style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="combined-nav-wrapper glass-nav">
        <NoticeBanner />
        <nav className="navbar" style={{ position: 'relative', background: 'transparent', borderBottom: 'none' }}>
"""
content = re.sub(r'<header[^>]*>\s*<NoticeBanner />\s*<nav className="navbar glass-nav"[^>]*>', new_header, content)
content = content.replace('</nav>\n    </header>', '</nav>\n      </div>\n    </header>')

# Also, add Blogs to the News & Media dropdown if it's missing (it seems to be there but maybe they want it top level or just formatted better)
# Wait, let's fix the dropdown styling in index.css

with open('src/components/NAVBAR/Navbar.jsx', 'w') as f:
    f.write(content)

with open('src/index.css', 'r') as f:
    css_content = f.read()

# Update mega-menu styling
mega_menu_css = """
.dropdown-menu.mega-menu {
  min-width: 500px;
  width: max-content;
  flex-direction: row;
  justify-content: space-between;
  padding: 24px;
  gap: 40px;
  border-radius: 12px;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
}
.mega-menu-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}
.mega-menu-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--primary-color);
  padding: 0 0 8px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 191, 0, 0.3);
  opacity: 1;
}

.combined-nav-wrapper {
  background: rgba(5, 5, 5, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
"""

# Replace old mega menu CSS
css_content = re.sub(r'\.dropdown-menu\.mega-menu\s*\{[^}]+\}', '', css_content)
css_content = re.sub(r'\.mega-menu-column\s*\{[^}]+\}', '', css_content)
css_content = re.sub(r'\.mega-menu-title\s*\{[^}]+\}', '', css_content)

css_content += mega_menu_css

with open('src/index.css', 'w') as f:
    f.write(css_content)

