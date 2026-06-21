#!/usr/bin/env bash
#
# Idempotent installer for the RGBPiano LED server.
# Installs dependencies, builds a virtualenv, and registers a systemd service that
# starts on boot. Safe to re-run after pulling new code (it just updates everything).
#
set -Eeuo pipefail
trap 'echo "ERROR: ${BASH_SOURCE[0]}:${LINENO}: command failed: ${BASH_COMMAND}" >&2' ERR

# WS2812 needs root for DMA/PWM access, so the whole thing runs as root.
if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "Elevating with sudo..."
  exec sudo -E bash "$0" "$@"
fi

PI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$PI_DIR/venv"
PYTHON="$VENV/bin/python"
SERVICE_FILE=/etc/systemd/system/rgbpiano.service

echo "==> Installing system packages"
apt-get update
apt-get install -y python3 python3-venv python3-dev gcc

echo "==> Creating virtualenv at $VENV"
if [ ! -d "$VENV" ]; then
  python3 -m venv "$VENV"
fi

echo "==> Installing Python dependencies"
"$VENV/bin/pip" install --upgrade pip
"$VENV/bin/pip" install -r "$PI_DIR/requirements.txt"

echo "==> Writing systemd service"
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=RGBPiano LED server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=$PYTHON $PI_DIR/rgbpiano.py
WorkingDirectory=$PI_DIR
Restart=always
RestartSec=2
User=root

[Install]
WantedBy=multi-user.target
EOF

echo "==> Enabling and starting service"
systemctl daemon-reload
systemctl enable rgbpiano.service
systemctl restart rgbpiano.service

if systemctl is-active --quiet rgbpiano.service; then
  echo "==> Done. rgbpiano.service is running."
else
  echo "==> rgbpiano.service failed to start. Recent logs:" >&2
  journalctl -u rgbpiano.service -n 30 --no-pager >&2
  exit 1
fi
