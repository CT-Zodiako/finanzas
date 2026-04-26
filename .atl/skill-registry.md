# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When creating a GitHub issue, reporting a bug, or requesting a feature. | issue-creation | /Users/cristiantovar/.config/opencode/skills/issue-creation/SKILL.md |
| When creating a pull request, opening a PR, or preparing changes for review. | branch-pr | /Users/cristiantovar/.config/opencode/skills/branch-pr/SKILL.md |
| When user asks to create a new skill, add agent instructions, or document patterns for AI. | skill-creator | /Users/cristiantovar/.config/opencode/skills/skill-creator/SKILL.md |
| When writing Go tests, using teatest, or adding test coverage. | go-testing | /Users/cristiantovar/.config/opencode/skills/go-testing/SKILL.md |
| When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen". | judgment-day | /Users/cristiantovar/.config/opencode/skills/judgment-day/SKILL.md |
| Proporcionar información sobre tecnologías, lenguajes, frameworks y herramientas de desarrollo de la app. | arquitectura | /Users/cristiantovar/DEV/projects/finanzas/.agents/skills/arquitectura/SKILL.md |
| Proporcionar información del dominio y funcionalidades de finanzas requeridas por usuarios. | finanzas | /Users/cristiantovar/DEV/projects/finanzas/.agents/skills/finanzas/SKILL.md |
| Build web components/pages and style or beautify UI with high design quality. | frontend-design | /Users/cristiantovar/DEV/projects/finanzas/.agents/skills/frontend-design/SKILL.md |
| Gestión, análisis y optimización determinística del pago de deudas personales. | optimizar-finanzas | /Users/cristiantovar/DEV/projects/finanzas/.agents/skills/optimizar-finanzas/SKILL.md |
| Configuración de despliegue liviano en portátil Celeron N3350 con 4GB RAM. | server | /Users/cristiantovar/DEV/projects/finanzas/.agents/skills/server/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### issue-creation
- Usar SIEMPRE template de issue (bug_report.yml o feature_request.yml); no issue en blanco.
- Buscar duplicados antes de crear un issue.
- Todo issue nuevo queda con `status:needs-review` y NO habilita PR todavía.
- La implementación solo puede arrancar cuando maintainer agrega `status:approved`.
- Preguntas/discusión van a Discussions, no a Issues.

### branch-pr
- Todo PR DEBE enlazar un issue aprobado (`Closes|Fixes|Resolves #N`).
- Toda PR DEBE tener exactamente una label `type:*`.
- Nombrar rama como `type/description` cumpliendo regex oficial (minúsculas, sin espacios).
- Mantener conventional commits válidos; sin `Co-Authored-By`.
- Verificar checks automáticos requeridos antes de merge.

### skill-creator
- Crear skills solo para patrones repetibles o flujos complejos, no para one-offs.
- Estructura mínima: `skills/{name}/SKILL.md` (assets/references opcional).
- Frontmatter obligatorio con `name`, `description` + trigger, `license`, `metadata`.
- Priorizar reglas críticas accionables y ejemplos mínimos.
- Registrar la skill en el archivo índice de agentes correspondiente.

### go-testing
- Priorizar tests table-driven para cubrir variantes de entrada/salida.
- Testear transiciones de estado Bubbletea directo sobre `Model.Update()`.
- Para flujos TUI completos usar `teatest.NewTestModel`.
- Usar golden files cuando el output visual/terminal es relevante.
- Incluir casos de error y edge cases, no solo happy path.

### judgment-day
- Ejecutar SIEMPRE dos jueces ciegos en paralelo para revisión adversarial.
- Resolver skills relevantes desde registry e inyectar `Project Standards` a ambos jueces.
- Sintetizar hallazgos en confirmados/sospechosos/contradicciones antes de corregir.
- Corregir solo issues confirmados y re-juzgar; clasificar warnings reales vs teóricos.
- Escalar al usuario después de 2 iteraciones si persisten problemas críticos.

### arquitectura
- Mantener stack oficial: Angular 21 + FastAPI + SQLAlchemy + PostgreSQL.
- Separar responsabilidades con clean/layered architecture.
- Frontend y backend se comunican por API REST con JSON.
- Usar DTOs/mappers para separar capa de presentación y lógica de negocio.
- Acompañar cambios con pruebas y documentación técnica clara.

### finanzas
- Cubrir flujo core: deudas, ingresos, gastos fijos, gastos diarios e ingresos diarios.
- Asegurar resumen financiero y capacidades de presupuesto mensual.
- Mantener foco en funcionalidades de usuario del dominio finanzas.
- Entregar explicaciones y salidas claras orientadas a negocio.
- Preservar coherencia con requerimientos funcionales del sistema.

### frontend-design
- Definir una dirección estética clara (no diseño genérico “AI slop”).
- Implementar UI de calidad de producción, funcional y visualmente memorable.
- Cuidar tipografía, color, motion y composición espacial con intención.
- Evitar patrones visuales cliché y defaults comunes sin criterio.
- Ajustar complejidad visual/técnica al estilo elegido (maximalista vs minimalista).

### optimizar-finanzas
- El motor de optimización debe ser 100% determinístico (sin inferencia probabilística).
- Priorizar deudas por costo y fechas de corte/pago para minimizar costos totales.
- Generar plan de pagos reproducible con la misma entrada = misma salida.
- Recalcular plan al cambiar datos para mantener optimalidad.
- En contexto local, considerar que cuota mensual ya incluye interés.

### server
- Diseñar despliegue liviano por limitaciones de hardware (Celeron N3350, 4GB RAM).
- Minimizar consumo de CPU y memoria en runtime y servicios auxiliares.
- Evitar dependencias pesadas o procesos innecesarios en producción.
- Priorizar configuraciones simples y eficientes para servidor personal.
- Tomar decisiones de arquitectura con foco en rendimiento base limitado.

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| — | — | No se detectaron `AGENTS.md`, `agents.md`, `CLAUDE.md`, `.cursorrules`, `GEMINI.md` ni `copilot-instructions.md` en el root del proyecto. |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
