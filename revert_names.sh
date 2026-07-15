#!/bin/bash

# Function to safely rename a directory changing only its case
function rename_case {
    old_name=$1
    new_name=$2
    if [ -d "$old_name" ]; then
        git mv "$old_name" "${old_name}_temp"
        git mv "${old_name}_temp" "$new_name"
        echo "Renamed $old_name -> $new_name"
    fi
}

# Base directories
rename_case "src/COMPONENTS" "src/components"
rename_case "src/PAGES" "src/pages"
rename_case "src/STYLES" "src/styles"
rename_case "src/ERP" "src/erp"
rename_case "src/LIB" "src/lib"
rename_case "src/SCRIPTS" "src/scripts"

# UI Subdirectories
rename_case "src/components/UI/FOOTER" "src/components/UI/Footer"
rename_case "src/components/UI/PRELOADER" "src/components/UI/Preloader"
rename_case "src/components/UI/BEAMS" "src/components/UI/Beams"

# NAVBAR Subdirectories
rename_case "src/components/NAVBAR/APPLYNOW" "src/components/NAVBAR/ApplyNow"
rename_case "src/components/NAVBAR/CONTACT" "src/components/NAVBAR/Contact"
rename_case "src/components/NAVBAR/EVENTS" "src/components/NAVBAR/Events"
rename_case "src/components/NAVBAR/MOBILEMENU" "src/components/NAVBAR/MobileMenu"
rename_case "src/components/NAVBAR/CAMPUS/GALLERY" "src/components/NAVBAR/CAMPUS/Gallery"
rename_case "src/components/NAVBAR/ABOUT/LEADERSHIPPROFILE" "src/components/NAVBAR/ABOUT/LeadershipProfile"

# Also rename the components that were weirdly capitalized:
if [ -f "src/components/NAVBAR/ApplyNow/APPLYNOW.jsx" ]; then
    git mv src/components/NAVBAR/ApplyNow/APPLYNOW.jsx src/components/NAVBAR/ApplyNow/ApplyNow.jsx
fi
if [ -f "src/components/NAVBAR/Contact/CONTACT.jsx" ]; then
    git mv src/components/NAVBAR/Contact/CONTACT.jsx src/components/NAVBAR/Contact/Contact.jsx
fi
if [ -f "src/components/NAVBAR/ABOUT/LeadershipProfile/LEADERSHIPPROFILE.jsx" ]; then
    git mv src/components/NAVBAR/ABOUT/LeadershipProfile/LEADERSHIPPROFILE.jsx src/components/NAVBAR/ABOUT/LeadershipProfile/LeadershipProfile.jsx
fi
if [ -f "src/components/NAVBAR/ABOUT/FACULTY.jsx" ]; then
    git mv src/components/NAVBAR/ABOUT/FACULTY.jsx src/components/NAVBAR/ABOUT/Faculty.jsx
fi
if [ -f "src/components/NAVBAR/CAMPUS/FACILITIES/FACILITIES.jsx" ]; then
    git mv src/components/NAVBAR/CAMPUS/FACILITIES/FACILITIES.jsx src/components/NAVBAR/CAMPUS/FACILITIES/Facilities.jsx
fi
if [ -f "src/components/NAVBAR/CAMPUS/Gallery/GALLERY.jsx" ]; then
    git mv src/components/NAVBAR/CAMPUS/Gallery/GALLERY.jsx src/components/NAVBAR/CAMPUS/Gallery/Gallery.jsx
fi
if [ -f "src/components/NAVBAR/MobileMenu/MOBILEMENU.jsx" ]; then
    git mv src/components/NAVBAR/MobileMenu/MOBILEMENU.jsx src/components/NAVBAR/MobileMenu/MobileMenu.jsx
fi
if [ -f "src/components/UI/Footer/FOOTER.jsx" ]; then
    git mv src/components/UI/Footer/FOOTER.jsx src/components/UI/Footer/Footer.jsx
fi

echo "Done renaming!"
