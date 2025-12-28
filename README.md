# 🏗️ DesignPro AI Assistant
> 專為建築、室內與視覺設計師打造的 AI 智慧助理系統。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![AI-Powered](https://img.shields.io/badge/Engine-Gemini%202.5%20Flash-orange.svg)

## 🌟 核心功能
- **🎙️ 語音決策助理**：透過 Gemini Live API 進行自然對話，管理專案進度與雲端檔案。
- **🗺️ 智慧工作流**：動態生成的專案流程地圖，AI 會根據歷史數據自動優化步驟。
- **🎨 創意實驗室**：內建 Nano Banana 影像生成引擎，支援空間模擬與材質生成。
- **📊 財務中心**：視覺化追蹤專案毛利與應收帳款。
- **✍️ 標註畫板**：支援圖面即時標註並同步至雲端。

## 🚀 快速開始
1. **部署到 GitHub Pages**：
   - 確保已在 GitHub Actions Secrets 中設定 `API_KEY`。
   - 程式碼推送到 `main` 分支後將自動觸發編譯。
2. **本地開發**：
   ```bash
   npm install
   npm run dev
   ```

## 🛠️ 技術架構
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **AI**: Google Gemini SDK (@google/genai)
- **Visuals**: Lucide Icons + Recharts
- **Build**: Vite

---
*Developed for the next generation of creative professionals.*
