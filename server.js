const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const axios = require('axios');
  


const app = express();

const server = app.listen(3000, () => {
  console.log('Server started on port 3000');
});

const keywordUrlMap = {
  keyword1: ['keyword1', 'http://htmlbook.ru/files/images/samhtml/fig_1_04_01.png'],
  keyword2: ['keyword2', 'https://file-examples.com/wp-content/storage/2017/04/file_example_MP4_640_3MG.mp4'],
  keyword3: ['keyword3', 'https://file-examples.com/wp-content/storage/2017/04/file_example_MP4_1280_10MG.mp4'],
  keyword4: ['keyword4', 'https://file-examples.com/wp-content/storage/2017/04/file_example_MP4_1920_18MG.mp4']
};

const wss = new WebSocket.Server({ server });


wss.on('connection', (ws2) => {
  console.log('WebSocket connection established');
  ws2.on('message', (message) => {
    console.log('Received message from client:', message);

    const urls = keywordUrlMap[message];
    console.log(message);
    let url = '';
    if (urls) {
      url = urls[1];
    console.log('33');
    console.log(url);
      ws2.send(JSON.stringify( { url } ));
      downloadContent(url);
    } else {
      let myError = message + ' не найдено';
      console.log(myError);
      ws2.send(JSON.stringify({ myError }));
    }
  });

  function getFileSize(url) {
    return new Promise((resolve, reject) => {
      axios.head(url)
        .then(response => {
          const contentLength = response.headers['content-length'];
          resolve(parseInt(contentLength));
        })
        .catch(error => {
          console.error('Error fetching file size:', error);
          reject(error);
        });
    });
  }
  
  function downloadContent(url) {
    let fileSize = 0;
    fileSize = getFileSize(url);
    console.log(fileSize);
    ws2.send(JSON.stringify({ fileSize }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        ws2.send(JSON.stringify({ progress }));
      } else {
        clearInterval(interval);
        ws2.send(JSON.stringify({ message: 'Download complete' }));
      }
    }, 1000);
  }

  ws2.on('close', () => {
    console.log('WebSocket connection closed');
  });
});
