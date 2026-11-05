export const userMessages = {
  notFound: "Usuario no encontrado.",
  duplicateEmail: "Ese correo electrónico ya está registrado.",
  duplicateUsername: "Ese nombre de usuario ya está registrado.",
  cannotRemoveOwnAdmin:
    "No puedes quitarte el rol de admin ni desactivarte a ti mismo.",
  lastActiveAdmin: "Debe existir al menos un administrador activo.",
  validation: {
    nameRequired: "El nombre de usuario es obligatorio.",
    invalidEmail: "El correo electrónico no es válido.",
    passwordMinLength: "La contraseña debe tener al menos 6 caracteres.",
    invalidRole: "El rol seleccionado no es válido.",
  },
} as const;
