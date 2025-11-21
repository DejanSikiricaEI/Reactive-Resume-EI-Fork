# DOCX Template Variable Guide

This guide explains how to use template variables in your Word (.docx) templates for exporting resumes.

## Template Engine

The templates use **Docxtemplater** which processes placeholders in the format `{variableName}`.

## Available Data Structure

When a resume is exported, the following data is made available to the template:

### Basic Information (`basics`)
- `{basics.name}` - Full name
- `{basics.headline}` - Professional headline/title
- `{basics.email}` - Email address
- `{basics.phone}` - Phone number
- `{basics.location}` - Location/address
- `{basics.url}` - Personal website URL
- `{basics.customFields}` - Array of custom fields

### Sections

Each section is available both as `{sections.sectionName}` and directly as `{sectionName}` for convenience.

#### Summary
- `{summary.content}` - Resume summary/objective text

#### Experience
```
{#experience.items}
  {company} - {position}
  {location}
  {date}
  {summary}
{/experience.items}
```

#### Education
```
{#education.items}
  {institution} - {area} ({studyType})
  {location}
  {date}
  {score}
  {summary}
{/education.items}
```

#### Skills
```
{#skills.items}
  {name} - Level: {level}
  {description}
  Keywords: {#keywords}{.}{/keywords}
{/skills.items}
```

#### Projects
```
{#projects.items}
  {name}
  {description}
  {date}
  {url}
  {summary}
  Keywords: {#keywords}{.}{/keywords}
{/projects.items}
```

#### Certifications
```
{#certifications.items}
  {name}
  {issuer}
  {date}
  {url}
  {summary}
{/certifications.items}
```

#### Languages
```
{#languages.items}
  {name} - {level}
  {description}
{/languages.items}
```

#### Awards
```
{#awards.items}
  {title}
  {awarder}
  {date}
  {url}
  {summary}
{/awards.items}
```

#### Publications
```
{#publications.items}
  {name}
  {publisher}
  {date}
  {url}
  {summary}
{/publications.items}
```

#### Volunteer Experience
```
{#volunteer.items}
  {organization} - {position}
  {location}
  {date}
  {url}
  {summary}
{/volunteer.items}
```

#### References
```
{#references.items}
  {name}
  {description}
  {url}
  {summary}
{/references.items}
```

#### Interests
```
{#interests.items}
  {name}
  Keywords: {#keywords}{.}{/keywords}
{/interests.items}
```

#### Profiles (Social Media)
```
{#profiles.items}
  {network}: {username}
  {url}
{/profiles.items}
```

## Loop Syntax

To iterate over arrays (like experience, education, skills):

```
{#arrayName}
  Content here can use variables from the array item
  {itemProperty}
{/arrayName}
```

## Conditional Display

```
{#variableName}
  This content only shows if variableName exists and is truthy
{/variableName}
```

## Example: Complete Resume Template

Here's a simple example structure for template1.docx:

```
{basics.name}
{basics.headline}

Contact:
Email: {basics.email}
Phone: {basics.phone}
Location: {basics.location}
Website: {basics.url}

SUMMARY
{summary.content}

EXPERIENCE
{#experience.items}
{position} at {company}
{location} | {date}
{summary}

{/experience.items}

EDUCATION
{#education.items}
{studyType} in {area}
{institution}, {location}
{date}
{summary}

{/education.items}

SKILLS
{#skills.items}
{name} - {level}
{description}
Technologies: {#keywords}{.}, {/keywords}

{/skills.items}
```

## Tips

1. **Formatting**: Word formatting (bold, italic, colors, fonts) will be preserved
2. **Line breaks**: Use Shift+Enter for line breaks within paragraphs
3. **Testing**: Export a resume and check the generated DOCX. Debug JSON can be downloaded during export to see exact data structure
4. **Arrays**: Remember to close loops with the proper closing tag (e.g., `{/experience.items}`)
5. **Safety**: If a variable doesn't exist, it will be replaced with an empty string

## Current Implementation

The DOCX export feature in `apps/client/src/components/hr/resume-list.tsx`:
- Loads `template1.docx` from `/templates/docx/` folder
- Merges resume data with the template
- Downloads the processed document
- Falls back to JSON export if any errors occur

## Modifying Templates

1. Open `template1.docx` in Microsoft Word
2. Use the variable syntax above (e.g., `{basics.name}`)
3. Save the file back to `apps/client/public/templates/docx/template1.docx`
4. Test by exporting a resume from the HR interface
