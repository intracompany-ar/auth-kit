## v1.2
#### import.meta.env.VITE_API_URL
- Al estar declarada en el proyecto original, no llega a leerse en este paquete que se utiliza en otro paqueten. Ejemplo iceo-shell
- La paso como parámetro en AuthKitOptions

- requestConfig.url = `${import.meta.env.VITE_API_URL}/${requestConfig.url}`;
+ requestConfig.url = `${apiUrl}/${requestConfig.url}`;