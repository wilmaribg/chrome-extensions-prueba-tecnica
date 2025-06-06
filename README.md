# Prueba Técnica: Chrome Extensions Monorepo

Este monorepo contiene el código fuente para una prueba técnica basada en extensiones de Chrome y funcionalidades compartidas. El objetivo es demostrar la integración de extensiones con la plataforma Prolibu y la reutilización de código mediante paquetes compartidos.

## Estructura del Proyecto

```
chrome-extensions-monorepo
├── extensions
│   ├── extension-one
│   ├── extension-two
├── packages
│   ├── login
│   ├── common
├── tsconfig.base.json
├── package.json
└── README.md
```

### Extensiones

- **extension-one**: Esta extensión permite al usuario descargar un archivo Excel de 360 y subirlo a un endpoint de Prolibu.
- **extension-two**: Esta extensión permite al usuario autenticarse en Prolibu y muestra la información del usuario logueado.

### Paquetes Compartidos

- **login**: Proporciona la funcionalidad de autenticación y gestión de sesión de usuario, reutilizable por ambas extensiones.
- **common**: Contiene utilidades y funcionalidades comunes que pueden ser compartidas entre las extensiones.

## Primeros Pasos

1. Clona el repositorio:

   ```
   git clone <repository-url>
   cd chrome-extensions-monorepo
   ```

2. Instala las dependencias:

   ```
   npm install
   ```

3. Navega a la extensión o paquete deseado para ejecutar o construir:

   ```
   cd extensions/extension-one
   npm run build
   ```

4. Carga la extensión en Chrome:
   - Ve a `chrome://extensions/`
   - Activa el "Modo desarrollador"
   - Haz clic en "Cargar descomprimida" y selecciona el directorio de la extensión.

## Contribuciones

¡Las contribuciones son bienvenidas! Abre un issue o envía un pull request para mejoras o correcciones.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
