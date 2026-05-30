$line = Get-Content -Path "C:\Users\SISTEMA\.gemini\antigravity\brain\4f7b642f-fc5e-4a93-a05b-980ea91626b6\.system_generated\logs\overview.txt" -TotalCount 488 | Select-Object -Last 1
$json = ConvertFrom-Json $line
$code = $json.tool_calls[0].args.CodeContent
$code | Out-File -FilePath "C:\Users\SISTEMA\Desktop\ores-travel-forms-\andean-journey-react\src\pages\DashboardPage.jsx" -Encoding utf8
