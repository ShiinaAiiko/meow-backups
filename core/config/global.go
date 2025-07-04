package conf

import (
	"github.com/ShiinaAiiko/meow-backups/services/encryption"

	"github.com/cherrai/nyanyago-utils/neventListener"
	"github.com/cherrai/nyanyago-utils/nsocketio"
)

var SocketIO *nsocketio.NSocketIO

var EncryptionClient *encryption.EncryptionOption

var TraybarEvent *neventListener.NEventListener[neventListener.H]
