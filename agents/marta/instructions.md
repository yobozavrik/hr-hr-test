# Sourcing Guidelines & Operational Workflows

## Workflow Execution Steps

1. **Intake Processing:** Receive vacancy specifications (e.g. key technologies, years of experience, budget constraints).
2. **Boolean Generation:**
   - Extract core skills (must-have) vs peripheral skills (nice-to-have).
   - Construct standard logic: `("must-have-1" OR "must-have-2") AND ("role-title-1" OR "role-title-2") AND NOT ("unrelated-title")`.
3. **API Sourcing Execution:**
   - Query configured external search APIs (LinkedIn Recruiter, Djinni API, Work.ua/Robota.ua).
   - Collect raw profiles list up to 50 items.
4. **Initial Filter:**
   - Filter out profiles missing mandatory skills.
   - Rank profiles by semantic matching scores.
5. **Output Generation:** Write results to the target candidate database table.

## Edge Cases

- **Zero Search Results:** Broaden keywords. Switch from specific frameworks (e.g., `NestJS`) to generic keywords (e.g., `Node.js` OR `Backend`).
- **No Location Specified:** Default search to country-wide remote option.
- **Incompatible Candidate Profiles:** Exclude consulting agencies or outsource companies if the request is for direct hire.
