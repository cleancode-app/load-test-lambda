import http from 'k6/http';
import {check, sleep} from "k6";
//import {htmlReport} from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import {htmlReport} from "https://raw.githubusercontent.com/cleancode-app/k6-reporter/main/dist/bundle.js";

export let options = {
    stages: [
        {duration: "60s", target: 25},
        {duration: "60s", target: 25},
        {duration: "60s", target: 0}
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
    }
};

export function handleSummary(data) {
    return {
        [__ENV.FILE]: htmlReport(data, {
            title: `CleanCode Load Test ${new Date().toLocaleDateString('en-AU')} ${new Date().toLocaleTimeString('en-AU')}`, 
            url: __ENV.URL
        }),
    };
}

export default function () {
    let res = http.get(__ENV.URL);
    check(res, {'status was 200': (r) => r.status == 200});
    sleep(1)
}
