// Test script to verify template content
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const templatePath = path.join(__dirname, '../apps/client/public/templates/docx/template1.docx');
const content = fs.readFileSync(templatePath, 'binary');

const zip = new PizZip(content);
const documentXml = zip.file('word/document.xml').asText();

console.log('Template document.xml content:');
console.log('=====================================');
console.log(documentXml);
console.log('=====================================');

// Check for placeholders
const placeholders = documentXml.match(/\{[^}]+\}/g);
console.log('\nFound placeholders:', placeholders);
