// Local DevTools only; isolated profile and synthetic demo URL supplied by capture_demo.py.
const fs=require('node:fs/promises');
const path=require('node:path');
const {spawn}=require('node:child_process');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
  const [edge,profile,url,output,widthArg,heightArg,language]=process.argv.slice(2);
  const browser=spawn(edge,['--headless','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
  let socket;
  try{
    let port;
    for(let i=0;i<160;i++){try{port=(await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{await wait(50);}}
    if(!port)throw Error('Local browser debugging endpoint unavailable');
    const page=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
    socket=new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
    let next=0;const pending=new Map();
    socket.onmessage=event=>{const reply=JSON.parse(event.data);if(pending.has(reply.id)){const {resolve,reject}=pending.get(reply.id);pending.delete(reply.id);reply.error?reject(Error(reply.error.message)):resolve(reply.result);}};
    function send(method,params={}){return new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});}
    const width=Number(widthArg),height=Number(heightArg);
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<700});
    await send('Page.navigate',{url});
    await send('Runtime.evaluate',{awaitPromise:true,expression:`new Promise((resolve,reject)=>{let n=0;const timer=setInterval(()=>{if(document.querySelectorAll('#cards article').length){clearInterval(timer);resolve(true);}else if(++n>100){clearInterval(timer);reject(Error('Demo cards did not load'));}},50);})`});
    if(language==='en')await send('Runtime.evaluate',{awaitPromise:true,expression:'MailPhorI18n.setLanguage("en"); new Promise(resolve=>setTimeout(resolve,100))'});
    const layout=await send('Runtime.evaluate',{returnByValue:true,expression:'({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,cards:document.querySelectorAll("#cards article").length,compact:matchMedia("(max-width:760px)").matches,filtersOpen:document.querySelector("#filter-panel").open})'});
    if(layout.result.value.scrollWidth>width+1)throw Error('Horizontal overflow: '+JSON.stringify(layout.result.value));
    const screenshot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await fs.writeFile(output,Buffer.from(screenshot.data,'base64'));
    console.log('Demo capture '+JSON.stringify(layout.result.value)+' -> '+output);
    await send('Browser.close').catch(()=>{});
  }finally{if(socket)socket.close();browser.kill();}
}
const timeout=setTimeout(()=>{console.error('Browser capture exceeded deadline');process.exit(1);},35000);
main().then(()=>clearTimeout(timeout)).catch(error=>{clearTimeout(timeout);console.error(error.message);process.exitCode=1;});
