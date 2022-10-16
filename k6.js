import http from 'k6/http';
import {check, sleep} from "k6";
import {htmlReport} from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export let options = {
    stages: [
        {duration: "5s", target: 5},
        {duration: "5s", target: 10},
        {duration: "5s", target: 15},
        {duration: "5s", target: 20},
        {duration: "5s", target: 25},
        {duration: "5s", target: 30},
        {duration: "5s", target: 35},
        {duration: "5s", target: 40},
        {duration: "5s", target: 45},
        {duration: "5s", target: 50},
        {duration: "60s", target: 50},
        {duration: "60s", target: 0}
    ]
};

export function handleSummary(data) {
    return {
        [__ENV.FILE]: htmlReport(data),
    };
}

export default function () {
    let res = http.get(__ENV.URL);
    check(res, {'status was 200': (r) => r.status == 200});
    sleep(1)
}
