import {handler} from "./handler-load-test";

(async ()=>{
  await handler({
    url: `http://localhost:3001/session/info?path=cleancode-tester`,
    uploadPath: 'test.html',
    objectUrl: 'https://some.url'
  }, <any>{})
})()
