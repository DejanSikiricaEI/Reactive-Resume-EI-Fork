// Script to create a basic DOCX template with placeholders
// Run with: node tools/create-template.js

const fs = require('fs');
const path = require('path');

// Create a minimal valid DOCX structure
const createMinimalDocx = () => {
  const PizZip = require('pizzip');
  const Docxtemplater = require('docxtemplater');

  // Create a basic DOCX structure
  const zip = new PizZip();

  // Add required files for a valid DOCX
  
  // [Content_Types].xml
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  // _rels/.rels
  zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  // word/_rels/document.xml.rels
  zip.folder('word').folder('_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  // word/document.xml with template placeholders
  // Important: Keep placeholders in single <w:t> tags for docxtemplater to work
  zip.folder('word').file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
        <w:t xml:space="preserve">{basics.name}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:sz w:val="24"/></w:rPr>
        <w:t xml:space="preserve">{basics.headline}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">Email: {basics.email} | Phone: {basics.phone}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">Location: {basics.location}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{#basics.url_href}Website: {basics.url_href}{/basics.url_href}</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
        <w:t xml:space="preserve">SUMMARY</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{summary.content}</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
        <w:t xml:space="preserve">EXPERIENCE</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{#experience.items}{position} at {company}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{location} | {date}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{summary}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{/experience.items}</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
        <w:t xml:space="preserve">EDUCATION</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{#education.items}{studyType} in {area}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{institution}, {location} | {date}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{summary}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{/education.items}</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
        <w:t xml:space="preserve">SKILLS</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{#skills.items}{name}{#description} - {description}{/description}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">Technologies: {#keywords}{.}, {/keywords}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t xml:space="preserve">{/skills.items}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`);

  return zip.generate({ type: 'nodebuffer' });
};

// Generate and save templates
try {
  const templateNames = ['template1', 'template2', 'template3', 'template4', 'template5'];
  
  for (const templateName of templateNames) {
    const docxBuffer = createMinimalDocx();
    const templatePath = path.join(__dirname, `../apps/client/public/templates/docx/${templateName}.docx`);
    
    fs.writeFileSync(templatePath, docxBuffer);
    console.log(`✓ Created ${templateName}.docx (${docxBuffer.length} bytes)`);
  }
  
} catch (error) {
  console.error('Error creating template:', error);
  process.exit(1);
}
