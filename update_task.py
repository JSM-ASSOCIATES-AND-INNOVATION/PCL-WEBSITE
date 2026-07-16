import re

with open('/Users/JSM/.gemini/antigravity/brain/aaa1e41d-070f-4c3e-99c3-e57c7660c5c8/task.md', 'r') as f:
    content = f.read()

content = content.replace('`[/]` Combine TopNav and Navbar in `Navbar.jsx`', '`[x]` Combine TopNav and Navbar in `Navbar.jsx`')
content = content.replace('`[ ]` Design luxurious dropdowns in `Navbar.jsx`', '`[/]` Design luxurious dropdowns in `Navbar.jsx`')
content = content.replace('`[ ]` Discover PCL (Two-sided: About/Affiliation vs Careers/Contact)', '`[x]` Discover PCL (Two-sided: About/Affiliation vs Careers/Contact)')

with open('/Users/JSM/.gemini/antigravity/brain/aaa1e41d-070f-4c3e-99c3-e57c7660c5c8/task.md', 'w') as f:
    f.write(content)
