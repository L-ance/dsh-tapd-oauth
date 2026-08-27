# dsh-tapd-mcp

DeepSeek Harness Web 的 TAPD MCP 设置插件。在 DSH 的“设置”页面填写 TAPD 地址和访问令牌，插件会按下列等价配置启动 MCP：

- 源码仓库：<https://github.com/L-ance/dsh-tapd-oauth>
- Release 下载：<https://github.com/L-ance/dsh-tapd-oauth/releases>

```json
{
  "mcpServers": {
    "mcp-server-tapd": {
      "command": "uvx",
      "args": ["mcp-server-tapd"],
      "env": {
        "TAPD_ACCESS_TOKEN": "<由 DSH 凭据存储注入>",
        "TAPD_API_BASE_URL": "https://api.tapd.cn",
        "TAPD_BASE_URL": "https://www.tapd.cn"
      }
    }
  }
}
```

这个版本不包含企业微信扫码或 OAuth。企业微信登录与 `mcp-server-tapd` 的 Token 认证不是同一件事；如果 DSH 本身需要企业微信 SSO，应由 DSH 的访问入口、反向代理或统一身份认证层单独处理。

## 工作方式

- TAPD Token 由 `ctx.credentials` 管理，不写入普通设置或浏览器 RPC 返回值。
- TAPD 地址和启用状态存放在 DSH settings 的 `tapd-mcp` namespace。
- 启用 MCP 且 Token 已配置后，插件启动 `uvx mcp-server-tapd`。
- 地址、Token 或 MCP 启用状态变化时，插件会自动重启或停止 MCP 子进程。
- MCP 启动错误会显示在 TAPD 设置区域，但错误文本会脱敏当前 Token。

## 前置条件

- Node.js `^22.19.0` 或 `>=24.0.0`
- `uvx` 可从启动 DSH 的 shell 中执行
- 一个有效的 TAPD Access Token
- 使用 DeepSeek Harness 源码方式时需要 pnpm；使用 npx 方式不需要预先安装 pnpm

先确认：

```bash
node --version
uvx --version
```

## 获取插件包

插件通过 GitHub Releases 发布。可以在浏览器下载，也可以执行：

```bash
curl -fL https://github.com/L-ance/dsh-tapd-oauth/releases/download/v0.3.0/dsh-tapd-mcp-0.3.0.tgz \
  -o ~/Downloads/dsh-tapd-mcp-0.3.0.tgz
```

安装命令使用本机 `.tgz` 的绝对路径；不要解压安装包。下载完成后可校验：

```bash
shasum -a 256 ~/Downloads/dsh-tapd-mcp-0.3.0.tgz
```

`v0.3.0` 的 SHA-256 应为 Release 页面记录的值。

## 安装方式一：DeepSeek Harness 源码

适用于已经克隆 DeepSeek Harness 源码、平时使用 `pnpm dsh web` 启动的环境。在 DeepSeek Harness 源码仓库根目录执行：

```bash
pnpm dsh plugin --profile web add ~/Downloads/dsh-tapd-mcp-0.3.0.tgz
pnpm dsh web
```

## 安装方式二：npx

适用于没有 DeepSeek Harness 源码仓库的环境。npx 会临时获取官方 `@deepseek-ai/dsh` CLI，插件和 profile 仍保存在用户的 DSH Home 中：

```bash
npx --yes @deepseek-ai/dsh@latest plugin --profile web add ~/Downloads/dsh-tapd-mcp-0.3.0.tgz
npx --yes @deepseek-ai/dsh@latest web
```

为了避免不同命令使用不同 CLI 版本，也可以把 `latest` 替换成明确版本，例如当前验证过的 `0.1.1-rc.2`。

## 从旧版升级

如果已经安装 `dsh-tapd-wecom`，先用与你启动 DSH 相同的方式移除旧插件。

源码方式：

```bash
pnpm dsh plugin --profile web remove dsh-tapd-wecom
```

npx 方式：

```bash
npx --yes @deepseek-ai/dsh@latest plugin --profile web remove dsh-tapd-wecom
```

移除后，再按上面对应的安装方式添加 `dsh-tapd-mcp-0.3.0.tgz`。

## 设置 TAPD

使用 `pnpm dsh web` 或 `npx --yes @deepseek-ai/dsh@latest web` 启动后：

1. 进入“设置”。
2. 找到“TAPD MCP”。
3. TAPD 地址填写 `https://www.tapd.cn`。
4. TAPD API 地址填写 `https://api.tapd.cn`。
5. 输入新生成的 TAPD Access Token。
6. 勾选“启用 TAPD MCP”，点击“保存”。
7. 状态显示“运行中”后，TAPD MCP 工具即可由 DSH 使用。

Token 输入框是只写的：页面只显示“已配置/未配置”，不会把已保存的 Token 回传浏览器。留空保存表示保留原 Token；“清除 Token”会在确认保存后删除它。

## 从源码构建 Release 包

维护者在本插件仓库根目录执行：

```bash
pnpm install
pnpm check
pnpm pack
shasum -a 256 dsh-tapd-mcp-0.3.0.tgz
```

`pnpm check` 会依次执行类型检查、测试和干净构建；`pnpm pack` 生成上传到 Git Release 的 `.tgz` 资产。

## 默认插件配置

安装包中的 `cordis.patch.yml` 会写入：

```yaml
- insert:
    - id: tapd-mcp
      name: dsh-tapd-mcp
      config:
        tapdTokenRef: TAPD_ACCESS_TOKEN
        mcpCommand: uvx
        mcpArgs:
          - mcp-server-tapd
```

不要把 Token 写进这个文件。`tapdTokenRef` 是凭据名称，不是 Token 值。

## 修复 `.credentials.yaml` 启动错误

当前 DSH 的 `$DSH_HOME/.credentials.yaml` 使用版本化结构，`version` 必须位于顶层并且是数字 `1`：

```yaml
version: 1

refs:
  TAPD_ACCESS_TOKEN: "替换为新 Token"
```

不要写成下面两种形式：

```yaml
# 错误：version 被放进 refs，解析器会要求凭据值必须是字符串
refs:
  version: 1

# 错误：version 是字符串
version: "1"
```

通常不需要手工编辑这个文件，推荐修正文件结构后，在 DSH 设置页保存 Token。若手工编辑，确保权限为：

```bash
chmod 600 ~/.dsh/.credentials.yaml
```

## 常见问题

### 安装时出现 `ECONNRESET`

`ping` 不通不能说明 HTTPS 不通；registry 服务可能禁用了 ICMP。既然 `curl -I https://registry.npmmirror.com` 返回 `200`，直接在安装命令前加：

```bash
npm_config_registry=https://registry.npmmirror.com
```

### 设置页显示 MCP 启动失败

依次检查：

```bash
command -v uvx
uvx --version
```

然后确认启动 DSH 的 shell 能访问 Python 包源和 TAPD API。首次运行 `uvx mcp-server-tapd` 可能需要下载包。

### 页面显示 Token 只读

如果启动 DSH 的环境变量里已经设置 `TAPD_ACCESS_TOKEN`，环境变量优先级最高，设置页不能覆盖它。请在启动环境中修改/移除该变量并重启 DSH，或者继续使用环境变量作为凭据来源。

## 安全提示

- 不要在聊天、截图、仓库、命令历史或普通 JSON/YAML 配置中粘贴真实 Token。
- 一旦 Token 被公开，立即在 TAPD 中撤销并重新生成。
- `.credentials.yaml` 是同一操作系统用户可读的本地文件；它避免浏览器和普通设置回传机密，但不是系统钥匙串级别的隔离。
