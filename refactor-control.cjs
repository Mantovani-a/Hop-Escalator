const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) filelist.push(dirFile);
    }
  });
  return filelist;
};

const jsxFiles = [
  ...walkSync('./src/pages/control'),
  ...walkSync('./src/components/control')
];

let replacements = [
  {
    from: /className="control-page-heading"/g,
    to: 'className="d-flex flex-column flex-sm-row align-items-start align-items-sm-end justify-content-sm-between gap-4 pb-4 border-bottom"'
  },
  {
    from: /className="control-metrics"/g,
    to: 'className="row g-3 mt-4"'
  },
  {
    from: /className="control-overview-grid"/g,
    to: 'className="row g-4 mt-5 align-items-start"'
  },
  {
    from: /className="control-analytics-grid"/g,
    to: 'className="row g-4 mt-5"'
  },
  {
    from: /className="control-technician-grid"/g,
    to: 'className="row g-4"'
  },
  {
    from: /className="control-elevator-grid"/g,
    to: 'className="row g-4"'
  },
  {
    from: /className="control-filter-bar"/g,
    to: 'className="d-flex gap-2 my-4 pb-1 overflow-x-auto"'
  },
  {
    from: /className="control-shift"/g,
    to: 'className="badge bg-white text-secondary border px-3 py-2 fs-6 rounded-pill fw-bold"'
  },
  {
    from: /className="control-empty-note"/g,
    to: 'className="d-flex flex-column gap-1 m-5 p-4 rounded-3 text-muted bg-light text-center"'
  }
];

jsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  
  // Custom replacements for grids to wrap children in cols
  if (content.includes('control-metrics') || originalContent.includes('control-metrics')) {
    // control-metrics mapping
    // Original items inside control-metrics were <MetricCard ... />
    // In ControlOverview.jsx:
    content = content.replace(
      /<MetricCard /g, 
      '<div className="col-12 col-sm-4 col-xl-2"><MetricCard '
    ).replace(
      /<\/MetricCard>/g, 
      '</MetricCard></div>'
    ).replace(
      /<MetricCard ([^>]+)\/>/g, 
      '<div className="col-12 col-sm-4 col-xl-2"><MetricCard $1/></div>'
    );
  }
  
  if (originalContent.includes('control-analytics-grid')) {
     content = content.replace(
      /<article>/g, 
      '<article className="col-12 col-md-6 col-xxl-4 card shadow-sm border-0 p-4">'
    );
  }

  if (originalContent.includes('control-overview-grid')) {
    content = content.replace(
      /<div className="control-map-card">/g,
      '<div className="col-12 col-xl-8"><div className="card shadow-sm border-0 p-4">'
    ).replace(
      /<section className="app-card control-priority-panel"/g,
      '</div></div><div className="col-12 col-xl-4"><section className="card shadow-sm border-0 p-4 overflow-auto" style={{ maxHeight: "650px" }}'
    ).replace(
      /<\/section>(\s*)<\/div>$/m, // closing the grid
      '</section></div></div>$1'
    );
  }
  
  if (originalContent.includes('control-technician-grid')) {
     content = content.replace(
      /<button key=\{technician\.id\} className=\{`control-technician-card/g, 
      '<div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={technician.id}><button className={`control-technician-card'
    ).replace(
      /<\/button>\)/g, 
      '</button></div>)'
    );
  }

  if (originalContent.includes('control-elevator-grid')) {
     content = content.replace(
      /<article key=\{elevator\.id\} className=\{`app-card control-elevator-card/g, 
      '<div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={elevator.id}><article className={`app-card control-elevator-card'
    ).replace(
      /<\/article>\)/g, 
      '</article></div>)'
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log("Done refactoring JSX classes.");
