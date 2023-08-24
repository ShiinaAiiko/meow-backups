#! /bin/bash
allowMethods=("run noConsoleLinux copyUpdateFile noConsoleWin stop")
command=${@:2}

noConsoleLinux() {
  echo "-> 开始执行服务"

  nohup ./bin/meow-backups-core $command >/dev/null 2>&1 &
}

run() {
  echo "-> 开始执行服务"

  ./meow-backups-core $command
  # ./bin/meow-backups-core $command
}

copyUpdateFile() {
  echo "-> 开始执行服务"

  ./temp_meow-backups -copy-update-file
}

noConsoleWin() {
  echo "-> 开始执行服务"

  ./meow-backups $command
}

stop() {
  ./meow-backups -stop
}

main() {
  if echo "${allowMethods[@]}" | grep -wq "$1"; then
    "$1" "$@"
  else
    echo "Invalid command: $1"
  fi
}
main "$1"
