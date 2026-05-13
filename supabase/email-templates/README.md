# Email Templates — Training Studio Gym

HTMLs personalizados para los correos transaccionales de Supabase Auth, con el logo y branding del gym.

## Cómo aplicarlos

1. Entrá al [Supabase Dashboard](https://supabase.com/dashboard) del proyecto.
2. **Authentication → Email Templates**.
3. Para cada uno:
   - **Confirm signup** → pegá el contenido de `confirm-signup.html`.
   - **Reset password** → pegá el contenido de `reset-password.html`.
4. Asegurate de que en el HTML aparezca exactamente `{{ .ConfirmationURL }}` (lo dejé tal cual; Supabase lo reemplaza al enviar).
5. Guardá cambios. El próximo email que mande Supabase usa la nueva plantilla.

## Logo

El logo apunta a `https://jigwpntqxywjwruftwix.supabase.co/storage/v1/object/public/gym-media/logo-transparent.png`.

Si ese archivo no existe en el bucket `gym-media`, subilo (puede ser una copia de `public/assets/logo-transparent.png`). El email lo carga por URL pública, así que tiene que estar accesible sin autenticación.

## Probar

Después de guardar la plantilla:
- Registrate con un correo nuevo y verificá que llegue el email con el banner dorado, logo, y CTA.
- Pedí "Olvidé mi contraseña" desde `/recuperar` y verificá el email de reset.

## Subject lines

En la misma sección del dashboard también podés ajustar el **Subject** de cada email. Sugerencias:

- Confirm signup: `Confirmá tu cuenta en Training Studio Gym`
- Reset password: `Recuperá tu contraseña — Training Studio Gym`
