import express from 'express';
import { HistoricEventsProperty, HistoricEvent } from '../db/historic-events';
import { z, ZodError } from 'zod';


export const app: express.Express = express()
app.use(express.json())


const _Friend = z.object({
  friendName: z.string(),
  friendAge: z.number()
})

type Friend = z.infer<typeof _Friend>


const _Menber = z.object({
  name: z.string(),
  age: z.number(),
  friend: z.array(_Friend)
}).strict()

type Event = z.infer<typeof _Menber>


const _Request = z.object({
  request: _Menber
}).strict()

type Request = z.infer<typeof _Request>



const HALF_WIDTH_CHAR_REGEX: RegExp = /^[a-zA-Z0-9!-/:-@¥[-`{-~ ]*$/

app.listen(3000, () => console.log('!!!ポート3000で起動しました!!!'))



//APIの処理を開始
app.post('/qiita_article/article1', function (req, res) {
  try {
    //パース
    const body: Request = _Request.parse(req.body)
    console.log("処理始まり")
    console.log(req.body);

    //半角チェック
    if (!body.request.name.match(HALF_WIDTH_CHAR_REGEX)) {
      console.log("全角エラー")
      res.status(400).json(
        {
          message: "半角英数字記号で入力してください"
        }
      )
    }

    //レスポンスを出力
    res.status(200).json({
      response: {
        yourName: body.request.name,
        yourFriends: body.request.friend
      }
    })

  } catch (e: unknown) {
    console.log(e)
    if (e instanceof ZodError) {
      return res.status(400).json(
        e
      )
    } else {
      return res.status(500).json(
        {
          message: "InternalServerError"
        }
      )
    }
  } finally {
    console.log("処理終わり")
  }
})


//データを取得する関数
function getEventsByLand(land: string, pageSize: number): HistoricEvent | null {
  return HistoricEventsProperty.find((v) => v.land == land) ?? null
}


//エラーテスト用関数
function errorCheck(land: string) {
  if (land == "THROWERROR") {
    throw new Error
  }
}
