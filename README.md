
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="https://avatars.githubusercontent.com/u/158122848?s=400&u=175d02c6e0d435be1bae60e66ddeff812b974eab&v=4" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">HOPE - WEB</h3>
  
</div>


<!-- ABOUT THE PROJECT -->
## Acerca del proyecto

**Proyecto de Desarrollo: Módulo Web Administrativo para Aplicación Móvil en la Fundación Azul Esperanza**

Este proyecto tiene como objetivo principal desarrollar un módulo web administrativo que complementará una aplicación móvil diseñada para mejorar las habilidades comunicativas en niños con Trastorno del Espectro Autista (TEA). La aplicación implementará la metodología PECS (Sistema de Comunicación por Intercambio de Pictogramas) y se enfocará en beneficiar a los niños atendidos por la Fundación Azul Esperanza en la ciudad de Managua.

**Objetivos del Sistema:**
1. **Gestión de Terapeutas:** Administrar la información relevante de los terapeutas que colaboran con la fundación.
2. **Registro de Expedientes de Niños/Pacientes:** Mantener un registro completo de los niños atendidos, incluyendo datos personales, información sobre el nivel de autismo y el progreso actual utilizando las 6 fases de la Metodología PECS.
3. **Gestión de Tutores:** Administrar la información de los tutores de los pacientes para una comunicación efectiva.
4. **Repositorio de Pictogramas:** Gestionar y organizar un repositorio de pictogramas, con información detallada sobre cada uno.
5. **Creación de Tableros de Comunicación:** Facilitar la formación de oraciones mediante la creación de tableros de comunicación con distintos pictogramas.
6. **Asignación de Actividades según PECS:** Crear y asignar actividades específicas a los niños, alineadas con la metodología PECS.
7. **Gestión de Usuarios y Accesos:** Administrar usuarios y controlar accesos al sistema para garantizar la seguridad y privacidad de la información.

Este proyecto busca contribuir significativamente a la calidad de vida de los niños con autismo, proporcionando herramientas tecnológicas especializadas y adaptadas a sus necesidades específicas.



### Tecnologías

* html
* javascript
* nodejs
* sequelize
* postgresql


<!-- GETTING STARTED -->
## Getting Started

### Pre requisitos

Asegúrate de tener Node Package Manager (npm) instalado. Si no lo tienes, puedes instalar la última versión con el siguiente comando:
  ```sh
  npm install npm@latest -g
  ```

### Instalación

_Sigue estos pasos sencillos para configurar y ejecutar el proyecto localmente._

1. Clone the repo
   ```sh
   git clone https://github.com/Hope-uni/hope.api.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in `config.js`
   ```js
   const API_KEY = 'ENTER YOUR API';
   ```
5. Run the develpoment server
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```
6. Open Postman, insomnia u otra herramienta en donde puedas testiar los endpoints. localhost://3000/"Nombre del Modulo"/"Nombre del endpoint"


<!-- Maintainers -->
## Maintainers

### Main developer

* Edwin Vega

### Contributors

* Mario Mejía
* Samuel Barberena



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.
