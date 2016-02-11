# Пуша-сервер 

## Установка

0. На машине должна быть `node`
1. Скачать проект на машину.
2. Сказать `npm install` - установит нужные нодовские пакеты.
3. Запустить `node bin/pusha.js`

## Настройка

По умолчанию файлы хранятся в подкаталоге data текущего каталога.
Настройка идет в файле [bin/conf.json](bin/conf.json). Там можно указать, в частности, каталог данных и порт.

## Что умеет сервер

Выдавать данные по http (get). Пример:
```
curl http://localhost:3333/info.txt
```

Выдавать список файлов
```
curl http://localhost:3333/list
```

Загружать данные, http POST
```
curl -F filedata=@readme.md localhost:3333/
```

Загружать данные, http POST, в кодировке form-data
См пример в `utils/sendfile.js`

Выполнять push-команду на другой пуша-сервер
```
curl http://localhost:3333/info.txt?push=http://localhost:3333/target.txt
```
