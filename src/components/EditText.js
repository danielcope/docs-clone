import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'


import 'quill/dist/quill.snow.css'


const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTION = [
  [{ header: [1,2,3,4,5,6,false] }],
  [{ font: [] }],
  [{ list: 'ordered' }, { list: 'bullet'} ],
  ['bold', 'italic', 'underline'],
  [{ color: [] }, {background: []}],
  [{ script: 'sub' }, { script: 'super'}],
  [{ align: [] }],
  ['image','blockquote', 'code-block'],
  ['clean']
]



const EditText = () => {
  
  const [socket,setSocket] = useState()
  const [quill,setQuill] = useState()
  const { id:documentId } = useParams()
  console.log(documentId);


  useEffect(()=>{
    if (socket == null || quill == null) return

    socket.once('load-document', document => {
      quill.setContents(document)
      quill.enable()
    })

    socket.emit('get-document', documentId)

  },[socket,quill,documentId])

  useEffect(()=>{
    const s = io('http://localhost:4545')
    setSocket(s)
    return () => {
      s.disconnect()
    }
  }, [])
    
  useEffect(() => {

    if (socket == null || quill == null) return

    const handler = (delta, oldDelta, source) => {
      if ( source !== 'user' ) return
      socket.emit('send-changes', delta)
    }

    quill.on('text-change', handler)
    
    return () => {
      quill.off('text-change', handler )
    }
  },[socket,quill])

  useEffect(() => {

    if (socket == null || quill == null) return
    
    const handler = (delta, oldDelta, source) => {
      quill.updateContents(delta)
    }
    
    socket.on('receive-changes', handler)
    
    return () => {
      socket.off('receive-changes', handler )
    }
  },[socket,quill])
  



  useEffect(() => {
    if (socket == null || quill == null) return
  
    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => clearInterval(interval)

  },[socket,quill])
  




  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return
    
    const editor = document.createElement('div')
    wrapper.innerHTML = ''
    wrapper.append(editor)
    const q = new Quill(editor, { 
      theme:'snow', 
      modules: { toolbar:TOOLBAR_OPTION }
    })
    q.disable(false)
    q.setText('Loading...')
    setQuill(q)
  },[])

  return <div className="container" ref={wrapperRef}></div>

}

export default EditText