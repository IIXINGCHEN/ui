#!/bin/bash

# 定义颜色代码，用于美化输出
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 脚本说明
echo -e "${YELLOW}GitHub Pages 部署脚本${NC}"
echo "这个脚本会将当前目录的内容部署到GitHub Pages。"
echo "确保您已经在仓库根目录执行此脚本。"
echo ""

# 确保我们在正确的目录中（应该有.git目录）
if [ ! -d ".git" ]; then
    echo -e "${RED}错误：未找到.git目录。请在仓库根目录运行此脚本。${NC}"
    exit 1
fi

# 获取当前分支名称
current_branch=$(git symbolic-ref --short HEAD 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}错误：无法获取当前分支名称。${NC}"
    exit 1
fi

echo -e "${GREEN}当前分支：${current_branch}${NC}"
echo "确认您想从此分支部署到GitHub Pages吗？"
read -p "继续部署？ (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "部署已取消。"
    exit 0
fi

# 保存当前工作目录和当前分支
work_directory=$(pwd)
echo -e "${GREEN}正在准备部署...${NC}"

# 检查工作区是否干净
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}警告：您有未提交的更改。${NC}"
    read -p "是否继续？未提交的更改不会被部署 (y/n): " continue_with_changes
    if [ "$continue_with_changes" != "y" ]; then
        echo "部署已取消。"
        exit 0
    fi
fi

# 创建新分支或使用现有的gh-pages分支
echo -e "${GREEN}正在准备gh-pages分支...${NC}"

# 检查远程分支是否存在
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
    echo "远程gh-pages分支已存在，将更新此分支"
    # 检查本地是否有此分支
    if git show-ref --verify --quiet refs/heads/gh-pages; then
        git checkout gh-pages
        git pull origin gh-pages
    else
        git checkout -b gh-pages origin/gh-pages
    fi
else
    echo "创建新的gh-pages分支"
    git checkout --orphan gh-pages
    git rm -rf .
fi

# 回到原始分支，准备复制文件
git checkout ${current_branch}

# 创建临时目录
tmp_dir=$(mktemp -d)
echo -e "${GREEN}创建临时目录: ${tmp_dir}${NC}"

# 复制文件到临时目录
# 复制所有文件，除了.git目录和此脚本所在的scripts目录
rsync -av --exclude='.git' --exclude='scripts' --exclude='.github' --exclude='node_modules' . ${tmp_dir}/

# 切换到gh-pages分支
git checkout gh-pages

# 清空当前目录（保留.git目录）
find . -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} \;

# 复制临时目录中的文件到当前目录
rsync -av ${tmp_dir}/ .

# 删除临时目录
rm -rf ${tmp_dir}

# 添加所有文件到git
git add -A

# 提交更改
commit_message="部署更新 - $(date +'%Y-%m-%d %H:%M:%S')"
git commit -m "${commit_message}"

# 推送到远程
echo -e "${GREEN}正在推送到远程gh-pages分支...${NC}"
git push -u origin gh-pages

# 切回原来的分支
git checkout ${current_branch}

echo -e "${GREEN}部署完成！${NC}"
echo "您的网站将在几分钟内在GitHub Pages上更新。"
echo "请访问 https://[你的用户名].github.io/[你的仓库名]/ 查看您的网站。" 