// Test docxtemplater rendering with custom parser (matching the app behavior)
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const templatePath = path.join(__dirname, '../apps/client/public/templates/docx/template1.docx');
const content = fs.readFileSync(templatePath, 'binary');

const zip = new PizZip(content);

// Use the same parser configuration as the app
const doc = new Docxtemplater(zip, { 
  paragraphLoop: true, 
  linebreaks: true,
  parser: (tag) => {
    // This parser function resolves template expressions
    return {
      get: (scope, context) => {
        // Handle special case: {.} means current value in array iteration
        if (tag === '.') {
          return scope;
        }
        
        // Handle dot notation (e.g., "basics.name")
        const keys = tag.split('.');
        let result = scope;
        for (const key of keys) {
          if (result == null) return undefined;
          result = result[key];
        }
        return result;
      }
    };
  }
});

// Test data matching the user's structure
const testData = {
  basics: {
    name: "Dejan",
    headline: "Simple headline",
    email: "dejan@gg.com",
    phone: "+38765484671",
    location: "Banja Luka",
    url_href: "",
    url_label: ""
  },
  summary: {
    content: "Test summary content"
  },
  experience: {
    items: []
  },
  education: {
    items: []
  },
  skills: {
    items: [
      {
        name: "basic frontend",
        level: 3,
        keywords: ["html", "css", "js"],
        description: ""
      },
      {
        name: "backend python",
        level: 3,
        keywords: ["python"],
        description: ""
      },
      {
        name: "Test",
        level: 5,
        keywords: ["JavaScript", "Node.js", "C#"],
        description: ""
      },
      {
        name: "ds",
        level: 1,
        keywords: ["Ruby", "Blazor", "JavaScript", "Code Coverage"],
        description: "sd"
      }
    ]
  }
};

console.log("Rendering with custom parser...");
try {
  doc.render(testData);
  console.log("✓ Render successful!");
  
  const output = doc.getZip().generate({ type: 'nodebuffer' });
  const outputPath = path.join(__dirname, '../apps/client/public/templates/docx/test-output-with-parser.docx');
  fs.writeFileSync(outputPath, output);
  console.log(`✓ Test output saved to: ${outputPath}`);
  console.log("\nOpen the file to verify that keywords appear correctly (not as 'undefined')");
  
} catch (error) {
  console.error("✗ Render failed:", error);
  if (error.properties) {
    console.error("Error properties:", JSON.stringify(error.properties, null, 2));
  }
}
