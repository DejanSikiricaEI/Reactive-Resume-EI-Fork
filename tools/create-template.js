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
  zip.folder('word').file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="32"/>
        </w:rPr>
        <w:t>{basics.name}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:sz w:val="24"/>
        </w:rPr>
        <w:t>{basics.headline}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Email: {basics.email} | Phone: {basics.phone}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Location: {basics.location} | Website: {basics.url.href}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="28"/>
        </w:rPr>
        <w:t>SUMMARY</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{summary.content}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="28"/>
        </w:rPr>
        <w:t>EXPERIENCE</w:t>
      </w:r>
    </w:p>
    <w:p w:rsidR="00000000" w:rsidRDefault="00000000">
      <w:r>
        <w:t>{#experience.items}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>{position} at {company}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{location} | {date}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{summary}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{/experience.items}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="28"/>
        </w:rPr>
        <w:t>EDUCATION</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{#education.items}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>{studyType} in {area}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{institution}, {location} | {date}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{summary}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{/education.items}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="28"/>
        </w:rPr>
        <w:t>SKILLS</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{#skills.items}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>{name}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{description}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Technologies: {#keywords}{.}, {/keywords}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{/skills.items}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`);

  return zip.generate({ type: 'nodebuffer' });
};

// Generate and save the template
try {
  const docxBuffer = createMinimalDocx();
  const templatePath = path.join(__dirname, '../apps/client/public/templates/docx/template1.docx');
  
  fs.writeFileSync(templatePath, docxBuffer);
  console.log(`✓ Created template1.docx (${docxBuffer.length} bytes)`);
  console.log(`  Location: ${templatePath}`);
  
} catch (error) {
  console.error('Error creating template:', error);
  process.exit(1);
}
