import express,{ Router,Request,Response } from "express"
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const { uploadFile, getFileStream } = require('../controllers/s3Controller')

const s3Routes:Router=express.Router()

s3Routes.get('/images/:key', (req:Request, res:Response) => {
  console.log(req.params)
  const key = req.params.key
  const readStream = getFileStream(key)

  readStream.pipe(res)
})

s3Routes.post('/images', upload.single('image'), async (req:any, res:Response) => {
  const file = req.file
  console.log(file)

  // apply filter
  // resize 

  const result = await uploadFile(file)
  await unlinkFile(file.path)
  console.log(result)
  const description = req.body.description
  res.send({key: `${result.Key}`})
})

export default s3Routes;