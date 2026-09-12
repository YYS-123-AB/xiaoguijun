# 大学专业介绍站 - 部署教程

## 项目概述

本项目是一个纯前端的大学专业介绍站，包含13大学科门类、200+专业的详细信息，支持筛选、搜索、详情查看、收藏等功能。

## 技术栈

- **前端**：原生 HTML + CSS + JavaScript（无框架）
- **构建工具**：Vite 5.x
- **Node.js**：≥ 18.x
- **部署平台**：GitHub Pages

## 本地开发

### 1. 安装依赖

```bash
cd web25
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 即可查看站点。

### 3. 预览生产构建

```bash
npm run build
npx serve dist
```

## 数据说明

### 数据文件位置

`data/data.json` - 包含200+专业完整信息的JSON文件。

### 数据字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 专业唯一ID |
| name | string | 专业名称 |
| code | string | 6位专业代码 |
| category | string | 学科门类：哲/经/法/教/文/史/理/工/农/医/管/艺/军 |
| degree | string | 授予学位：学士/associate（专科） |
| years | number | 学制年限 |
| popularity | number | 人气指数 1-5 |
| employmentRate | number | 就业率 0-100 |
| avgSalary5y | number | 毕业5年平均月薪（元） |
| isFirstClass | boolean | 是否国家级一流本科专业 |
| isCharacteristic | boolean | 是否国家特色专业 |
| maleRatio | number | 男生比例 0-100 |
| femaleRatio | number | 女生比例 0-100 |
| libRatio | number | 文科比例 0-100 |
| sciRatio | number | 理科比例 0-100 |
| selectSubjects | object | 3+1+2选考科目要求 |
| overview | object | 专业概况：是什么/学什么 |
| coreCourses | array | 15+核心课程列表 |
| employment | object | 就业信息：行业分布/薪资/考研/院校 |
| relatedIds | array | 相关推荐专业ID列表 |

### 数据更新脚本

```bash
npm run fetch
```

脚本会尝试从网络获取最新数据，如果失败则自动生成200条示例数据。

## GitHub Pages 自动部署

### 1. 创建 GitHub 仓库

1. 登录 GitHub，点击右上角「+」→「New repository」
2. 填写仓库名称（如：university-major-intro）
3. 选择 Public，勾选 Initialize this repository with a README
4. 点击 Create repository

### 2. 上传项目代码

```bash
cd web25
git init
git add .
git commit -m "Initial commit: 大学专业介绍站"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

### 3. 配置 GitHub Pages

1. 进入仓库页面，点击「Settings」
2. 左侧菜单找到「Pages」
3. Source 选择「GitHub Actions」
4. 保存配置

### 4. 触发自动部署

项目已配置 `.github/workflows/deploy.yml`，支持以下三种触发方式：

#### 方式一：Push 触发（自动）
每次提交代码到 main/master 分支时自动部署：
```bash
git add .
git commit -m "更新内容"
git push
```

#### 方式二：手动触发（Workflow Dispatch）
1. 进入仓库页面，点击「Actions」
2. 左侧选择「Deploy University Major Site」
3. 点击「Run workflow」→ 选择 main 分支 → 点击「Run workflow」

#### 方式三：定时触发（Cron）
每天北京时间 03:00（UTC 19:00）自动执行：
- 拉取最新数据
- 构建项目
- 部署到 GitHub Pages
- 如有数据更新则提交回仓库

### 5. 查看部署结果

1. 进入仓库「Actions」页面，查看工作流运行状态
2. 等待所有 Jobs 完成（build → deploy → commit-data）
3. 成功后在 Settings → Pages 页面查看访问地址
4. 通常地址格式为：`https://你的用户名.github.io/仓库名/`

## 常见问题

### Q: 本地打开 index.html 报错跨域？
A: 由于使用了 fetch 加载 data.json，必须通过 HTTP 服务器访问。请使用 `npm run dev` 或 `npx serve .`。

### Q: GitHub Pages 部署后 404？
A: 检查 vite.config.js 的 base 配置是否为 `./`，以及仓库 Settings → Pages 的 Source 是否设置为 GitHub Actions。

### Q: 数据显示为空？
A: 检查 data/data.json 文件是否存在且格式正确。可运行 `npm run fetch` 重新生成数据。

### Q: 如何修改主题颜色？
A: 编辑 css/style.css 文件顶部的 CSS 变量（:root 和 [data-theme="dark"]）。

### Q: 如何添加/修改专业数据？
A: 直接编辑 data/data.json 文件，或修改 scripts/fetch-data.js 中的生成逻辑。

## 功能清单

✅ 13学科门类Tab筛选
✅ 专业层次（本科/专科）筛选
✅ 就业热度（热门/冷门/国家特色/新增）筛选
✅ 搜索框（专业名、代码、院校、课程、关键词）
✅ 专业卡片（代码、色标、学位、学制、人气、就业率、薪资、收藏）
✅ Hash路由详情弹窗
✅ 7大详情Tab（概况/课程/就业/薪资/考研/院校/问答）
✅ 男女比例饼图、文理科比例
✅ 3+1+2选考科目要求
✅ 暗/亮主题切换 + localStorage + 系统跟随
✅ 300ms防抖搜索
✅ auto-fill响应式卡片网格
✅ 回到顶部按钮
✅ 空/加载/错误状态
✅ 收藏夹localStorage
✅ CSS进度条百分比可视化
✅ GitHub Actions自动部署
