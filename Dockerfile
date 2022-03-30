FROM python:alpine

LABEL maintainer="rgreaves@google.com"

COPY /code /app

WORKDIR /app
RUN pip3 install -r requirements.txt

EXPOSE 8080

CMD ["python3", "main.py"]