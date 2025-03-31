import type { Router } from 'vue-router'
import type { RouteGuardOptions } from './guards.js'
import { createRouteGuards } from './guards.js'

export default function installGuards(router: Router, options: RouteGuardOptions) {
    const { handleBeforeEach, handleAfterEach } = createRouteGuards(options)
    router.beforeEach(handleBeforeEach)
    router.afterEach(handleAfterEach)
}