import os

replacements = {
    'COMPONENTS': 'components',
    'PAGES': 'pages',
    'STYLES': 'styles',
    'ERP': 'erp',
    'LIB': 'lib',
    'SCRIPTS': 'scripts',
    'components/UI/FOOTER/FOOTER': 'components/UI/Footer/Footer',
    'components/UI/PRELOADER/Preloader': 'components/UI/Preloader/Preloader',
    'components/UI/BEAMS/Beams': 'components/UI/Beams/Beams',
    'components/NAVBAR/APPLYNOW/APPLYNOW': 'components/NAVBAR/ApplyNow/ApplyNow',
    'components/NAVBAR/CONTACT/CONTACT': 'components/NAVBAR/Contact/Contact',
    'components/NAVBAR/EVENTS/EventsPage': 'components/NAVBAR/Events/EventsPage',
    'components/NAVBAR/MOBILEMENU/MobileMenu': 'components/NAVBAR/MobileMenu/MobileMenu',
    'components/NAVBAR/CAMPUS/GALLERY/GALLERY': 'components/NAVBAR/CAMPUS/Gallery/Gallery',
    'components/NAVBAR/ABOUT/LEADERSHIPPROFILE/LEADERSHIPPROFILE': 'components/NAVBAR/ABOUT/LeadershipProfile/LeadershipProfile',
    'components/NAVBAR/ABOUT/FACULTY': 'components/NAVBAR/ABOUT/Faculty',
    'components/NAVBAR/CAMPUS/FACILITIES/FACILITIES': 'components/NAVBAR/CAMPUS/FACILITIES/Facilities'
}

files_to_fix = [
    'src/App.jsx',
    'src/components/NAVBAR/Navbar.jsx',
    'src/erp/ErpApp.jsx',
    'src/RootApp.jsx',
    'src/main.jsx'
]

for file_path in files_to_fix:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed imports in App.jsx, Navbar.jsx, ErpApp.jsx, RootApp.jsx, and main.jsx")
