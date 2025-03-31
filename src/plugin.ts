import type { Router } from 'vue-router'
import type { RouteGuardOptions } from './guards'
import { createRouteGuards } from './guards'

export default function installGuards(router: Router, options: RouteGuardOptions) {
    const { handleBeforeEach, handleAfterEach } = createRouteGuards(options)
    router.beforeEach(handleBeforeEach)
    router.afterEach(handleAfterEach)
}