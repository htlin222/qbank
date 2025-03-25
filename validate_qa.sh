#!/bin/bash
# title: "validate_qa"
# author: Hsieh-Ting Lin
# date: "2025-03-25"
# version: 1.0.0
# description:
# --END-- #
set -ue
set -o pipefail

QA_DIR="./public/qabank"
EXPECTED_FILES=("correct_answer.txt" "explain.txt" "option_A.txt" "option_B.txt" "option_C.txt" "option_D.txt" "option_E.txt" "question.txt")

total_dirs=0
missing_files_dirs=0
renamed_files=0
missing_dirs=()

# 確保目錄存在
if [[ ! -d "$QA_DIR" ]]; then
  echo "❌ 目錄 $QA_DIR 不存在"
  exit 1
fi

# 遞迴查找所有數字命名的資料夾並排序
dirs=($(find "$QA_DIR" -type d | grep -E "/[0-9]+$" | sort -V))

for dir in "${dirs[@]}"; do
  ((total_dirs++))
  missing_files=0

  # 檢查是否有缺少的 .txt 檔案
  for file in "${EXPECTED_FILES[@]}"; do
    if [[ ! -f "$dir/$file" ]]; then
      missing_files=1
      break # 發現缺少的檔案即跳出
    fi
  done

  if ((missing_files > 0)); then
    missing_dirs+=("$dir")
    ((missing_files_dirs++))
  fi

  # 檢查並修正檔名（處理 .esp 及圖片）
  find "$dir" -type f | while read -r file; do
    filename=$(basename "$file")
    if [[ "$filename" =~ \  ]]; then
      new_filename="${filename// /_}"
      mv "$file" "$(dirname "$file")/$new_filename"
      echo "✅ 已更正檔名: $(dirname "$file")/$new_filename"
      ((renamed_files++))
    fi
  done
done

# 顯示缺少檔案的目錄（已排序）
if ((missing_files_dirs > 0)); then
  echo "⚠️  缺少檔案的目錄（已排序）:"
  for dir in "${missing_dirs[@]}"; do
    echo "   $dir"
  done
fi

# 統計輸出
echo "📊 檢查結果:"
echo "  🔹 總計檢查數字命名的目錄數量: $total_dirs"
echo "  🔸 缺少必要檔案的目錄: $missing_files_dirs"
echo "  🔹 更改檔名的檔案數量: $renamed_files"

exit 0
