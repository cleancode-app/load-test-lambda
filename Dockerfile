FROM node:14 as build

COPY *.json *.ts ./

RUN npm ci

RUN npm run typescript-compile

RUN npm run build

FROM public.ecr.aws/lambda/nodejs:14

COPY --from=build bundle.js ${LAMBDA_RUNTIME_DIR}/bundle.js

RUN yum install -y https://dl.k6.io/rpm/repo.rpm && yum install -y k6 --nogpgcheck && yum clean all

CMD ["bundle.handler"]
