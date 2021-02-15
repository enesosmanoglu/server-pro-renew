let wrap = document.querySelector("#wrap")
let app = document.querySelector("#app")
app.style.visibility = "hidden"
let renew = document.querySelector(".margin-tiny .action")
document.body.style.overflow = "hidden"
let expires = document.querySelector(".margin-tiny div")
expires.querySelector('p').style = "font-size: 32px;"
let content;

Renew()
function Renew() {
renew.click()

setTimeout(()=>{
    if (content)
        content.remove()

    content = document.querySelector(".modal")
    //app.appendChild(content)
    content.style = "position:fixed ;width: 100%; height: 100%; padding:10px 0px; margin:0; display:flex; flex-direction: column; align-items: center; "
    content.className = ""
    let titlebar = content.querySelector(".titlebar")
    titlebar.style.visibility = "hidden"
    document.body.insertBefore(content,app)
    content.insertBefore(expires,titlebar)

},3000)



}

expires.addEventListener("DOMCharacterDataModified", function (event) { 
    console.log(expires.innerText)
    document.title = expires.innerText.replace("Expires in ","")
    if (expires.innerText == "Expires in 59 m.") {

        Renew()

    }
}, false);