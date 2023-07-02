#! /bin/bash
name="meow-backups"
allowMethods=("zipwin ziplinux protos build buildwin buildlinux")

DIR=$(cd $(dirname $0) && pwd)

protos() {
  cd $DIR/web && bash ./release.sh protos
  cd $DIR/core && bash ./release.sh protos
}

ziplinux() {
  cd ./build
  zip -r -q ./meow-backups-v1.0.1-linux-amd64-x64.zip \
    ./static \
    ./config \
    ./bin/meow-backups-core \
    ./bin/run.sh \
    ./bin/meow-backups-upgrade \
    ./meow-backups
  cd ..

}

zipwin() {
  cd ./build
  zip -r -q ./meow-backups-v1.0.1-win-amd64-x64.zip \
    ./static \
    ./config \
    ./bin/meow-backups-core.exe \
    ./bin/meow-backups-upgrade.exe \
    ./bin/meow-backups.exe \
    ./meow-backups.exe
  cd ..
}

build() {
  rm -rf /home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/cherrai/SAaSS/server/static/storage/2023/06/29/39a8a0baac358b407752ceb3bb08a46c.zip
  rm -rf /home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/cherrai/SAaSS/server/static/storage/2023/06/28/505562ec20a71da96cba13b82b5b4fb9.zip

  mkdir -p ./build/packages
  cp -r ./build/*.zip ./build/packages/
  rm -rf ./build/*.zip

  # rm -rf ./build/static
  rm -rf ./build/meow-backups
  rm -rf ./build/meow-backups.exe
  rm -rf ./build/config.json
  rm -rf ./build/bin

  mkdir -p ./build
  # protos
  # cd $DIR/run && bash ./release.sh build
  cd $DIR/core && bash ./release.sh build
  # cd $DIR/web && bash ./release.sh build
  cd ..

  # cp -r /home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/shiina_aiiko/meow-backups/build/* /mnt/hgfs/Downloads/apps/build
  # rm -rf /mnt/hgfs/Downloads/apps/build/user

  ziplinux
  zipwin

  echo "-> 创建ZIP"
  cp -r ./build/meow-backups-v1.0.1-linux-amd64-x64.zip /home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/cherrai/SAaSS/server/static/storage/2023/06/29/39a8a0baac358b407752ceb3bb08a46c.zip
  cp -r ./build/meow-backups-v1.0.1-win-amd64-x64.zip /home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/cherrai/SAaSS/server/static/storage/2023/06/28/505562ec20a71da96cba13b82b5b4fb9.zip
  echo "-> 执行完毕"
}

main() {
  if echo "${allowMethods[@]}" | grep -wq "$1"; then
    "$1"
  else
    echo "Invalid command: $1"
  fi
}

main "$1"
