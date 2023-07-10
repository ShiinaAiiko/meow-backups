package middleware

import (
	"os"
	"path/filepath"

	"github.com/cherrai/nyanyago-utils/nfile"
	"github.com/gin-gonic/gin"
)

func StaticFSMiddleware(staticPath string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if _, isWsServer := c.Get("StaticServer"); isWsServer {
			ex, err := os.Executable()
			if err != nil {
				panic(err)
			}
			exPath := filepath.Dir(ex)
			folderPath := exPath
			if filepath.Base(exPath) == "tmp" || filepath.Base(exPath) == "bin" {
				folderPath = filepath.Dir(exPath)
			}
			// log.Info(folderPath)

			// log.Info(c.Request.URL.Path)
			// log.Info(path.Join(folderPath, "./static", c.Request.URL.Path))
			filePath := filepath.Join(folderPath, staticPath, c.Request.URL.Path)
			log.Info("Static File => ",
				c.Request.URL.Path, nfile.IsExists(filePath))
			// log.Info(filePath, nfile.IsExists(filePath))
			if nfile.IsExists(filePath) {
				// if nfile.IsDir(filePath) {
				// 	c.Abort()
				// 	return
				// }
				c.File(filePath)
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
