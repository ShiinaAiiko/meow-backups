#! /bin/bash
allowMethods=("zipwin ziplinux protos build buildwin buildlinux")

# configBuildJson="config.build.dev.json"
configBuildJson="config.build.pro.json"

data=$(cat ./$configBuildJson | sed -r 's/",/"/' | egrep -v '^[{}]' | sed 's/"//g' | sed 's/ //g' | sed 's/:/=/1')
declare $data

# configBuildJson="config.build.pro.json"
# versionDownloadUrl="http://192.168.204.132:16100/api/v1/share?path=/meow-backups&sid=FqZY6hzQNb&pwd="
# versionDownloadUrl="http://192.168.204.132:16100/api/v1/share?path=/meow-backups&sid=FqZY6hzQNb&pwd="
# version="v1.0.1"
DIR=$(cd $(dirname $0) && pwd)

protos() {
  cd $DIR/web && bash ./release.sh protos
  cd $DIR/core && bash ./release.sh protos
}

ziplinux() {
  cd ./build
  zip -r -q ./meow-backups-$version-linux-amd64-x64.zip \
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
  zip -r -q ./meow-backups-$version-win-amd64-x64.zip \
    ./static \
    ./config \
    ./bin/meow-backups-core.exe \
    ./bin/meow-backups-upgrade.exe \
    ./bin/meow-backups.exe \
    ./meow-backups.exe
  cd ..
}

build() {
  echo "-> $version"
  # echo $name
  # echo $versionDownloadUrl
  # sed -i "s/\"version\":.*$/\"version\":\"$version\",/" ./package.json

  # rm -rf /home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/cherrai/SAaSS/server/static/storage/2023/06/29/39a8a0baac358b407752ceb3bb08a46c.zip
  # rm -rf /home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/cherrai/SAaSS/server/static/storage/2023/06/28/505562ec20a71da96cba13b82b5b4fb9.zip

  mkdir -p ./build/packages
  cp -r ./build/$name*.zip ./build/packages/
  rm -rf ./build/*.zip

  rm -rf ./build/static
  rm -rf ./build/meow-backups
  rm -rf ./build/meow-backups.exe
  rm -rf ./build/config.json
  rm -rf ./build/bin

  mkdir -p ./build
  protos
  cd $DIR/core && bash ./release.sh build $version $versionDownloadUrl
  cd $DIR/web && bash ./release.sh build $version
  cd ..

  # cp -r /home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/shiina_aiiko/meow-backups/build/* /mnt/hgfs/Downloads/apps/build
  # rm -rf /mnt/hgfs/Downloads/apps/build/user

  echo "-> 创建ZIP"
  ziplinux
  zipwin

  # cp -r ./build/meow-backups-v1.0.1-linux-amd64-x64.zip /home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/cherrai/SAaSS/server/static/storage/2023/06/29/39a8a0baac358b407752ceb3bb08a46c.zip
  # cp -r ./build/meow-backups-v1.0.1-win-amd64-x64.zip /home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/cherrai/SAaSS/server/static/storage/2023/06/28/505562ec20a71da96cba13b82b5b4fb9.zip
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
