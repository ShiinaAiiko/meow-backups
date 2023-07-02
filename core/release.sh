#! /bin/bash
name="saass"
port=16100
branch="main"

version="v1.0.0"
gitRev=$(git rev-parse --short HEAD)
buildTime=$(date +'%Y-%m-%d_%T')

configFilePath="config.pro.json"
DIR=$(cd $(dirname $0) && pwd)
allowMethods=("build buildlinux buildwin ls stop remove gitpull protos dockerremove start logs")
packageName="github.com/ShiinaAiiko/meow-backups/config"

# buildwin() {
#   # main.exe --config config.linux.json
#   # CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build test.go
#   # CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build main.go -ldflags="-H windows"
#   # CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o hello.exe test.go
#   # CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build .

#   # // https://learnku.com/articles/71107
#   # versioninfo.json
#   # go generate
#   # 管理员加 app.manifest

#   # CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build main.go -ldflags "-H windowsgui"
#   # CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build main.go -ldflags "-H windowsgui"
# }

buildlinux() {
  echo "-> 正在编译 Linux 应用"
  rm -rf ../build/meow-backups
  rm -rf ../build/bin/meow-backups-core
  rm -rf ../build/bin/meow-backups-upgrade

  echo "-> 正在编译核心程序"
  CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build \
    -ldflags "\
  -X $packageName.Version=${version} \
  -X $packageName.Platform=linux-amd64-x64 \
  -X $packageName.GitRev=${gitRev} \
  -X $packageName.BuildTime=${buildTime}" \
    -o ../build/bin/meow-backups-core \
    ./main.go
  echo "-> 核心程序已完成"

  # go tool nm build/example2 | grep -i version
  echo "-> 正在编译守护程序"
  CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build \
    -ldflags "\
  -X $packageName.Version=${version} \
  -X $packageName.Platform=linux-amd64-x64 \
  -X $packageName.GitRev=${gitRev} \
  -X $packageName.BuildTime=${buildTime}" \
    -o ../build/meow-backups ./run/main.go
  echo "-> 守护程序已完成"

  echo "-> 正在编译升级程序"
  CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build \
    -ldflags "\
  -X $packageName.Version=${version} \
  -X $packageName.Platform=linux-amd64-x64 \
  -X $packageName.GitRev=${gitRev} \
  -X $packageName.BuildTime=${buildTime}" \
    -o ../build/bin/meow-backups-upgrade ./upgrade/main.go
  echo "-> 升级程序已完成"

}

buildwin() {
  echo "-> 正在编译 Windows 应用"
  # go:generate goversioninfo -icon=icon.ico -64=true -manifest=app.manifest
  rm -rf ../build/meow-backups*.exe
  rm -rf ../build/bin/meow-backups-core*.exe
  rm -rf ../build/bin/meow-backups-upgrade*.exe
  # rm -rf ./resource.syso
  # rm -rf ./versioninfo.json
  # rm -rf ./icon.ico
  # rm -rf ./resource.syso
  # rm -rf ./icon.ico

  # CGO_ENABLED=0 GOOS=windows GOARCH=386 go build .
  # mv meow-backups.exe ../build/meow-backups.exe

  echo "-> 正在编译核心程序"
  CGO_ENABLED=0 GOOS=windows GOARCH=amd64 \
    go build \
    -ldflags "\
  -H=windowsgui \
  -X $packageName.Version=${version} \
  -X $packageName.Platform=linux-amd64-x64 \
  -X $packageName.GitRev=${gitRev} \
  -X $packageName.BuildTime=${buildTime}" \
    -o ../build/bin/meow-backups-core.exe \
    ./main.go

  echo "-> 核心程序已完成"

  cd ./run
  rm -rf ./icon.ico
  cp -r ../../web/public/icons/icon.ico ./icon.ico
  # cp -r ./run/versioninfo.json ./versioninfo.json
  go generate

  echo "-> 正在编译守护程序"
  CGO_ENABLED=0 GOOS=windows GOARCH=amd64 \
    go build \
    -ldflags "\
  -X $packageName.Version=${version} \
  -X $packageName.Platform=linux-amd64-x64 \
  -X $packageName.GitRev=${gitRev} \
  -X $packageName.BuildTime=${buildTime}" \
    .

  mv ./run.exe ../../build/meow-backups.exe
  rm -rf ./resource.syso
  rm -rf ./icon.ico
  cd ..
  echo "-> 守护程序已完成"

  echo "-> 正在编译升级程序"
  CGO_ENABLED=0 GOOS=windows GOARCH=amd64 \
    go build \
    -ldflags "\
  -X $packageName.Version=${version} \
  -X $packageName.Platform=linux-amd64-x64 \
  -X $packageName.GitRev=${gitRev} \
  -X $packageName.BuildTime=${buildTime}" \
    -o ../build/bin/meow-backups-upgrade.exe \
    ./upgrade/main.go
  echo "-> 升级程序已完成"

  # CGO_ENABLED=0 GOOS=windows GOARCH=amd64 \
  #   go build \
  #   -ldflags -H=windowsgui \
  #   -o ../build/bin/meow-backups-core.exe main.go

  # CGO_ENABLED=0 GOOS=windows GOARCH=amd64 \
  #   go build \
  #   -o ../build/bin/meow-backups-core.exe main.go
  # rm -rf ./resource.syso
}

build() {
  # rm -rf /mnt/hgfs/Downloads/apps/build/*
  mkdir -p ../build/bin
  mkdir -p ../build/config
  rm -rf ../build/config/config*.json
  cp -r ./run/config.pro.json ../build/config
  buildlinux
  buildwin
  # cd ../run
  # ./release.sh buildlinux
  # ./release.sh buildwin
  # cd ../core

  # cp -r /home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/shiina_aiiko/meow-backups/build/* /mnt/hgfs/Downloads/apps/build
  # rm -rf /mnt/hgfs/Downloads/apps/build/user

  rm -rf ../build/bin/run.sh
  cp -r ./run/run.sh ../build/bin/run.sh
  echo "-> Golang编译完毕"
}

gitpull() {
  echo "-> 正在拉取远程仓库"
  git reset --hard
  git pull origin $branch
}

dockerremove() {
  echo "-> 删除无用镜像"
  docker rm $(docker ps -q -f status=exited)
  docker rmi -f $(docker images | grep '<none>' | awk '{print $3}')
}

start() {
  echo "" >>./conf.json
  echo "-> 正在启动「${name}」服务"
  # gitpull
  dockerremove

  echo "-> 正在准备相关资源"
  # 获取npm配置
  DIR=$(cd $(dirname $0) && pwd)
  cp -r ~/.ssh $DIR
  cp -r ~/.gitconfig $DIR

  echo "-> 准备构建Docker"
  docker build \
    -t $name \
    $(cat /etc/hosts | sed 's/^#.*//g' | grep '[0-9][0-9]' | tr "\t" " " | awk '{print "--add-host="$2":"$1 }' | tr '\n' ' ') . \
    -f Dockerfile.multi
  rm -rf $DIR/.ssh
  rm -rf $DIR/.gitconfig

  echo "-> 准备运行Docker"
  remove

  docker run \
    -v $DIR/static:/static \
    -v $DIR/conf.json:/conf.json \
    -v $DIR/$configFilePath:/config.json \
    --name=$name \
    $(cat /etc/hosts | sed 's/^#.*//g' | grep '[0-9][0-9]' | tr "\t" " " | awk '{print "--add-host="$2":"$1 }' | tr '\n' ' ') \
    -p $port:$port \
    --restart=always \
    -d $name
}

ls() {
  start
  logs
}

stop() {
  docker stop $name
}

remove() {
  docker stop $name
  docker rm $name
}

protos() {
  echo "-> 准备编译Protobuf"
  cp -r ../protos $DIR/protos_temp

  rm -rf $DIR/protos/*.pb.go
  cd ./protos_temp && protoc --go_out=../protos *.proto

  rm -rf $DIR/protos_temp

  echo "-> 编译Protobuf成功"
}

logs() {
  docker logs -f $name
}

main() {
  if echo "${allowMethods[@]}" | grep -wq "$1"; then
    "$1"
  else
    echo "Invalid command: $1"
  fi
}

main "$1"
