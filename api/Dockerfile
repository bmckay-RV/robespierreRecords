# FROM golang:alpine

# RUN mkdir /app
# ADD . /app/
# WORKDIR /api

# RUN go mod download
# COPY . /app/

# EXPOSE 8000

# RUN go build main.go

# CMD ["./main"]

# 
# This is a multi stage docker build, one image to build the app anonther to run it
#
# should specify tag... not just generic alpine
FROM golang:latest 
RUN mkdir /app 
ADD . /app/ 
WORKDIR /app 
EXPOSE 8000
RUN go build -o main . 
CMD ["/app/main"]
