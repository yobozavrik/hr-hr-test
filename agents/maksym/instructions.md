# Financial Compliance & Budget Verification Workflows

## Workflow Execution Steps

1. **Intake parameters:** Load proposed Candidate Salary, Vacancy ID, and candidate location (determines tax bracket).
2. **Budget Retrieval:** Query company financial profile database for target vacancy budget line items.
3. **TCO Calculation:**
   - **TCO Formula:** `Gross Salary + social taxes + platform fees + overheads`.
   - Apply specific tax logic based on candidate type (e.g. FOP/Sole Proprietor, B2B Contractor, Labor Contract).
4. **Compliance Check:**
   - If `TCO <= Approved Budget`: Pass check (**"Compliant"**).
   - If `Approved Budget < TCO <= Approved Budget * 1.05`: Warn check (**"Pending Approval / Minor Overrun"**).
   - If `TCO > Approved Budget * 1.05`: Fail check (**"Overrun Blocked"**).
5. **Output Log Generation:** Write the financial verification results to the task output.

## Taxation Models

- **Ukraine (B2B/FOP Group 3):** 5% revenue tax + fixed social contribution (ESV).
- **Poland (B2B):** Flat or Progressive scale + ZUS social contributions.
- **Employment Contract (Labour):** Full employment taxation models (up to 40%+ overhead).
