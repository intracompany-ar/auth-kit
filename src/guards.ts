import { closeModals } from '@intracompany/commons_front'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import axios from 'axios'

export interface RouteGuardOptions {
    loginPath?: string
    dashboardPath?: string
    updatePasswordPath?: string
    appName?: string
    useAuth: () => any
    useBus: () => any
    useStoreAdvices: () => any
}


export function createRouteGuards({
    loginPath = '/login',
    dashboardPath = '/dashboard',
    updatePasswordPath = '/profileUser/update-password',
    appName = 'Palarich',
    useAuth,
    useBus,
    useStoreAdvices
}) {
    
    /**
     * Obtiene la configuración del subsistema basado en el index_link.
     * @param {string} subsystemIndexLink
     * @returns {Promise<boolean>} Promise que resuelve si está autorizado.
     */
    const getSubsystemConfig = async (subsystemIndexLink: string): Promise<boolean> => {
        const storeBus = useBus()
        
        try {
            const response = await axios(`subsystem/config/${subsystemIndexLink}`);

            const data = response.data;
            
            storeBus.subsystemTitle = data.subsystem.title; // Ajuste: `title` del subsistema. NO lo estoy usando
            storeBus.webSites = data.subsystem?.webSites;
            
            return data.authorized;

        } catch (error) {
            console.error('Error al obtener la configuración del subsistema:', error);
            return false;
        }
    };

    /**
     * NO necesito validar tokens, porque si no son válidos, sanctum response 401, y axios.interceptors.response hace el logout y me redirecciona
    */
    const handleBeforeEach = async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        const storeBus = useBus();
        const storeAuth = useAuth();
        const storeAdvices = useStoreAdvices()

        const isPublic = to.meta?.public
        const isAuthenticated = storeAuth.isAuthenticated
        const needsPasswordUpdate = storeAuth.user?.actualizopassw === 0
        
        if (!isPublic && !isAuthenticated) {
            storeAuth.redirectAfterLogin = to.fullPath;
            return next(loginPath);
        }
        
        if (!isPublic && isAuthenticated && needsPasswordUpdate) {
            if (to.path !== updatePasswordPath) {
                return next(updatePasswordPath)
            } 
            return next() // continuar normalmente
        }
        
        if (isPublic && isAuthenticated) {
            return next(dashboardPath);
        }
        
        var authorized = true;
        const subsystemIndexLink = typeof to.meta?.subsystem === 'string' ? to.meta.subsystem : to.path.split('/')[1];
        const hasChildren = to.matched?.[0]?.children?.length > 0

        if(to.meta?.subsystem || hasChildren) {
            storeBus.emit('navigatingNewPage')
            authorized = await getSubsystemConfig(subsystemIndexLink)
        }
    
        if(!authorized){
            storeAdvices.warning('No tiene permisos para acceder a este subsistema');
            return next(false);
        }
        
        next();
    }

    const handleAfterEach = (to: RouteLocationNormalized) => {
        const storeBus = useBus();
        closeModals();

        const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)
        const subsystemIndexLink = to.path.split('/')[1];

        document.title = `${capitalizeFirstLetter(subsystemIndexLink)} ${to.meta.title || ''} | ${appName}`;

        storeBus.emit('handleAfterEach')
    }

    return { handleBeforeEach, handleAfterEach }
}