# Candidate Evaluation & Screening Workflows

## Workflow Execution Steps

1. **Document Loading:** Parse target CV format (PDF, DOCX, TXT) and target Vacancy JSON.
2. **Text Normalization:** Standardize formatting, lowercase, and tokenize elements.
3. **Ontology Mapping:** Identify synonyms (e.g. `React.js`, `ReactJS`, `React` -> `React`).
4. **Scoring Model:**
   - **Hard Skills (60% weight):** Matches required tech stack.
   - **Experience Duration (25% weight):** Matches required seniority.
   - **Domain / Soft Skills (15% weight):** Sector alignment (e.g. Fintech, E-commerce).
5. **Report Generation:** Create a JSON structure summarizing the evaluation findings.

## Validation Thresholds

- **Score >= 80%:** Automatically flag as **"Recommended for Outreach"**.
- **60% - 79%:** Flag as **"Needs Review / Alternative Role"**.
- **< 60%:** Flag as **"Rejected"**.

## Gap Detection Rules

- Identify gaps in employment history exceeding 6 months.
- Identify discrepancies between CV-claimed salary expectations vs company budget caps.
