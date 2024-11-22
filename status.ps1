Write-Host "Development Status:" -ForegroundColor Yellow
heroku info --app dev-guides-new-dev
heroku config --app dev-guides-new-dev

Write-Host "`nProduction Status:" -ForegroundColor Green
heroku info --app dev-guides-new
heroku config --app dev-guides-new