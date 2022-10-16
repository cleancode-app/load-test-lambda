FROM node:16 as build

COPY package.json package-lock.json ./

RUN npm ci

COPY handler-load-test.ts tsconfig.json ./

RUN npm run typescript-compile

RUN npm run build-load-test

FROM public.ecr.aws/lambda/nodejs:16

RUN yum install -y https://dl.k6.io/rpm/repo.rpm && yum install -y k6 --nogpgcheck && yum clean all

COPY --from=build bundle.js ${LAMBDA_TASK_ROOT}
COPY k6.js ${LAMBDA_TASK_ROOT}

CMD ["bundle.handler"]
