# DUA — Diseño Universal para el Aprendizaje

> Doc de trabajo para LUMEN. Objetivo: entender el DUA lo suficiente como para diseñar la feature "Transformá este recurso" con rigor pedagógico.

---

## 1. Qué es (en dos minutos)

**DUA** (en inglés UDL — Universal Design for Learning) es un marco pedagógico del **CAST** (Center for Applied Special Technology), una organización de investigación educativa de EEUU. Nace en los 90s y hoy está incorporado en legislación educativa de varios países (incluso en ARG, figura en la Resolución CFE 311/16 sobre educación inclusiva).

**Idea central:** no existe "el alumno promedio". Todo grupo es diverso — en motivación, en cómo procesa información, en cómo demuestra lo que aprendió. Entonces, **en vez de adaptar para un alumno específico, diseñás la clase para que múltiples caminos ya estén previstos desde el inicio.**

Analogía: una rampa en un edificio no es solo para sillas de ruedas. Sirve a carritos de bebé, gente con muletas, una persona cansada. Cuando diseñás universal, todos ganan.

---

## 2. Por qué importa para LUMEN (y lo que dijo Cyntia)

En el Newman están usando DUA, y Cyntia hizo notar un punto clave:

> "Se supone que deberían adaptar los contenidos **para arriba también**, no solo para abajo."

Esto es **el error típico** al pensar en adaptación: que "adaptar = bajar exigencia". DUA plantea exactamente lo contrario. Si un alumno ya domina el contenido, **dejarlo ahí es también no atenderlo**. Adaptar es:

- **Hacia abajo** → andamiajes, apoyos, más estructura, texto más corto.
- **Hacia arriba** → desafíos extra, conexiones, producción más compleja, autonomía.
- **Lateralmente** → otro formato, otra vía de acceso, otro tipo de tarea.

Un buen recurso con DUA debería permitir que **toda la clase trabaje sobre el mismo contenido**, pero cada alumno con su puerta de entrada.

---

## 3. Los tres principios del DUA

CAST los organiza así (traducción pragmática, no académica):

| Principio | Pregunta que responde | En el aula |
|---|---|---|
| **1. Representación** | "¿Cómo accede el alumno a la info?" | Presentar el contenido de varias maneras: texto, audio, imagen, video, ejemplos concretos, analogías. |
| **2. Acción y expresión** | "¿Cómo demuestra lo que aprendió?" | Permitir que lo exprese de varias maneras: escrito, oral, visual, con un mapa, una presentación, una dramatización. |
| **3. Implicación** | "¿Cómo se engancha?" | Ofrecer opciones que despierten interés: elegir entre temas, niveles de desafío, contextos relevantes para ellos. |

**Nota:** un buen recurso no tiene que cumplir los tres principios al mismo tiempo. Un recurso puede ser excelente en representación (ej: explica un concepto con texto + diagrama + video) y ser neutro en los otros.

---

## 4. Cómo esto se traduce en LUMEN

Cuando un docente mira un recurso en LUMEN y quiere adaptarlo, la pregunta no es **"¿más fácil o más difícil?"** — esa es una dimensión muy pobre. El DUA nos da **ejes concretos** de transformación:

### Ejes de transformación ("Transformá este recurso")

Estos son los que deberían aparecer como botones/opciones de la feature:

| # | Eje | Ejemplo concreto (Plan lector: Martín Fierro) |
|---|---|---|
| 1 | **Simplificar acceso** | Versión con vocabulario actualizado, glosario al margen, texto segmentado. |
| 2 | **Profundizar desafío** | Ensayo comparando con otro texto gauchesco. Debate sobre la representación del indígena. Producción creativa extendiendo un capítulo. |
| 3 | **Cambiar formato** | Convertir la actividad escrita en un podcast, un stop-motion, una infografía. |
| 4 | **Agregar andamiaje** | Preguntas guía paso a paso, plantillas de respuesta, organizadores gráficos. |
| 5 | **Conectar con interés** | Reescribir consignas conectando con fútbol, música, redes sociales, cultura actual. |
| 6 | **Multi-lenguaje** | Versión bilingüe, con audio, con ilustraciones para apoyar lectura. |
| 7 | **Elegir nivel de autonomía** | Versión dirigida (todos hacen lo mismo) → versión de elección (eligen entre 3 caminos). |

---

## 5. La regla de oro al transformar

**No simplificar = bajar contenido.** Simplificar es **cambiar el camino, no el destino**. Si la meta era "comprender el valor del honor en Martín Fierro", una versión adaptada hacia abajo sigue teniendo esa meta — solo que la ruta es diferente (texto más corto + imágenes + preguntas guiadas en vez de análisis libre).

Misma regla para arriba: profundizar no es "agregar trabajo", es **ir al mismo núcleo conceptual pero con más abstracción, más conexiones, más producción original**.

---

## 6. Qué le pedimos a la IA cuando transforma

Cuando la IA toma un recurso y lo transforma, debería:

1. **Leer el recurso** y entender qué enseña (el núcleo conceptual, no los detalles).
2. **Preservar la meta de aprendizaje.** No cambiar el contenido; cambiar el camino.
3. **Aplicar UN eje de transformación** a la vez (no mezclar). El docente decide.
4. **Generar un nuevo recurso descargable**, no solo un texto suelto. Mantener formato, consignas claras, tono acorde al grado.
5. **Declarar qué cambió** en una línea arriba: "Adaptado para: profundizar desafío · lateral a formato visual".

Esto es la spec base para cuando implementemos la feature.

---

## 7. Dónde leer más (si Pablo o Cyntia quieren profundizar)

- **CAST UDL Guidelines 3.0** (2024) — [udlguidelines.cast.org](https://udlguidelines.cast.org) — versión oficial y completa.
- **Resolución CFE 311/16** — Argentina, marco legal de educación inclusiva con principios DUA.
- **"Diseño Universal para el Aprendizaje: educación para todos y prácticas de enseñanza inclusivas"** — José Blas García Pérez, 2018. Texto pragmático en español.
- **DUA-A (Fundación ONCE, España)** — adaptación española del CAST con lenguaje más cercano al aula de habla hispana.

---

## 8. Checklist de cierre

Antes de construir "Transformá este recurso", confirmar con Cyntia:

- [ ] ¿Los 7 ejes de transformación cubren lo que ella usa en el Newman?
- [ ] ¿Hay algún eje que les falta o que sobra?
- [ ] ¿Querés que cada recurso de LUMEN declare con qué principios DUA cumple (representación / expresión / implicación), como meta-dato?
- [ ] ¿El botón debe estar en el recurso (un recurso, una transformación) o también a nivel colección (transformar toda una unidad)?
