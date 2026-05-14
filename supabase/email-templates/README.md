# Email Templates — Training Studio Gym

HTMLs personalizados para los correos transaccionales de Supabase Auth.

## Cómo aplicarlos

1. Entrá al [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto.
2. **Authentication → Email Templates**.
3. Para cada email:
   - **Confirm signup** → pegá el contenido de `confirm-signup.html`.
   - **Reset password** → pegá el contenido de `reset-password.html`.
4. Guardá cambios.

## Importante — Site URL

Los enlaces usan `{{ .SiteURL }}/auth/confirm?...`. Verificá que en
**Authentication → URL Configuration → Site URL** esté seteado al
dominio real (ej. `https://trainingstudio.com.co`). Si está mal,
el botón del email va a apuntar a la URL equivocada.

## Logo

El logo carga desde `gym-media/logo-transparent.png` (bucket público).
Tiene que existir ahí. Si lo cambiás, no hace falta tocar los templates.

## Por qué `token_hash` en lugar de `{{ .ConfirmationURL }}`

El ConfirmationURL por defecto usa **PKCE**, que requiere que el usuario
abra el email en el **mismo browser** donde inició el signup. Si abre el
email en su teléfono después de registrarse en la laptop, falla con
"PKCE code verifier not found in storage".

Cambiamos los enlaces a `?token_hash=...&type=signup`. El route
`/auth/confirm` usa `verifyOtp` que no necesita el verificador PKCE, así
que funciona cross-device.

## Subject lines sugeridas

- **Confirm signup**: `Confirmá tu cuenta en Training Studio Gym`
- **Reset password**: `Recuperá tu contraseña — Training Studio Gym`

## Probar

- Registrate con un email tuyo, abrí el correo en tu teléfono (otro device), tocá el botón → debería llevarte a `/dashboard` sin error PKCE.
- "¿Olvidé mi contraseña?" desde `/recuperar`, abrir el email en otro device → llega a `/recuperar/cambiar`.
