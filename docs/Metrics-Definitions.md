# TXDPS ARB Metrics Definitions

## Overview
This document defines key metrics and measurements for tracking Architecture Review Board (ARB) submission effectiveness, performance, and business intelligence. These metrics support data-driven decision making and continuous improvement.

---

## Submission Metrics

### 1. Submission Volume
**Definition**: Total number of ARB submissions over a given period.

**Measurement**:
- Count of submissions per week/month/quarter
- Trend analysis over time

**Business Value**:
- Understand demand on ARB resources
- Predict staffing needs
- Identify seasonal patterns

**Power BI Visualization**: Line chart showing submissions over time with trend line

---

### 2. Submission Status Distribution
**Definition**: Current status of all submissions in the system.

**Categories**:
- Draft
- Submitted
- Under Review
- Pending Information
- Approved
- Rejected
- On Hold

**Business Value**:
- Pipeline visibility
- Bottleneck identification
- Workload distribution

**Power BI Visualization**: Pie chart or stacked bar chart

---

### 3. Time to Approval
**Definition**: Average time from submission to final approval decision.

**Measurement**:
- Days between submission date and approval date
- Median, average, min, max
- Percentile distribution (50th, 75th, 90th)

**Target**: < 14 business days for standard submissions

**Business Value**:
- Process efficiency indicator
- SLA compliance tracking
- Identify delays

**Power BI Visualization**: Box plot or histogram with target line

---

## Project Metrics

### 4. Project Type Distribution
**Definition**: Breakdown of submissions by project type.

**Categories**:
- New Application
- Enhancement
- Integration
- Infrastructure
- Security
- Other

**Business Value**:
- Understand portfolio composition
- Resource allocation planning
- Technology trend identification

**Power BI Visualization**: Donut chart

---

### 5. Budget Range Analysis
**Definition**: Distribution of projects by estimated budget.

**Ranges**:
- Under $50K
- $50K - $100K
- $100K - $500K
- $500K - $1M
- Over $1M

**Business Value**:
- Financial planning
- Investment portfolio view
- Risk assessment

**Power BI Visualization**: Horizontal bar chart

---

### 6. Domain Coverage
**Definition**: Number of submissions addressing each domain.

**Domains**: As defined in Domain-Definitions.md

**Business Value**:
- Identify frequently addressed domains
- Target training and resources
- Understand organizational focus areas

**Power BI Visualization**: Heat map or tree map

---

## Performance Metrics

### 7. Review Cycle Time
**Definition**: Time spent in each review stage.

**Stages**:
- Initial Review
- Technical Review
- Security Review
- Financial Review
- Final Approval

**Business Value**:
- Identify bottlenecks
- Optimize process
- Balance workload across reviewers

**Power BI Visualization**: Waterfall chart or funnel chart

---

### 8. Approval Rate
**Definition**: Percentage of submissions approved vs. rejected or withdrawn.

**Calculation**: (Approved / Total Completed) × 100

**Target**: 85% approval rate

**Business Value**:
- Quality of submissions
- Effectiveness of pre-submission guidance
- Identify common rejection reasons

**Power BI Visualization**: Gauge or KPI card

---

### 9. Resubmission Rate
**Definition**: Percentage of submissions requiring resubmission after initial review.

**Calculation**: (Resubmissions / Total Submissions) × 100

**Business Value**:
- Form clarity indicator
- Training needs identification
- Process improvement opportunity

**Power BI Visualization**: Line chart with trend

---

## Compliance Metrics

### 10. Compliance Coverage
**Definition**: Percentage of submissions addressing required compliance domains.

**Required Domains**:
- Security & Compliance
- Risk Management
- Data Management

**Business Value**:
- Regulatory compliance tracking
- Risk visibility
- Audit readiness

**Power BI Visualization**: Progress bar or KPI card

---

### 11. Security Review Findings
**Definition**: Number and severity of security issues identified during review.

**Severity Levels**:
- Critical
- High
- Medium
- Low

**Business Value**:
- Security posture tracking
- Trend analysis
- Risk management

**Power BI Visualization**: Stacked bar chart by severity

---

## Resource Metrics

### 12. Reviewer Workload
**Definition**: Number of submissions assigned to each reviewer.

**Measurements**:
- Active assignments per reviewer
- Completed reviews per reviewer
- Average time per review

**Business Value**:
- Workload balancing
- Capacity planning
- Performance management

**Power BI Visualization**: Horizontal bar chart with capacity line

---

### 13. Response Time
**Definition**: Time taken by reviewers to provide initial feedback.

**Target**: < 3 business days

**Business Value**:
- Service level tracking
- Reviewer performance
- Submission experience

**Power BI Visualization**: Line chart with target threshold

---

## Business Intelligence Metrics

### 14. Strategic Alignment Score
**Definition**: Assessment of how well projects align with TXDPS strategic objectives.

**Scale**: 1-5 (1=Low alignment, 5=High alignment)

**Business Value**:
- Portfolio prioritization
- Strategic planning
- Investment decisions

**Power BI Visualization**: Scatter plot (alignment vs. budget)

---

### 15. ROI Analysis
**Definition**: Expected return on investment for approved projects.

**Measurement**:
- Estimated ROI percentage
- Payback period
- Total business value

**Business Value**:
- Investment justification
- Portfolio optimization
- Financial planning

**Power BI Visualization**: Bubble chart (ROI vs. budget vs. risk)

---

### 16. Risk Profile
**Definition**: Aggregate risk assessment across all active submissions.

**Risk Factors**:
- Technical risk
- Financial risk
- Timeline risk
- Integration risk

**Business Value**:
- Portfolio risk management
- Proactive issue identification
- Resource allocation

**Power BI Visualization**: Risk matrix (probability vs. impact)

---

### 17. Technology Stack Trends
**Definition**: Most commonly proposed technologies and platforms.

**Categories**:
- Programming languages
- Frameworks
- Cloud platforms
- Databases
- Integration tools

**Business Value**:
- Technology standardization
- Skill development planning
- License management

**Power BI Visualization**: Word cloud or bar chart

---

## Operational Metrics

### 18. Form Completion Rate
**Definition**: Percentage of started forms that are completed and submitted.

**Calculation**: (Submitted / Started) × 100

**Business Value**:
- User experience indicator
- Form design effectiveness
- Process friction identification

**Power BI Visualization**: Funnel chart

---

### 19. Question Skip Rate
**Definition**: Percentage of optional questions left unanswered.

**Measurement**: Per question and aggregate

**Business Value**:
- Identify unclear questions
- Optimize form length
- Improve data quality

**Power BI Visualization**: Heat map by question

---

### 20. Export Usage
**Definition**: Frequency and type of data exports.

**Export Types**:
- PDF
- Excel
- JSON

**Business Value**:
- Feature usage tracking
- User behavior insights
- Integration opportunities

**Power BI Visualization**: Stacked area chart

---

## Dashboard Recommendations

### Executive Dashboard
**Audience**: Leadership, executives

**Key Metrics**:
- Submission Volume (trend)
- Approval Rate
- Time to Approval
- Budget Distribution
- Strategic Alignment Score

**Refresh**: Daily

---

### Operations Dashboard
**Audience**: ARB administrators, process owners

**Key Metrics**:
- Submission Status Distribution
- Review Cycle Time
- Reviewer Workload
- Response Time
- Resubmission Rate

**Refresh**: Hourly

---

### Portfolio Dashboard
**Audience**: PMO, portfolio managers

**Key Metrics**:
- Project Type Distribution
- Budget Range Analysis
- ROI Analysis
- Risk Profile
- Technology Stack Trends

**Refresh**: Weekly

---

### Compliance Dashboard
**Audience**: Compliance officers, security team

**Key Metrics**:
- Compliance Coverage
- Security Review Findings
- Risk Profile
- Domain Coverage (compliance-related)

**Refresh**: Daily

---

## Data Sources

All metrics are derived from:
1. **SharePoint List**: "ARB Submissions" - Primary data source
2. **Document Library**: Metadata and tags
3. **Power Automate Logs**: Process execution data
4. **Form Analytics**: User interaction data

## Data Refresh Schedule

- **Real-time**: Submission counts, status changes
- **Hourly**: Workload metrics, response times
- **Daily**: Trend analysis, compliance metrics
- **Weekly**: Aggregated reports, executive summaries

## Implementation Notes

### Power BI Connection
Use the provided `TXDPS_ARB.pbids` file to connect Power BI Desktop to the SharePoint list:

```json
{
  "version": "0.1",
  "connections": [
    {
      "details": {
        "protocol": "sharepoint-online",
        "address": {
          "url": "https://[tenant].sharepoint.com/sites/ARB"
        }
      }
    }
  ]
}
```

### Calculated Columns
Create these calculated columns in Power BI:

1. **DaysToApproval**: `DATEDIFF([SubmissionDate], [ApprovalDate], DAY)`
2. **IsApproved**: `IF([Status] = "Approved", 1, 0)`
3. **BudgetCategory**: `SWITCH([BudgetRange], ...)`

### Measures
Create these DAX measures:

1. **AvgTimeToApproval**: `AVERAGE([DaysToApproval])`
2. **ApprovalRate**: `DIVIDE([TotalApproved], [TotalSubmissions])`
3. **ActiveSubmissions**: `COUNTROWS(FILTER(Submissions, [Status] <> "Completed"))`

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Owner**: TXDPS Business Intelligence Team  
**Contact**: bi-team@dps.texas.gov
