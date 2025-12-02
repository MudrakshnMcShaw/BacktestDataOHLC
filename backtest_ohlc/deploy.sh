# Modified lines in deploy.sh
pm2 delete "Backtest OHLC"
pm2 start main.py --name "Backtest OHLC" --interpreter /root/BacktestDataOHLC/backtest_ohlc/venv/bin/pip3.10 --no-autorestart
