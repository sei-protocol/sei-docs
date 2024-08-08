---
title: 🚨 Broken URLs Detected: {{ env.TOTAL_ISSUES }} issues found
labels: bug, documentation
assignees: 
---

## URL Check Results

### Issues Found: {{ env.TOTAL_ISSUES }}

| File | Line | URL | Status Code | Reason |
| ---- | ---- | --- | ----------- | ------ |

{{ env.ISSUE_TABLE }}

Please review and fix these broken URLs.
