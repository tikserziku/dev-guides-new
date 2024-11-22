param(
    [string]$environment = "dev"
)

if ($environment -eq "dev") {
    Write-Host "Deploying to development..." -ForegroundColor Yellow
    git push heroku-dev feature/code-organization:main
    heroku logs --tail --app dev-guides-new-dev
} else {
    Write-Host "Deploying to production..." -ForegroundColor Green
    git push heroku main
    heroku logs --tail --app dev-guides-new
}