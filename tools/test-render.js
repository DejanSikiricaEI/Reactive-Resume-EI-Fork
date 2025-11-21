// Test docxtemplater rendering
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const templatePath = path.join(__dirname, '../apps/client/public/templates/docx/template1.docx');
const content = fs.readFileSync(templatePath, 'binary');

const zip = new PizZip(content);
const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

const dummyData = {
  basics: {
    name: "John Doe TEST",
    headline: "Senior Software Engineer TEST",
    email: "john.doe@test.com",
    phone: "+1 234 567 8900",
    location: "San Francisco, CA",
    url_href: "https://johndoe.com"
  },
  summary: {
    content: "This is a test summary."
  },
  experience: {
    items: [
      {
        position: "Senior Developer",
        company: "Test Company",
        location: "Test City",
        date: "2020 - Present",
        summary: "Job description here"
      }
    ]
  },
  education: {
    items: [
      {
        studyType: "Bachelor",
        area: "Computer Science",
        institution: "Test University",
        location: "Test State",
        date: "2014 - 2018",
        summary: "Education description"
      }
    ]
  },
  skills: {
    items: [
      {
        name: "Programming",
        description: "Languages and frameworks",
        keywords: ["JavaScript", "Python"]
      }
    ]
  }
};

console.log("Setting data...");
doc.setData(dummyData);

console.log("Rendering...");
try {
  doc.render();
  console.log("✓ Render successful!");
  
  const output = doc.getZip().generate({ type: 'nodebuffer' });
  const outputPath = path.join(__dirname, '../apps/client/public/templates/docx/test-output.docx');
  fs.writeFileSync(outputPath, output);
  console.log(`✓ Test output saved to: ${outputPath}`);
  
} catch (error) {
  console.error("✗ Render failed:", error);
  if (error.properties) {
    console.error("Error properties:", JSON.stringify(error.properties, null, 2));
  }
}
