const fs = require('fs');

const files = [
  "src/erp/components/Admin/AdminAdmissions/AdminAdmissions.jsx",
  "src/erp/components/Admin/AdminDashboard/SQLStudio.jsx",
  "src/erp/components/Admin/AdminDashboard/InfrastructureModal.jsx",
  "src/erp/components/Admin/AdminFacultyDirectory/AdminFacultyDirectory.jsx",
  "src/erp/components/Admin/AdminHelpdesk/AdminHelpdesk.jsx",
  "src/erp/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx",
  "src/erp/components/notices/EventsBoard.jsx"
];

const replacements = [
  { from: /bg-zinc-900/g, to: "bg-themeApp" },
  { from: /bg-zinc-950/g, to: "bg-themeApp" },
  { from: /bg-black\/50/g, to: "bg-themeApp/50" },
  { from: /bg-black\/80/g, to: "bg-themeApp/80" },
  { from: /bg-zinc-800\/50/g, to: "bg-themeElevated/50" },
  { from: /bg-zinc-800/g, to: "bg-themeElevated" },
  { from: /bg-zinc-700/g, to: "bg-themeElevated hover:bg-themeBorder" },
  { from: /border-zinc-800/g, to: "border-theme border-themeBorder" },
  { from: /border-zinc-700/g, to: "border-theme border-themeBorderStrong" },
  { from: /text-zinc-400/g, to: "text-themeTextSec" },
  { from: /text-zinc-500/g, to: "text-themeTextSec opacity-80" },
  { from: /text-zinc-300/g, to: "text-themeText" },
  { from: /text-white/g, to: "text-themeText" }
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Upgraded theme in: ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
