#!/usr/bin/env bash
#
# Removes the RGBPiano systemd service and virtualenv. Leaves the repo in place.
#
set -Eeuo pipefail
trap 'echo "ERROR: ${BASH_SOURCE[0]}:${LINENO}: command failed: ${BASH_COMMAND}" >&2' ERR

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "Elevating with sudo..."
  exec sudo -E bash "$0" "$@"
fi

PI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$PI_DIR/venv"
SERVICE_FILE=/etc/systemd/system/rgbpiano.service

if systemctl list-unit-files | grep -q '^rgbpiano.service'; then
  echo "==> Stopping and disabling service"
  systemctl disable --now rgbpiano.service
fi

if [ -f "$SERVICE_FILE" ]; then
  echo "==> Removing systemd unit"
  rm -f "$SERVICE_FILE"
  systemctl daemon-reload
fi

if [ -d "$VENV" ]; then
  echo "==> Removing virtualenv"
  rm -rf "$VENV"
fi

echo "==> Done. RGBPiano has been uninstalled."
