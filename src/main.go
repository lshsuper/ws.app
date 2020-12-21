package main

import (
	"fmt"
	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {

	r:=gin.Default()
    r.LoadHTMLGlob("static/views/*.html")

	r.StaticFS("/static",http.Dir("./static"))
	r.GET("/chat",receive)
    r.GET("/client", func(ctx *gin.Context) {

    	ctx.HTML(http.StatusOK,"client.html",nil)
		return

	})
	r.Run(":8080")

}

func receive(ctx *gin.Context)  {

		conn, _, _, err := ws.UpgradeHTTP(ctx.Request, ctx.Writer)

		if err != nil {
			fmt.Println("接收链接失败请重试")
		} else {

			go func() {
				defer conn.Close()
				for {
					msg, op, err := wsutil.ReadClientData(conn)
					if err != nil {
						fmt.Println("断开链接。。。")
						break
					}
					if string(msg)=="ping"{
						wsutil.WriteServerMessage(conn, op, []byte("pong"))
					}else {
						wsutil.WriteServerMessage(conn, op, msg)
					}

				}

			}()
		}



}
