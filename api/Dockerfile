# FROM golang:alpine
# RUN mkdir /app
# ADD . /app/
# WORKDIR /api
# RUN go mod download
# COPY . /app/
# EXPOSE 8000
# RUN go build main.go
# CMD ["./main"]

FROM golang:latest 
RUN mkdir /app 
ADD . /app/ 
WORKDIR /app 
RUN go build -o main . 
CMD ["/app/main"]
