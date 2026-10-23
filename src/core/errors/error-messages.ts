export const coreErrorMessages = {
  routeNotFound: "La ruta solicitada no existe.",
  invalidRequest: "Los datos enviados no son válidos.",
  unauthenticated: "Debes iniciar sesión para continuar.",
  invalidSession: "La sesión no es válida o expiró.",
  forbidden: "No tienes permiso para realizar esta acción.",
  resourceConflict: "Ya existe un registro con esos datos.",
  internal: "Ocurrió un error interno en el servidor.",
} as const;
