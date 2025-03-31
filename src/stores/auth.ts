import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios, { AxiosInstance } from 'axios';

let apiInstance: AxiosInstance = axios

export function setAuthAxios(instance: AxiosInstance) {
    apiInstance = instance
}

export const useAuth = defineStore('auth', () => {

    const user = ref((() => {
        try {
            let user = localStorage.getItem('user') ?? "{}";
            return JSON.parse(user);
        } catch {
            return {};
        }
    })())
    const token = ref( localStorage.getItem('api-token') || null )
    const redirectAfterLogin = ref(null)

    const isAuthenticated = computed(() => token.value !== null)


    function getUserAuth() {
        return JSON.parse(user.value);

    }

    async function login(tokenParam: string, userParam: object) {
        token.value = tokenParam;
        user.value = userParam;
        localStorage.setItem('api-token', tokenParam);
        localStorage.setItem('user', JSON.stringify(userParam));
    }

    async function logout()
    {
        try {
            if (user.value.id) {
                await apiInstance.post(`logout/${user.value.id}`);
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            alert('No se pudo cerrar sesión. Por favor, notifique al administrador del sistema.');
        } finally {
            token.value = null;
            user.value = {};
            localStorage.removeItem('api-token');
            localStorage.removeItem('user');
        }
    }

    

    return {getUserAuth, user, token, logout, login, isAuthenticated, redirectAfterLogin}
})