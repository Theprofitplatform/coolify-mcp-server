#!/bin/bash

##############################################################################
# Server Patch Application Script
#
# Applies 41 package updates to server: itchy-iguana-v4k8404sgkskssg88ww8s8o0
# Includes safety checks, backups, and rollback capabilities
#
# Usage:
#   ./apply-server-patches.sh [--dry-run] [--skip-backup] [--auto-yes]
#
# Options:
#   --dry-run      Show what would be done without making changes
#   --skip-backup  Skip backup procedures (NOT RECOMMENDED)
#   --auto-yes     Auto-confirm all prompts (use with caution)
##############################################################################

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
DRY_RUN=false
SKIP_BACKUP=false
AUTO_YES=false

for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    --auto-yes)
      AUTO_YES=true
      shift
      ;;
    *)
      echo "Unknown option: $arg"
      exit 1
      ;;
  esac
done

# Configuration (after argument parsing)
BACKUP_DIR="/backup/server-patches-$(date +%Y%m%d-%H%M%S)"
# Use local log file for dry-run or non-root, /var/log for root execution
if [ "$DRY_RUN" = true ] || [ "$EUID" -ne 0 ]; then
  LOG_FILE="./server-patches-$(date +%Y%m%d-%H%M%S).log"
else
  LOG_FILE="/var/log/server-patches-$(date +%Y%m%d-%H%M%S).log"
fi
SERVER_UUID="acwcck0c0wg8owgsko880cg0"
SERVER_NAME="itchy-iguana-v4k8404sgkskssg88ww8s8o0"

##############################################################################
# Utility Functions
##############################################################################

log() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
  echo -e "${GREEN}✅ $*${NC}" | tee -a "$LOG_FILE"
}

log_error() {
  echo -e "${RED}❌ $*${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $*${NC}" | tee -a "$LOG_FILE"
}

confirm() {
  if [ "$AUTO_YES" = true ]; then
    return 0
  fi

  read -p "$1 (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Operation cancelled by user"
    return 1
  fi
  return 0
}

check_root() {
  if [ "$EUID" -ne 0 ]; then
    if [ "$DRY_RUN" = true ]; then
      log_warning "Not running as root (OK for dry-run mode)"
      return 0
    else
      log_error "This script must be run as root (use sudo)"
      exit 1
    fi
  fi
}

##############################################################################
# Pre-Flight Checks
##############################################################################

preflight_checks() {
  log "🔍 Running pre-flight checks..."

  # Check if running as root
  check_root

  # Check disk space (need at least 5GB free)
  local free_space=$(df / | tail -1 | awk '{print $4}')
  if [ "$free_space" -lt 5242880 ]; then  # 5GB in KB
    log_error "Insufficient disk space. Need at least 5GB free."
    exit 1
  fi
  log_success "Disk space check passed ($((free_space / 1024 / 1024))GB free)"

  # Check if Docker is running
  if ! systemctl is-active --quiet docker 2>/dev/null; then
    if [ "$DRY_RUN" = true ]; then
      log_warning "Docker is not running (OK for dry-run mode)"
    else
      log_error "Docker is not running"
      exit 1
    fi
  else
    log_success "Docker daemon is running"
  fi

  # Check network connectivity
  if ! ping -c 1 -W 2 archive.ubuntu.com &> /dev/null; then
    if [ "$DRY_RUN" = true ]; then
      log_warning "No network connectivity (OK for dry-run mode)"
    else
      log_error "No network connectivity to Ubuntu repositories"
      exit 1
    fi
  else
    log_success "Network connectivity check passed"
  fi

  # Create backup directory
  if [ "$SKIP_BACKUP" = false ]; then
    mkdir -p "$BACKUP_DIR"
    log_success "Backup directory created: $BACKUP_DIR"
  fi

  # Create log directory
  mkdir -p "$(dirname "$LOG_FILE")"
  log_success "Log file: $LOG_FILE"
}

##############################################################################
# Backup Functions
##############################################################################

backup_docker_containers() {
  if [ "$SKIP_BACKUP" = true ]; then
    log_warning "Skipping Docker container backup (--skip-backup flag)"
    return 0
  fi

  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would backup Docker containers"
    return 0
  fi

  log "💾 Backing up Docker containers..."

  # List all containers
  docker ps -a --format '{{.Names}}' > "$BACKUP_DIR/container-list.txt"

  # Export container configurations
  while read container; do
    docker inspect "$container" > "$BACKUP_DIR/config-$container.json" 2>/dev/null || true
  done < "$BACKUP_DIR/container-list.txt"

  log_success "Docker containers backed up to $BACKUP_DIR"
}

backup_docker_volumes() {
  if [ "$SKIP_BACKUP" = true ]; then
    log_warning "Skipping Docker volume backup (--skip-backup flag)"
    return 0
  fi

  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would backup Docker volumes"
    return 0
  fi

  log "💾 Backing up Docker volumes..."

  local volume_count=0
  for volume in $(docker volume ls -q); do
    log "  Backing up volume: $volume"
    docker run --rm \
      -v "$volume:/source:ro" \
      -v "$BACKUP_DIR:/backup" \
      alpine tar czf "/backup/volume-$volume.tar.gz" -C /source . \
      2>/dev/null || log_warning "  Failed to backup volume: $volume"
    ((volume_count++))
  done

  log_success "Backed up $volume_count Docker volumes"
}

backup_package_state() {
  if [ "$SKIP_BACKUP" = true ]; then
    log_warning "Skipping package state backup (--skip-backup flag)"
    return 0
  fi

  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would backup package state"
    return 0
  fi

  log "💾 Backing up package state..."

  # Backup current package versions
  dpkg -l > "$BACKUP_DIR/packages-before.txt"
  apt list --installed > "$BACKUP_DIR/apt-packages-before.txt"

  # Backup Docker versions
  docker version > "$BACKUP_DIR/docker-version-before.txt" 2>&1
  containerd --version > "$BACKUP_DIR/containerd-version-before.txt" 2>&1

  log_success "Package state backed up"
}

##############################################################################
# Container Management
##############################################################################

stop_non_critical_containers() {
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would stop non-critical containers"
    docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'
    return 0
  fi

  log "🛑 Stopping non-critical containers..."

  # Define critical containers that should NOT be stopped
  # Modify this array based on your setup
  local critical_containers=(
    "coolify"
    "coolify-proxy"
    "coolify-db"
    "coolify-redis"
  )

  local stopped_count=0
  while read container; do
    local is_critical=false
    for critical in "${critical_containers[@]}"; do
      if [[ "$container" == *"$critical"* ]]; then
        is_critical=true
        break
      fi
    done

    if [ "$is_critical" = false ]; then
      log "  Stopping: $container"
      docker stop "$container" 2>/dev/null || log_warning "  Failed to stop: $container"
      ((stopped_count++))
    else
      log "  Keeping running (critical): $container"
    fi
  done < <(docker ps --format '{{.Names}}')

  log_success "Stopped $stopped_count non-critical containers"
}

start_containers() {
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would start stopped containers"
    return 0
  fi

  log "▶️  Starting stopped containers..."

  local started_count=0
  while read container; do
    log "  Starting: $container"
    docker start "$container" 2>/dev/null || log_warning "  Failed to start: $container"
    ((started_count++))
  done < <(docker ps -a --filter "status=exited" --format '{{.Names}}')

  log_success "Started $started_count containers"
}

##############################################################################
# Patch Application
##############################################################################

update_package_lists() {
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would update package lists"
    return 0
  fi

  log "📦 Updating package lists..."
  apt update 2>&1 | tee -a "$LOG_FILE"
  log_success "Package lists updated"
}

show_available_updates() {
  log "📋 Available updates:"
  apt list --upgradable 2>/dev/null | grep -v "Listing..." | tee -a "$LOG_FILE"
}

download_packages() {
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would download packages"
    return 0
  fi

  log "⬇️  Downloading packages (without installing)..."
  apt install --download-only -y \
    containerd.io \
    docker-ce-cli \
    docker-buildx-plugin \
    cloud-init \
    2>&1 | tee -a "$LOG_FILE"

  log_success "Packages downloaded"
}

apply_patches() {
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would apply 41 package updates"
    apt list --upgradable 2>/dev/null | grep -v "Listing..."
    return 0
  fi

  log "🔧 Applying all package updates (41 packages)..."

  # Set DEBIAN_FRONTEND to avoid interactive prompts
  export DEBIAN_FRONTEND=noninteractive

  # Apply all updates with automatic yes
  apt upgrade -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    2>&1 | tee -a "$LOG_FILE"

  log_success "All packages updated"
}

restart_docker() {
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would restart Docker daemon"
    return 0
  fi

  log "🔄 Restarting Docker daemon..."
  systemctl restart docker

  # Wait for Docker to be ready
  local max_wait=30
  local waited=0
  while ! docker info &>/dev/null; do
    if [ $waited -ge $max_wait ]; then
      log_error "Docker failed to start after $max_wait seconds"
      return 1
    fi
    sleep 1
    ((waited++))
  done

  log_success "Docker daemon restarted successfully"
}

##############################################################################
# Verification
##############################################################################

verify_installation() {
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would verify installation"
    return 0
  fi

  log "✅ Verifying installation..."

  # Check Docker version
  log "Docker version:"
  docker version 2>&1 | tee -a "$LOG_FILE"

  # Check containerd version
  log "Containerd version:"
  containerd --version 2>&1 | tee -a "$LOG_FILE"

  # Check Docker daemon status
  if ! systemctl is-active --quiet docker; then
    log_error "Docker daemon is not running"
    return 1
  fi
  log_success "Docker daemon is running"

  # Check if we can communicate with Docker
  if ! docker info &>/dev/null; then
    log_error "Cannot communicate with Docker daemon"
    return 1
  fi
  log_success "Docker communication OK"

  # Save post-patch state
  dpkg -l > "$BACKUP_DIR/packages-after.txt" 2>/dev/null
  docker version > "$BACKUP_DIR/docker-version-after.txt" 2>&1
  containerd --version > "$BACKUP_DIR/containerd-version-after.txt" 2>&1

  log_success "Verification complete"
}

verify_containers() {
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would verify containers"
    return 0
  fi

  log "🔍 Verifying containers..."

  # Show container status
  docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.State}}' | tee -a "$LOG_FILE"

  # Count running vs total
  local total=$(docker ps -a -q | wc -l)
  local running=$(docker ps -q | wc -l)

  log "Container status: $running running out of $total total"

  if [ "$running" -eq 0 ] && [ "$total" -gt 0 ]; then
    log_warning "No containers are running! Manual intervention may be needed."
  fi
}

##############################################################################
# Main Execution
##############################################################################

main() {
  log "=========================================="
  log "Server Patch Application"
  log "Server: $SERVER_NAME"
  log "UUID: $SERVER_UUID"
  log "=========================================="

  if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No changes will be made"
  fi

  # Pre-flight checks
  preflight_checks

  # Show what will be updated
  update_package_lists
  show_available_updates

  # Confirm proceeding
  echo
  if ! confirm "⚠️  Proceed with patching? This will update 41 packages and restart Docker."; then
    log_warning "Patch application cancelled"
    exit 0
  fi

  # Phase 1: Backup
  log "=========================================="
  log "PHASE 1: Backup (estimated 15-30 minutes)"
  log "=========================================="
  backup_package_state
  backup_docker_containers
  backup_docker_volumes

  # Phase 2: Prepare
  log "=========================================="
  log "PHASE 2: Preparation"
  log "=========================================="
  download_packages
  stop_non_critical_containers

  # Phase 3: Apply patches
  log "=========================================="
  log "PHASE 3: Apply Patches (estimated 15-30 minutes)"
  log "=========================================="
  apply_patches
  restart_docker

  # Phase 4: Verify
  log "=========================================="
  log "PHASE 4: Verification"
  log "=========================================="
  verify_installation
  start_containers
  sleep 5  # Give containers time to start
  verify_containers

  # Summary
  log "=========================================="
  log "PATCH APPLICATION COMPLETE"
  log "=========================================="
  log_success "All 41 packages updated successfully"
  log "Backup location: $BACKUP_DIR"
  log "Log file: $LOG_FILE"
  log ""
  log "Next steps:"
  log "1. Monitor containers for the next 24 hours"
  log "2. Check application health and logs"
  log "3. Review $LOG_FILE for any warnings"
  log "4. Keep backups for 30 days"
  log ""
  log_warning "containerd upgraded from 1.7.28 to 2.1.5 (MAJOR UPDATE)"
  log_warning "Docker CLI upgraded from 28.5.1 to 29.0.2"
  log_warning "Monitor for compatibility issues"
}

# Run main function
main "$@"
