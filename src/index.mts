import type { App } from 'vue'
import { setAxios } from './utils/axiosConfig'
import installGuards from './plugin'
import { useAuth } from './stores/auth'

interface GuardOptions {
    loginPath?: string
    dashboardPath?: string
    updatePasswordPath?: string
    appName?: string
}

interface AuthKitOptions {
    pinia: any
    router: any
    guards?: GuardOptions
}

/**
 * Plugin opcional para usar con app.use(AuthKit, { pinia, router })
 */
export default {
    install(app: App, options: AuthKitOptions) {
        const { pinia, router, guards } = options

        if (!pinia || !router) {
            throw new Error('[auth-kit] pinia es requerido en AuthKit.install()')
        }

        setAxios(options.pinia, options.router)

        if (guards) {
            installGuards(router, {
                ...guards,
                useAuth: () => useAuth(pinia),
                useBus: () => app.config.globalProperties.$bus, 
                useStoreAdvices: () => app.config.globalProperties.$advices
            })
        }
        // Si querés exponer cosas globales (opcional)
        app.config.globalProperties.$auth = useAuth(options.pinia)
    }
}

export { useAuth } from './stores/auth'