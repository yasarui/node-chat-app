const generateMessage = (username,text) => {
    const obj = {
        username,
        text,
        createdAt: new Date().getTime()
    }
    return obj;
}

const generateLocationMessage = (username,url) => {
   return {
       username,
       url,
       createdAt: new Date().getTime()
   }
}

module.exports = {
    generateMessage
}