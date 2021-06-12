require('dotenv').config()

const mongoose = require('mongoose')
const Document = require('../db/Document')

const { PORT } = process.env;


mongoose.connect('mongodb://localhost/docs-db',{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})

const io = require('socket.io')(PORT, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET','POST']
  }
})

const defaultValue = ''

io.on('connection', socket => {
  socket.on('get-document', async documentId => {
    const doc = await findOrCreateDoc(documentId)
    socket.join(documentId)
    socket.emit('load-document', doc.data)

    socket.on('send-changes', delta => {
      socket.broadcast.to(documentId).emit('receive-changes', delta)
    })

    socket.on('save-doc', async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

const findOrCreateDoc = async (id) => {
  if (id == null) return

  const doc = await Document.findById(id)
  if (doc) return doc
  return await Document.create({ _id: id, data: defaultValue })
}
