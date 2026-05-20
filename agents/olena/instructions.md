# Competitor Intelligence & Threat Auditing Workflows

## Workflow Execution Steps

1. **Target Specification:** Define competitor companies list and tech stack keywords.
2. **Aggregator Scraping:**
   - Scan public boards using target company filters.
   - Parse active postings for salary brackets, stack listings, and benefits.
3. **Activity Volume Mapping:** Trace weekly changes in posting volumes.
4. **Retention / Recruitment Threat Indexing:**
   - Calculate index based on overlap: `Competitor Vacancies matching tech stack / Company Vacancies`.
   - **Scale:**
     - Overlap > 3 openings: **High Threat** (Competitors actively poaching/competing for the same talent).
     - Overlap 1-2 openings: **Medium Threat**.
     - Overlap 0: **Low Threat**.
5. **Output Alert Generation:** Flag any immediate retention threats to active employees.

## Scraping Compliance

- Respect `robots.txt` policies.
- Utilize proxy rotation and API keys where direct integrations exist.
