FROM golang:alpine
RUN mkdir /app
ADD . /app/
WORKDIR /app
RUN go mod download
COPY . /app/
EXPOSE 8000
RUN go build main.go
CMD ["./main"]