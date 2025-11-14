# Power Automate Flows

This directory contains Power Automate flow definitions for the TXDPS ARB system.

## Available Flows

### 1. PowerAutomate_FlowDefinition.json
**Purpose**: Main submission intake and approval workflow

**Triggers**: When a new item is created in the "ARB Submissions" SharePoint list

**Key Actions**:
- Updates submission status to "Submitted"
- Creates Excel export of submission data
- Sends confirmation email to submitter
- Notifies ARB team of new submission
- Initiates approval process
- Routes to appropriate reviewer
- Updates status based on approval decision
- Sends final notification emails
- Logs all actions to audit trail

**Required Connections**:
- SharePoint Online
- Office 365 Outlook
- Approvals
- OneDrive for Business (for Excel exports)

### 2. UserLifecycle_Automation.json
**Purpose**: Automated user lifecycle management for ARB access

**Includes Three Workflows**:

#### a. Employee Onboarding
- **Trigger**: New employee record created with ARB access flag
- **Actions**:
  - Determines appropriate ARB role
  - Adds user to correct SharePoint security group
  - Sends welcome email with access information
  - Assigns training modules
  - Logs onboarding activity

#### b. Employee Offboarding
- **Trigger**: Employee termination record created
- **Actions**:
  - Checks for active submissions
  - Notifies manager if reassignment needed
  - Removes from all ARB security groups
  - Archives user's documents
  - Sends confirmation to administrators
  - Logs offboarding activity

#### c. Role Change
- **Trigger**: Role change record affecting ARB access
- **Actions**:
  - Removes from old role group
  - Adds to new role group
  - Sends notification to user
  - Logs role change activity

**Required Connections**:
- SharePoint Online
- Office 365 Outlook
- HTTP (for SharePoint REST API calls)

## Setup Instructions

### Step 1: Prerequisites
1. SharePoint site: `https://[tenant].sharepoint.com/sites/ARB`
2. SharePoint lists created (use Deploy-SP.ps1 script)
3. Security groups configured:
   - ARB Administrators
   - ARB Reviewers
   - All Employees
4. Approval licenses for approval workflow

### Step 2: Import Flows

#### Using Power Automate Portal
1. Go to https://make.powerautomate.com
2. Click "My flows" → "Import" → "Import Package (Legacy)"
3. Upload the JSON file
4. Configure connections for each connector
5. Update tenant-specific values:
   - Replace `[tenant]` with your SharePoint tenant name
   - Update email addresses
   - Adjust SharePoint URLs

#### Using Power Platform CLI
```powershell
# Install Power Platform CLI
winget install Microsoft.PowerPlatform.CLI

# Authenticate
pac auth create --url https://[tenant].crm.dynamics.com

# Import flow (requires conversion to solution package)
pac solution import --path .\solution.zip
```

### Step 3: Configure Connections

For each flow, configure these connections:

**SharePoint**:
- Connection type: SharePoint Online
- Authentication: OAuth
- Site: https://[tenant].sharepoint.com/sites/ARB

**Office 365 Outlook**:
- Connection type: Office 365 Outlook
- Authentication: OAuth
- Account: Service account or user account

**Approvals**:
- Connection type: Approvals
- Authentication: OAuth

**HTTP** (for lifecycle automation):
- Connection type: HTTP with Azure AD
- Authentication: Azure AD
- Base URL: https://[tenant].sharepoint.com
- Resource URI: https://[tenant].sharepoint.com

### Step 4: Customize Flow Parameters

Update these parameters in each flow:

**Email Addresses**:
- `arb-team@dps.texas.gov` → Your ARB team email
- `arb-reviewers@dps.texas.gov` → Your reviewer group email
- `arb-admins@dps.texas.gov` → Your admin group email
- `arb-support@dps.texas.gov` → Your support email

**SharePoint URLs**:
- Replace `[tenant]` with your actual tenant name
- Update site paths if different from `/sites/ARB`

**List/Library Names**:
- Verify list and library names match your deployment
- Default: "ARB Submissions", "ARB Documents", "ARB Audit Log"

### Step 5: Test Flows

1. **Test in Isolation**: Use "Test" button in Power Automate
2. **Use Test Data**: Create test submissions in SharePoint
3. **Verify Emails**: Check all emails are received
4. **Check Approvals**: Test approval routing
5. **Validate Logging**: Verify audit log entries

## Flow Details

### Intake Workflow Flow Chart

```
New Submission
    ↓
Initialize Variables
    ↓
Update Status → "Submitted"
    ↓
Generate Excel Export
    ↓
Send Confirmation to Submitter
    ↓
Notify ARB Team
    ↓
Start Approval Process
    ↓
    ├─→ Approved
    │   ├─→ Update Status → "Approved"
    │   ├─→ Send Approval Email
    │   └─→ Log to Audit
    │
    └─→ Rejected
        ├─→ Update Status → "Rejected"
        ├─→ Send Rejection Email
        └─→ Log to Audit
```

### User Lifecycle Flow Chart

```
Onboarding:
New Employee → Determine Role → Add to Group → Send Welcome → Assign Training → Log

Offboarding:
Termination → Check Submissions → Notify Manager → Remove Access → Archive Docs → Log

Role Change:
Role Update → Remove Old Role → Add New Role → Notify User → Log
```

## Monitoring and Maintenance

### Monitor Flow Runs
1. Go to Power Automate portal
2. View "My flows"
3. Click on flow name
4. Review "Run history"

### Common Issues

**Flow Not Triggering**:
- Check SharePoint list permissions
- Verify trigger conditions
- Review connection authentication

**Email Not Sending**:
- Verify Office 365 connection
- Check email addresses
- Review tenant email policies

**Approval Not Working**:
- Verify Approvals license
- Check approver email addresses
- Review approval timeout settings

### Performance Optimization

1. **Parallel Actions**: Use parallel branches where possible
2. **Batching**: Process multiple items in batches
3. **Caching**: Cache lookup data to reduce API calls
4. **Filtering**: Filter at source to reduce data transfer

### Security Best Practices

1. **Service Account**: Use dedicated service account for flows
2. **Least Privilege**: Grant minimum required permissions
3. **Secrets**: Store sensitive data in Key Vault
4. **Audit**: Enable audit logging for all flows
5. **Error Handling**: Implement proper error handling and notifications

## Customization Examples

### Add Custom Approval Stage

```json
{
  "name": "Technical Review Stage",
  "type": "Start and wait for an approval",
  "parameters": {
    "approvalType": "Basic",
    "title": "Technical Review - @{variables('varProjectName')}",
    "assignedTo": "technical-reviewers@dps.texas.gov"
  }
}
```

### Add Conditional Routing Based on Budget

```json
{
  "name": "Route Based on Budget",
  "type": "Condition",
  "expression": {
    "greater": [
      "@triggerOutputs()?['body/BudgetRange']",
      "100000"
    ]
  },
  "actions": {
    "if_yes": ["Send to Executive Review"],
    "if_no": ["Standard Approval Process"]
  }
}
```

### Add Integration with External System

```json
{
  "name": "Send to Project Management System",
  "type": "HTTP",
  "parameters": {
    "method": "POST",
    "uri": "https://pm-system.dps.texas.gov/api/projects",
    "body": {
      "name": "@{variables('varProjectName')}",
      "submissionId": "@{variables('varSubmissionID')}"
    }
  }
}
```

## Support

For assistance with Power Automate flows:
- **Documentation**: https://docs.microsoft.com/power-automate
- **Community**: https://powerusers.microsoft.com/
- **TXDPS IT Support**: it-support@dps.texas.gov

## Version History

- **v1.0** (2024): Initial flow definitions
  - Intake and approval workflow
  - User lifecycle automation
  - Basic email notifications

## License

These flows are part of the TXDPS ARB system and are subject to TXDPS licensing and usage policies.
