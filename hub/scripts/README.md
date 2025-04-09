# GitHub Pages 部署脚本

本目录包含用于将项目部署到GitHub Pages的脚本和工作流。

## 自动部署（GitHub Actions）

该项目配置了GitHub Actions工作流，会自动将代码部署到GitHub Pages。

### 工作原理

- 每当代码推送到主分支（默认配置为`main`分支）时，会触发部署工作流
- GitHub Actions会自动将代码部署到`gh-pages`分支
- GitHub Pages会从`gh-pages`分支获取内容并发布

### 配置文件

自动部署配置在项目根目录的`.github/workflows/deploy-to-gh-pages.yml`文件中。

## 手动部署

如果您需要手动部署网站，可以使用`deploy-to-gh-pages.sh`脚本。

### 使用方法

1. 确保您已安装Git和Bash（Linux/Mac自带，Windows需要安装Git Bash）
2. 在项目根目录执行以下命令：

```bash
# Linux/Mac
./scripts/deploy-to-gh-pages.sh

# Windows (Git Bash)
bash scripts/deploy-to-gh-pages.sh
```

3. 按照脚本提示操作

### 注意事项

- 脚本会将当前分支的内容部署到`gh-pages`分支
- 部署前请确保您已提交所有重要更改
- 部署过程中会创建临时文件和分支，请不要中断脚本执行

## GitHub Pages设置

要查看部署的网站，请确保已在GitHub仓库设置中启用GitHub Pages：

1. 在GitHub上打开仓库
2. 进入"Settings" > "Pages"
3. 在"Source"下选择`gh-pages`分支
4. 保存设置

部署完成后，您的网站将在以下地址可访问：
`https://[您的用户名].github.io/[仓库名]/` 