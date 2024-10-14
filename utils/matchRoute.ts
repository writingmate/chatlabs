export interface RouteMatch {
    route: string;
    params: Record<string, string>;
    method: string;
    queryParams: Record<string, string>;
}

export function matchRoute(
    paths: Record<string, any> | null | undefined,
    path: string,
    method: string,
    query: URLSearchParams
): RouteMatch | null {
    if (!paths) {
        console.error('Paths object is null or undefined');
        return null;
    }

    for (const [route, routeMethods] of Object.entries(paths)) {
        if (routeMethods && routeMethods[method.toLowerCase()]) {
            const match = matchPathToRoute(path, route);
            if (match) {
                const queryParams: Record<string, string> = {};
                for (const [key, value] of query.entries()) {
                    queryParams[key] = value;
                }
                return { ...match, method, queryParams };
            }
        }
    }
    return null;
}

function matchPathToRoute(
    path: string,
    route: string
): { route: string; params: Record<string, string> } | null {
    const pathParts = path.split("/").filter(Boolean);
    const routeParts = route.split("/").filter(Boolean);

    const params: Record<string, string> = {};

    let pathIndex = 0;
    let routeIndex = 0;

    while (routeIndex < routeParts.length && pathIndex < pathParts.length) {
        const routePart = routeParts[routeIndex];
        const pathPart = pathParts[pathIndex];

        if (routePart.startsWith("{") && routePart.endsWith("}")) {
            const paramName = routePart.slice(1, -1);
            if (paramName === "*") {
                // Catch-all parameter
                params[paramName] = pathParts.slice(pathIndex).join("/");
                return { route, params };
            } else {
                params[paramName] = pathPart;
                pathIndex++;
                routeIndex++;
            }
        } else if (routePart === pathPart) {
            pathIndex++;
            routeIndex++;
        } else {
            return null;
        }
    }

    // Check if we've matched all parts of the route
    if (routeIndex === routeParts.length && pathIndex === pathParts.length) {
        return { route, params };
    }

    return null;
}
