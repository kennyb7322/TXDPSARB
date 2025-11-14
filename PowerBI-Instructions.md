# Power BI – TXDPS ARB
1. Open `TXDPS_ARB.pbids` with Power BI Desktop.
2. Authenticate to SharePoint Online and load the `ARB Submissions` list.
3. Create measures:
   - **Completion %** = AVERAGE('ARB'[Completion])
   - **Submissions** = COUNTROWS('ARB')
   - **Regulated Flag** = IF('ARB'[Classification] = "Regulated (CJIS/PCI/HIPAA)", 1, 0)
4. Suggested visuals:
   - Card visuals for *Submissions*, *Regulated Flag Count*, *Avg Completion %*.
   - Bar chart for coverage by **Domain**.
   - Slicer for *Request Type*, *Solution Area*.
