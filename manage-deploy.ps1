param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'prod', 'status')]
    [string]$action = 'status'
)

$config = @{
    dev = @{
        app = "dev-guides-new-dev"
        url = "https://dev-guides-new-dev-9ff58ea91415.herokuapp.com/"
        remote = "heroku-dev"
    }
    prod = @{
        app = "dev-guides-new"
        url = "https://dev-guides-new-dfdb4ff2b805.herokuapp.com/"
        remote = "heroku"
    }
}

function Show-Status {
    Write-Host "`nDevelopment Environment:" -ForegroundColor Yellow
    heroku info --app $config.dev.app
    Write-Host "`nProduction Environment:" -ForegroundColor Green
    heroku info --app $config.prod.app
}

function Deploy-To {
    param($env)
    $conf = $config[$env]
    
    Write-Host "`nDeploying to $env environment..." -ForegroundColor Cyan
    Write-Host "App: $($conf.app)" -ForegroundColor Yellow
    Write-Host "URL: $($conf.url)" -ForegroundColor Yellow

    # Проверяем текущую ветку
    $currentBranch = git branch --show-current
    
    if ($env -eq 'dev') {
        git push $conf.remote $currentBranch":main" -f
    } else {
        # Для продакшена спрашиваем подтверждение
        $confirm = Read-Host "Are you sure you want to deploy to PRODUCTION? (y/n)"
        if ($confirm -eq 'y') {
            git push $conf.remote main
        } else {
            Write-Host "Production deployment cancelled." -ForegroundColor Yellow
            return
        }
    }

    # Показываем логи после деплоя
    Write-Host "`nShowing logs for $env environment..." -ForegroundColor Cyan
    heroku logs --tail --app $conf.app
}

switch ($action) {
    'dev' { Deploy-To 'dev' }
    'prod' { Deploy-To 'prod' }
    'status' { Show-Status }
}