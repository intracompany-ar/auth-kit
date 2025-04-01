declare global {
    interface Window {
        axios: typeof axios;
    }
}

import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'
import axios from 'axios'
import { useAuth } from './../stores/auth.js'
import { showLoaders, disableSubmits, hideLoaders, enableSubmits, showAdvice } from '@intracompany/commons_front'

// Forma legacy, para usar axios.
window.axios = axios;
// Forma moderna => usar api.
const api = axios
export default api

export function setAxios(pinia: Pinia, router: Router) {
    const storeAuth = useAuth(pinia);
    
    axios.interceptors.request.use(
        requestConfig => {
            // 2503331 No se para que lo estaba usando, pero me da error Ts, así que lo saqué por ahora
            // if (requestConfig.noCache) {
            //     requestConfig.headers['Cache-Control'] = 'no-cache';
            // }

            // Modificar la URL solo si NO es una URL completa (comienza con 'http' o 'https')
            if (requestConfig.url && !requestConfig.url.startsWith('http')) {
                requestConfig.url = `${import.meta.env.VITE_API_URL}/${requestConfig.url}`;
            }
            
            if (storeAuth.token) {
                requestConfig.headers['Authorization'] = `Bearer ${storeAuth.token}`;
            }
            requestConfig.headers['Accept'] = 'application/json';
            requestConfig.headers['Content-Type'] = requestConfig.headers['Content-Type'] ?? 'application/json';

            if (requestConfig.method && ['put', 'post', 'delete'].includes(requestConfig.method)) {
                disableSubmits();
            }
            showLoaders();
            return requestConfig;
        },
        error => {
            console.log('Request fail', error.request);
            hideLoaders();
            enableSubmits();
            return Promise.reject(error);
        }
    );
                
    axios.interceptors.response.use(
        response => {
            hideLoaders();
            enableSubmits();

            if (response.status === 201) {
                showAdvice('success', response.data.message || response.data, 'Elemento creado');
                // SI ELIMINADO QUIERO MOSTRAR DESDE ACÁ EL SUCCESS DE ELEMENTO ELIMINADO ASÍ LIMPIO EL CÓDIGO EN EL RESTO DE LA PÁGINA. El tema que comparte 204 con update
            }
            return response;
        },

        async error => {
            hideLoaders();
            enableSubmits();

            if (error.response) {
                const { status, data } = error.response;
                switch (status) {
                    case 401:
                        showAdvice('warning', 'No autorizado. Sesión caducó. Recargue la página.', `Error ${status}`);
                        await storeAuth.logout();
                        router
                            ? router.push('/login')
                            : window.location.href = '/login'
                         // Redirigir al login. NO uso vue-router porque acá ya se cerró sesión, no puedo usar vue-rouer en este archivoe, solo dentro de un setup de Vue
                        break;
                    case 419:
                        showAdvice('warning', 'CSRF no válido. Recargue la página.', `Error ${status}`);
                        break;
                    case 403:
                        showAdvice('warning', 'No autorizado a realizar esta acción.', `Error ${status}`);
                        break;
                    case 404:
                        showAdvice('warning', data?.message ?? 'Elemento no encontrado', `Error ${status}`);
                        break;
                    case 422:
                        const errors = typeof data === 'object' ? Object.values(data.errors).flat() : data;
                        showAdvice('warning', errors, `Datos Inválidos. Error: ${status}`);
                        break;
                    default:
                        showAdvice('danger', 'Algo salió mal, por favor notifique al administrador', `Error ${status}`);
                        break;
                }
            }
            return Promise.reject(error);
        }
    );
}

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'; // Setea header ajax por defecto

/**
 * Agregar en caso de Sanctum SPA auth
 * https://laravel.com/docs/11.x/sanctum#cors-and-cookies
 */
axios.defaults.withCredentials = true;
