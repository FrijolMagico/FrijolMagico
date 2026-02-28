# Reporte E2E - Commit System (Plan P8)

**Fecha:** 28 Feb 2026
**Herramienta:** Playwright MCP (Navegación humana automatizada)

## Resumen de Pruebas

Se probó la suite completa de refactorizaciones incluidas en el plan P8 del Commit System interactuando de forma real (con el browser) contra el servidor de desarrollo (`localhost:3001` y base de datos Turso real gracias a variables de entorno).

### Casos Probados y Resultados

1. **Estado Inicial (Dirty Store Mount Hydration)**
   - **Flujo:** Ingresar directamente a la app.
   - **Resultado:** ✅ Éxito. El sidebar muestra indicadores de cambios sin guardar correctamente leyendo desde el `change-journal` mediante el query optimizado (N+1 query issue resuelto), sin interferir con la sesión de `useDirtySync` de los stores.

2. **Edición Simple y Reactividad de UI**
   - **Flujo:** Navegar a `/general`. Editar el campo "Nombre de la Organización".
   - **Resultado:** ✅ Éxito. La barra de "Cambios sin guardar" apareció instantáneamente al detectar la mutación `UPDATE` sobre el Journal local.

3. **Cancelación No-Op (Edición y Reversión)**
   - **Flujo:** Cambiar el campo a `TEST-P8-MODIFICADO` y luego restaurarlo manualmente a `TEST-P8`.
   - **Resultado:** ✅ Éxito parcial/esperado. La barra de guardado se mantiene (las mutaciones existen en store pendiente), pero al presionar "Guardar Cambios" el pipeline intercepta que ambas operaciones se cancelan (array vacío `[]`), no envía el `execute` al backend, limpia la IndexedDB y llama al `onSuccess` localmente.

4. **UI Flash Fix & Revalidación Inmediata**
   - **Flujo:** Enviar una edición legítima, darle "Guardar" y monitorear la UI durante los 2-3 segundos siguientes.
   - **Resultado:** ✅ Éxito rotundo. Al terminar de guardar no ocurrió ningún parpadeo (ni al snapshot previo original, ni a un estado vacío) gracias a la nueva derivación de `isPostCommitReset` (`lastCommitAt !== null`) que congela la re-proyección hasta que Next.js (`router.refresh()`) nos entrega la data final hidratada con `updateTag`.

## Conclusiones

La refactorización de P8 ha dado paso a un commit-system **robusto y confiable**.

- Cero "Warning" cíclicos en consola.
- Cero dependencias de dead-code detectadas.
- La experiencia de usuario en guardado es imperceptible y rápida sin datos _stale_.

**Estado de la QA E2E:** APROBADA.
