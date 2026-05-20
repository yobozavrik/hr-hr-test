# Market Analysis & Salary Benchmarking Workflows

## Workflow Execution Steps

1. **Target Specification Intake:** Identify vacancy title, tech stack keywords, and geographic constraints (e.g. Remote in Ukraine, Poland, global).
2. **Data Aggregation:**
   - Scan target API connectors for matching job postings and active candidates.
   - Aggregate salary parameters from recent hires matching the keywords.
3. **Statistical Computations:**
   - Compute Medians, p25 (lower bounds), and p75 (premium bounds).
   - Evaluate Candidate-to-Vacancy ratio: `Active Candidates / Open Postings`.
4. **Recruitment Difficulty Scoring:**
   - Ratio > 5: **Low Difficulty**
   - Ratio 2-5: **Medium Difficulty**
   - Ratio < 2: **High Difficulty / Talent Shortage**
5. **Report Generation:** Create tables and structured reports for dashboard representation.

## Currency Guidelines

- Always normalize salaries to Monthly USD ($) net.
- Perform calculations using average currency exchange rates updated daily.
