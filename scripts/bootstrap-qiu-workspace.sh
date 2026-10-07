#!/usr/bin/env bash

set -Eeuo pipefail

WORKSPACE_ROOT="${WORKSPACE_ROOT:-$HOME/src}"
MISE_VERSION="${MISE_VERSION:-2026.7.7}"
UV_VERSION="${UV_VERSION:-0.8.22}"
NODE_VERSION="${NODE_VERSION:-22.23.1}"
PYTHON_VERSION="${PYTHON_VERSION:-3.12}"
INSTALL_DEPS="${INSTALL_DEPS:-1}"
RUN_CHECKS="${RUN_CHECKS:-0}"

SITE_REF="${QIU_SITE_REF:-main}"
CREWLIGHT_REF="${CREWLIGHT_REF:-main}"
MEALCIRCUIT_REF="${MEALCIRCUIT_REF:-main}"

MISE_BIN="$HOME/.local/bin/mise"
UV_BIN="$HOME/.local/bin/uv"

log() {
  printf '\n==> %s\n' "$*"
}

warn() {
  printf '警告：%s\n' "$*" >&2
}

die() {
  printf '错误：%s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "缺少 $1。请先由管理员安装 $2，再重新运行；本脚本不会调用 sudo。"
}

install_user_tools() {
  local temp_dir
  temp_dir="$(mktemp -d)"
  trap 'rm -rf "$temp_dir"' RETURN

  mkdir -p "$HOME/.local/bin"

  if [[ ! -x "$MISE_BIN" ]] || ! "$MISE_BIN" --version | grep -q "^${MISE_VERSION} "; then
    log "安装用户级 mise ${MISE_VERSION}（用于隔离 Node 版本）"
    curl -fsSL https://mise.run -o "$temp_dir/install-mise.sh"
    env \
      MISE_VERSION="v${MISE_VERSION}" \
      MISE_INSTALL_PATH="$MISE_BIN" \
      sh "$temp_dir/install-mise.sh"
  else
    log "mise ${MISE_VERSION} 已存在"
  fi

  if [[ ! -x "$UV_BIN" ]] || [[ "$($UV_BIN --version)" != "uv ${UV_VERSION}" ]]; then
    log "安装用户级 uv ${UV_VERSION}（用于隔离 Python 环境）"
    curl -fsSL "https://astral.sh/uv/${UV_VERSION}/install.sh" -o "$temp_dir/install-uv.sh"
    env \
      UV_INSTALL_DIR="$HOME/.local/bin" \
      UV_NO_MODIFY_PATH=1 \
      sh "$temp_dir/install-uv.sh"
  else
    log "uv ${UV_VERSION} 已存在"
  fi

  trap - RETURN
  rm -rf "$temp_dir"
}

checkout_repo() {
  local name="$1"
  local url="$2"
  local ref="$3"
  local target="$WORKSPACE_ROOT/$name"

  if [[ ! -e "$target" ]]; then
    log "克隆 $name"
    git clone "$url" "$target"
  elif [[ ! -d "$target/.git" ]]; then
    die "$target 已存在但不是 Git 仓库；为避免覆盖，已停止。"
  fi

  if [[ -n "$(git -C "$target" status --porcelain)" ]]; then
    die "$target 有未提交修改；为避免覆盖，已停止。请先提交、暂存或另选 WORKSPACE_ROOT。"
  fi

  log "更新 $name 到 $ref"
  git -C "$target" fetch origin --prune

  if git -C "$target" show-ref --verify --quiet "refs/remotes/origin/$ref"; then
    if git -C "$target" show-ref --verify --quiet "refs/heads/$ref"; then
      git -C "$target" switch "$ref"
    else
      git -C "$target" switch --track -c "$ref" "origin/$ref"
    fi
    git -C "$target" merge --ff-only "origin/$ref"
  elif git -C "$target" rev-parse --verify --quiet "$ref^{commit}" >/dev/null; then
    git -C "$target" switch --detach "$ref"
  else
    die "$name 中找不到版本 $ref。可通过对应的 *_REF 环境变量指定分支、标签或提交。"
  fi
}

install_dependencies() {
  log "安装 Node ${NODE_VERSION}"
  "$MISE_BIN" install "node@${NODE_VERSION}"

  log "恢复个人网站依赖"
  (
    cd "$WORKSPACE_ROOT/qiu-sites"
    "$MISE_BIN" exec "node@${NODE_VERSION}" -- npm ci
  )

  log "恢复 Crewlight 依赖"
  (
    cd "$WORKSPACE_ROOT/Crewlight"
    "$MISE_BIN" exec "node@${NODE_VERSION}" -- corepack pnpm install --frozen-lockfile
  )

  log "恢复 MealCircuit 的 Python 3.12、全部可选功能与开发工具"
  "$UV_BIN" python install "$PYTHON_VERSION"
  (
    cd "$WORKSPACE_ROOT/meal-circuit"
    "$UV_BIN" sync --locked --python "$PYTHON_VERSION" --all-extras --group dev
  )
}

run_checks() {
  log "验证个人网站生产构建"
  (
    cd "$WORKSPACE_ROOT/qiu-sites"
    "$MISE_BIN" exec "node@${NODE_VERSION}" -- npm run build
  )

  log "验证 MealCircuit 测试"
  (
    cd "$WORKSPACE_ROOT/meal-circuit"
    "$UV_BIN" run python -m unittest discover -s tests -v
  )

  log "验证 Crewlight 类型与测试"
  (
    cd "$WORKSPACE_ROOT/Crewlight"
    "$MISE_BIN" exec "node@${NODE_VERSION}" -- corepack pnpm typecheck
    "$MISE_BIN" exec "node@${NODE_VERSION}" -- corepack pnpm test
  )
}

main() {
  case "$(uname -s)" in
    Linux|Darwin) ;;
    *) die "当前只支持 Linux 和 macOS；Windows 上请使用 WSL，或按迁移文档手动恢复。" ;;
  esac

  require_command git "Git"
  require_command curl "curl 与 ca-certificates"
  require_command tar "tar"

  if [[ "$(id -u)" == 0 ]]; then
    warn "当前以 root 运行，工具和项目会写入 $HOME。建议改用普通用户运行，以免产生 root 所有权文件。"
  fi

  mkdir -p "$WORKSPACE_ROOT"
  install_user_tools

  checkout_repo \
    qiu-sites \
    https://github.com/QianQIUlp/qiu-sites.git \
    "$SITE_REF"
  checkout_repo \
    Crewlight \
    https://github.com/QianQIUlp/Crewlight.git \
    "$CREWLIGHT_REF"
  checkout_repo \
    meal-circuit \
    https://github.com/QianQIUlp/meal-circuit.git \
    "$MEALCIRCUIT_REF"

  if [[ "$INSTALL_DEPS" == 1 ]]; then
    install_dependencies
  else
    warn "INSTALL_DEPS=$INSTALL_DEPS，已跳过依赖恢复。"
  fi

  if [[ "$RUN_CHECKS" == 1 ]]; then
    run_checks
  else
    warn "默认未执行完整测试；需要时使用 RUN_CHECKS=1 重新运行本脚本。"
  fi

  log "工作区恢复完成"
  printf '%s\n' \
    "位置：$WORKSPACE_ROOT" \
    "网站开发：cd '$WORKSPACE_ROOT/qiu-sites' && '$MISE_BIN' exec node@${NODE_VERSION} -- npm run dev" \
    "MealCircuit 的私密数据、API 密钥、SSH/GitHub/Codex 凭据未被复制，请按 docs/workspace-migration.md 单独迁移。"
}

main "$@"
