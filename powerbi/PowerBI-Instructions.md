# Power BI Integration for TXDPS ARB

This directory contains Power BI configuration files and instructions for creating analytics dashboards based on ARB submission data.

## Overview

The Power BI integration provides business intelligence and analytics capabilities for the TXDPS ARB system, enabling data-driven decision making and process optimization.

## Files

### TXDPS_ARB.pbids
Power BI Data Source file that establishes a connection to the SharePoint "ARB Submissions" list.

**Purpose**: Quick connection setup for Power BI Desktop

## Prerequisites

1. **Power BI Desktop** (latest version)
   - Download: https://powerbi.microsoft.com/desktop

2. **Permissions**:
   - Read access to SharePoint site
   - Access to "ARB Submissions" list
   - Power BI Pro license (for publishing to service)

3. **SharePoint List**:
   - "ARB Submissions" list must be created and populated
   - Use Deploy-SP.ps1 script to create the list

## Setup Instructions

### Step 1: Connect Power BI to SharePoint

#### Method 1: Using .pbids File (Recommended)

1. Double-click `TXDPS_ARB.pbids` file
2. Power BI Desktop will open automatically
3. Update `[tenant]` in the file before opening, or
4. Enter your SharePoint site URL when prompted
5. Authenticate with your credentials
6. Select "ARB Submissions" list
7. Click "Load"

#### Method 2: Manual Connection

1. Open Power BI Desktop
2. Click "Get Data" → "More..."
3. Search for "SharePoint Online List"
4. Click "Connect"
5. Enter site URL: `https://[tenant].sharepoint.com/sites/ARB`
6. Select authentication method (usually "Microsoft account")
7. Sign in with your credentials
8. From the Navigator, select "ARB Submissions"
9. Click "Load"

### Step 2: Transform Data (Power Query)

Once data is loaded, apply these transformations:

#### a. Data Type Corrections

```powerquery
= Table.TransformColumnTypes(
    Source,
    {
        {"SubmissionDate", type datetime},
        {"ApprovalDate", type datetime},
        {"TargetCompletionDate", type datetime},
        {"EstimatedUsers", Int64.Type},
        {"StrategicAlignment", Int64.Type}
    }
)
```

#### b. Create Calculated Columns

**Days to Approval**:
```powerquery
= Table.AddColumn(
    #"Changed Type",
    "DaysToApproval",
    each Duration.Days([ApprovalDate] - [SubmissionDate]),
    type number
)
```

**Month/Year**:
```powerquery
= Table.AddColumn(
    #"Previous Step",
    "SubmissionMonth",
    each Date.ToText([SubmissionDate], "MMM yyyy"),
    type text
)
```

**Budget Category**:
```powerquery
= Table.AddColumn(
    #"Previous Step",
    "BudgetCategory",
    each if [BudgetRange] = "Under $50,000" then "Small"
    else if [BudgetRange] = "$50,000 - $100,000" then "Small"
    else if [BudgetRange] = "$100,000 - $500,000" then "Medium"
    else if [BudgetRange] = "$500,000 - $1,000,000" then "Large"
    else "Very Large",
    type text
)
```

#### c. Create Date Table

```powerquery
let
    StartDate = #date(2024, 1, 1),
    EndDate = Date.AddYears(Date.From(DateTime.LocalNow()), 2),
    DateList = List.Dates(StartDate, Duration.Days(EndDate - StartDate) + 1, #duration(1, 0, 0, 0)),
    #"Converted to Table" = Table.FromList(DateList, Splitter.SplitByNothing(), {"Date"}, null, ExtraValues.Error),
    #"Changed Type" = Table.TransformColumnTypes(#"Converted to Table",{{"Date", type date}}),
    #"Added Year" = Table.AddColumn(#"Changed Type", "Year", each Date.Year([Date]), Int64.Type),
    #"Added Month" = Table.AddColumn(#"Added Year", "Month", each Date.Month([Date]), Int64.Type),
    #"Added Month Name" = Table.AddColumn(#"Added Month", "MonthName", each Date.MonthName([Date]), type text),
    #"Added Quarter" = Table.AddColumn(#"Added Month Name", "Quarter", each Date.QuarterOfYear([Date]), Int64.Type),
    #"Added Week" = Table.AddColumn(#"Added Quarter", "Week", each Date.WeekOfYear([Date]), Int64.Type)
in
    #"Added Week"
```

### Step 3: Create Measures (DAX)

Add these measures for analytics:

#### Count Measures

```dax
Total Submissions = COUNTROWS('ARB Submissions')

Approved Submissions = 
    CALCULATE(
        COUNTROWS('ARB Submissions'),
        'ARB Submissions'[Status] = "Approved"
    )

Rejected Submissions = 
    CALCULATE(
        COUNTROWS('ARB Submissions'),
        'ARB Submissions'[Status] = "Rejected"
    )

Pending Submissions = 
    CALCULATE(
        COUNTROWS('ARB Submissions'),
        'ARB Submissions'[Status] IN {"Submitted", "Under Review"}
    )
```

#### Rate Measures

```dax
Approval Rate = 
    DIVIDE(
        [Approved Submissions],
        [Total Submissions],
        0
    )

Rejection Rate = 
    DIVIDE(
        [Rejected Submissions],
        [Total Submissions],
        0
    )
```

#### Time Measures

```dax
Avg Days to Approval = 
    CALCULATE(
        AVERAGE('ARB Submissions'[DaysToApproval]),
        'ARB Submissions'[Status] = "Approved"
    )

Median Days to Approval = 
    CALCULATE(
        MEDIAN('ARB Submissions'[DaysToApproval]),
        'ARB Submissions'[Status] = "Approved"
    )
```

#### Budget Measures

```dax
Total Budget (Mid-Point) = 
    CALCULATE(
        SUMX(
            'ARB Submissions',
            SWITCH(
                'ARB Submissions'[BudgetRange],
                "Under $50,000", 25000,
                "$50,000 - $100,000", 75000,
                "$100,000 - $500,000", 300000,
                "$500,000 - $1,000,000", 750000,
                "Over $1,000,000", 1500000,
                0
            )
        )
    )
```

## Dashboard Examples

### Executive Dashboard

**Key Visuals**:
1. **KPI Cards**:
   - Total Submissions
   - Approval Rate
   - Avg Days to Approval
   - Pending Reviews

2. **Line Chart**: Submissions over time (by month)
3. **Pie Chart**: Status distribution
4. **Bar Chart**: Top 5 Project Types
5. **Gauge**: Approval rate vs. target (85%)

### Operations Dashboard

**Key Visuals**:
1. **Funnel**: Submission status pipeline
2. **Table**: Pending submissions with reviewer
3. **Bar Chart**: Days to approval by project type
4. **Matrix**: Reviewer workload
5. **Slicer**: Date range, Status, Project Type

### Portfolio Dashboard

**Key Visuals**:
1. **Scatter Plot**: Strategic Alignment vs. Budget
2. **Stacked Bar**: Budget by Project Type
3. **Tree Map**: Domains covered
4. **Column Chart**: Projects by Target Completion Date
5. **Card**: Total Portfolio Value

### Compliance Dashboard

**Key Visuals**:
1. **Matrix**: Compliance requirements by project
2. **Bar Chart**: Security review findings
3. **Gauge**: Compliance coverage %
4. **Table**: High-risk submissions
5. **Card**: Open compliance issues

## Refresh Configuration

### Option 1: Manual Refresh
- Click "Refresh" button in Power BI Desktop
- Data updates immediately

### Option 2: Scheduled Refresh (Power BI Service)

1. **Publish Report**:
   ```
   File → Publish → Select workspace
   ```

2. **Configure Gateway** (if on-premises):
   ```
   Install → Power BI Gateway
   Configure → Add data source
   ```

3. **Schedule Refresh**:
   ```
   Settings → Dataset → Scheduled refresh
   Set frequency: Daily at 6:00 AM
   Add credentials
   ```

### Option 3: DirectQuery Mode

For real-time data:
```
Get Data → Advanced options
Select: DirectQuery (instead of Import)
```

**Pros**: Real-time data
**Cons**: Performance impact, limited DAX functions

## Sharing and Distribution

### Publish to Power BI Service

1. Save your report (.pbix file)
2. File → Publish → Select workspace
3. Choose "My workspace" or team workspace
4. Click "Publish"

### Create App

1. In Power BI Service, go to workspace
2. Create → App
3. Include ARB dashboard
4. Set permissions
5. Publish app
6. Share link with users

### Embed in SharePoint

1. Publish report to Power BI Service
2. Get embed code
3. Add to SharePoint page:
   ```
   Edit page → Add web part → Power BI
   Select report
   ```

## Security

### Row-Level Security (RLS)

Implement RLS to restrict data by user:

```dax
[SubmitterEmail] = USERPRINCIPALNAME()
```

Or for reviewers:
```dax
[AssignedReviewer] = USERPRINCIPALNAME()
```

### Roles

Create roles in Power BI Desktop:
1. Modeling → Manage Roles
2. Create role: "Submitter"
3. Add DAX filter (above)
4. Test with "View as role"

Assign roles in Power BI Service:
1. Dataset → Security
2. Add members to roles

## Troubleshooting

### Connection Issues
- Verify SharePoint permissions
- Check SharePoint site URL
- Re-authenticate connection

### Slow Performance
- Use DirectQuery for large datasets
- Optimize DAX measures
- Reduce visual count per page

### Data Not Updating
- Check refresh schedule
- Verify gateway status (if applicable)
- Review error log in Power BI Service

## Best Practices

1. **Data Model**:
   - Create relationships between tables
   - Use star schema design
   - Separate date table

2. **Performance**:
   - Limit visual interactions
   - Use bookmarks for navigation
   - Aggregate where possible

3. **Design**:
   - Follow TXDPS branding
   - Use consistent colors
   - Keep dashboards simple

4. **Maintenance**:
   - Document calculations
   - Version control .pbix files
   - Regular testing

## Template Downloads

Sample .pbix files available (after deployment):
- Executive Dashboard Template
- Operations Dashboard Template
- Portfolio Dashboard Template
- Compliance Dashboard Template

## Additional Resources

- **Power BI Documentation**: https://docs.microsoft.com/power-bi
- **DAX Guide**: https://dax.guide
- **Community**: https://community.powerbi.com

## Support

For Power BI assistance:
- TXDPS BI Team: bi-team@dps.texas.gov
- Power BI Support: powerbi-support@dps.texas.gov

## License

Power BI Pro or Premium license required for sharing and collaboration features.
