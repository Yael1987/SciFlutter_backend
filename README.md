# Sciflutter
## _Sitio web de articulos cientificos de codigo abierto_

## Features

- Escribe articulos y publicalos gratuitamente
- Dale me gusta y guarda tus articulos favoritos
- Sigue a escritores para saber cuando publiquen un nuevo articulo
- Recibe notificaciones en tiempo real para una mejor experiencia

## Tech

Sciflutter use diversas technologias :

- [NextJS] - The react framework for production!
- [CK editor] - Editor de texto enriquecido gratuito.
- [Node.js] - evented I/O for the backend
- [Express] - fast node.js network app framework [@tjholowaychuk]
- [Redis] - the streaming build system
- [Minio] - HTML
to Markdown converter
- [Socket.io] - Cliente de websockets usados para funciones en tiempo real.

## Instalacion

Sciflutter requiere [Node.js](https://nodejs.org/) v20+ to run.

### Clone repositories
```sh
git clone https://github.com/Yael1987/SciFlutter_backend.git
git clone https://github.com/Yael1987/SciFlutter_frontend.git
```

>[!NOTE]
>Este proyecto usa Minio en el backend como dependencia de desarrollo, si no estas familiriaziado con ella puedes consultar su documentacion o usar otro gestor de almacenamiento local

Despues de clonar ambos repositorios instala las dependencias de la siguiente forma.


### Backend
```sh
cd sciflutter_backend
npm install
npm run dev
```

### Frontend
```sh
cd sciflutter_frontend
npm install
npm run dev
```

Para entorno de produccion

```sh
npm install --production
npm run start
```

## Licencia

MIT License

Copyright (c) 2023 Cristian Yael De Jesus Reyes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contacto

Si tienes dudas, comentarios o quieres contactarme estare a tus ordenes, estoy abierto a recibir feedback o a colaborar.

- **Email:** [dejesusyael1987@gmail.com](mailto:dejesusyael1987@gmail.com)
- **LinkedIn:** [Cristian Yael De Jesus Reyes](https://www.linkedin.com/in/cristian-yael-de-jesus-reyes-b96572211/)
- **GitHub:** [Yael1987](https://github.com/Yael1987)

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [Node.js]: <http://nodejs.org>
   [Express]: <http://expressjs.com>
   [Redis]: <https://redis.io/>
   [CK Editor]: <https://ckeditor.com/>
   [NextJS]: <https://nextjs.org/>
   [Minio]: <https://min.io/>
   [Socket.io]: <https://socket.io/>

   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
   [PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>

