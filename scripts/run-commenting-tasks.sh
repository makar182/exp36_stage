#!/usr/bin/env bash
set -uo pipefail

DOC_PATH="docs/commenting-tasks.md"

if [[ ! -f "${DOC_PATH}" ]]; then
  echo "Не найден файл со списком задач: ${DOC_PATH}" >&2
  exit 1
fi

echo "🚀 Запуск задач по комментированию кода"
echo

mapfile -t tasks < <(sed -n -E 's/^- \[[^]]*\] `([^`]+)` — (.*)$/\1\t\2/p' "${DOC_PATH}")

counter=0
for task in "${tasks[@]}"; do
  ((counter++))
  file_path="${task%%$'\t'*}"
  task_description="${task#*$'\t'}"
  printf "%2d. %s\n    ↳ %s\n\n" "${counter}" "${file_path}" "${task_description}"
done

echo "Всего задач запущено: ${counter}"
