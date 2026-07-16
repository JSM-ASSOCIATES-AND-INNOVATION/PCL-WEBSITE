import re

with open('/Users/JSM/.gemini/antigravity/brain/aaa1e41d-070f-4c3e-99c3-e57c7660c5c8/task.md', 'r') as f:
    content = f.read()

content = content.replace('`[ ]` Update `RootApp.jsx` to remove `<TopNav />` if present', '`[x]` Update `RootApp.jsx` to remove `<TopNav />` if present (Not present)')
content = content.replace('`[/]` Design luxurious dropdowns in `Navbar.jsx`', '`[x]` Design luxurious dropdowns in `Navbar.jsx`')
content = content.replace('`[ ]` Academics (Programs, Faculty, Academic Calendar)', '`[x]` Academics (Programs, Faculty, Academic Calendar)')
content = content.replace('`[ ]` News & Media (including Blogs)', '`[x]` News & Media (including Blogs)')
content = content.replace('`[ ]` Ensure MobileNav remains functional and aligned with new structure', '`[x]` Ensure MobileNav remains functional and aligned with new structure')
content = content.replace('`[ ]` Add premium styling in `theme.css` and `index.css`', '`[x]` Add premium styling in `theme.css` and `index.css`')
content = content.replace('`[ ]` Verify ERP portal and routing are stable', '`[x]` Verify ERP portal and routing are stable')

with open('/Users/JSM/.gemini/antigravity/brain/aaa1e41d-070f-4c3e-99c3-e57c7660c5c8/task.md', 'w') as f:
    f.write(content)
