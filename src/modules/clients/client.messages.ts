export const clientMessages = {
  notFound: "Cliente no encontrado.",
  vehicleNotFound: "Vehículo no encontrado para este cliente.",
  activeVehicles:
    "El cliente tiene vehículos activos. Desactívalos o transfiérelos primero.",
  duplicatePlate: (plate?: string) =>
    plate
      ? `La placa ${plate.toUpperCase()} ya está registrada.`
      : "La placa ya está registrada.",
  duplicateEmail: "Ese correo electrónico ya está registrado.",
  validation: {
    nameRequired: "El nombre es obligatorio.",
    phoneRequired: "El teléfono es obligatorio.",
    invalidEmail: "El correo electrónico no es válido.",
    plateRequired: "La placa es obligatoria.",
  },
} as const;
