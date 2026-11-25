/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Clave pública de Laravel Reverb; sin ella el tiempo real queda desactivado */
  readonly VITE_REVERB_APP_KEY?: string;
  /** Solo desarrollo sin Docker: host/puerto/esquema del servidor Reverb (por defecto, los de la página) */
  readonly VITE_REVERB_HOST?: string;
  readonly VITE_REVERB_PORT?: string;
  readonly VITE_REVERB_SCHEME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
