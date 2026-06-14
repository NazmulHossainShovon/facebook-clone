# Deploy notes — Nginx + systemd (host)

This folder contains drop-in templates to run the backend on a Linux host using `systemd` and Nginx.

Quick steps

1. Build the backend

```bash
cd backend
npm ci
npm run build
```

2. Install systemd unit (adjust paths if your repo is in a different location)

```bash
sudo cp deploy/systemd/facebook-clone-api.service /etc/systemd/system/facebook-clone-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now facebook-clone-api
```

3. Install Nginx config

```bash
sudo cp deploy/nginx/facebook-clone.conf /etc/nginx/conf.d/facebook-clone.conf
sudo nginx -t
sudo systemctl restart nginx
```

4. Firewall (Ubuntu example)

```bash
sudo ufw allow 'Nginx Full'
```

5. Verify

```bash
curl -I http://localhost/
sudo journalctl -u facebook-clone-api -f
sudo tail -f /var/log/nginx/facebook-clone.access.log
```

Notes

- The systemd unit uses `EnvironmentFile=/home/shovon/my-data/projects/facebook-clone/backend/.env`. Edit the unit if your repository is in a different path.
- For production TLS, use `certbot --nginx` or terminate TLS at a load balancer.
- If you prefer `pm2`, run `pm2 start build/index.js --name facebook-clone-api` instead of creating a systemd unit.
