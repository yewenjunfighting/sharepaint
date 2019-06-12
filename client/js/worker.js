self.addEventListener('message', (event)=>{
    console.log(`${event.data} from ${event.origin}`)
    // do something
    // ...
    self.postMessage('down')
    self.close()
})
