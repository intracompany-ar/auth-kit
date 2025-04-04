import type { App } from 'vue'
import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'
import { setAxios } from './utils/axiosConfig.js'
import installGuards from './plugin.js'
import { useAuth } from './stores/auth.js'

interface GuardOptions {
    loginPath?: string
    dashboardPath?: string
    updatePasswordPath?: string
    appName?: string
}

interface AuthKitOptions {
    pinia: Pinia
    router: Router
    guards?: GuardOptions
    apiUrl: string
}

/**
 * Plugin opcional para usar con app.use(AuthKit, { pinia, router })
 */
export default {
    install(app: App, options: AuthKitOptions) {
        const { pinia, router, guards, apiUrl } = options

        if (!apiUrl) {
            throw new Error('[auth-kit] apiUrl es requerido en AuthKit.install()')
        }
        if (!pinia || !router) {
            throw new Error('[auth-kit] pinia es requerido en AuthKit.install()')
        }

        setAxios(pinia, router, apiUrl)

        if (guards) {
            installGuards(router, {
                ...guards,
                useAuth: () => useAuth(pinia),
                useBus: () => app.config.globalProperties.$bus
            })
        }
        // Si querés exponer cosas globales (opcional)
        app.config.globalProperties.$auth = useAuth(options.pinia)
    }
}

export { useAuth } from './stores/auth.js'
export { useBus } from './stores/bus.js'