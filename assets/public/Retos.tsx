const retos = [
  {
    id: 1,
    titulo: "Límites y continuidad",
    descripcion: "Analiza el comportamiento de una función cuando la variable se aproxima a un valor.",
    ejercicio: "Calcula lim_{x→2} (x^2 - 4)/(x - 2) y determina si f(x) = (x^2 - 4)/(x - 2) es continua en x = 2 al extenderla por continuidad."
  },
  {
    id: 2,
    titulo: "Derivadas",
    descripcion: "Calcula la tasa de cambio instantánea de una función en un punto.",
    ejercicio: "Deriva f(x) = x^3 - 5x^2 + 2x - 7 y evalúa f'(2). Interpreta el resultado como pendiente de la tangente en x = 2."
  },
  {
    id: 3,
    titulo: "Integrales definidas",
    descripcion: "Determina el área bajo la curva de una función en un intervalo dado.",
    ejercicio: "Calcula ∫_{0}^{3} (2x + 1) dx y explica el significado geométrico del resultado."
  },
  {
    id: 4,
    titulo: "Ecuaciones diferenciales",
    descripcion: "Resuelve problemas que modelan fenómenos físicos y biológicos mediante derivadas.",
    ejercicio: "Resuelve la EDO dy/dx = 3y con y(0) = 2. Da la solución explícita y verifica la condición inicial."
  },
  {
    id: 5,
    titulo: "Álgebra lineal: matrices",
    descripcion: "Aplica operaciones con matrices para resolver sistemas de ecuaciones.",
    ejercicio: "Resuelve el sistema: 2x + y = 5, 3x - y = 4 usando inversión de matrices o eliminación gaussiana."
  },
  {
    id: 6,
    titulo: "Vectores en el espacio",
    descripcion: "Representa magnitudes con dirección y sentido en 2D y 3D.",
    ejercicio: "Dados a = (1, -2, 3) y b = (2, 1, 0), calcula: a·b, |a|, y el ángulo entre a y b."
  },
  {
    id: 7,
    titulo: "Cálculo multivariable",
    descripcion: "Explora funciones de varias variables y calcula derivadas parciales.",
    ejercicio: "Para f(x, y) = x^2y + e^{xy}, calcula ∂f/∂x y ∂f/∂y en el punto (1, 0)."
  },
  {
    id: 8,
    titulo: "Series y sucesiones",
    descripcion: "Estudia el comportamiento de secuencias y su convergencia.",
    ejercicio: "Determina si la serie ∑_{n=1}^{∞} 1/n^2 converge. Si converge, indica a qué valor (pista: serie de Basel)."
  },
  {
    id: 9,
    titulo: "Probabilidad y estadística",
    descripcion: "Modela eventos aleatorios y analiza datos con medidas estadísticas.",
    ejercicio: "Una moneda sesgada tiene P(cara)=0.6. Si la lanzas 5 veces, ¿cuál es la probabilidad de obtener exactamente 3 caras?"
  },
  {
    id: 10,
    titulo: "Transformadas de Laplace",
    descripcion: "Resuelve ecuaciones diferenciales lineales usando transformadas.",
    ejercicio: "Calcula la transformada de Laplace de f(t) = t·e^{2t} y simplifica la expresión resultante."
  },
  {
    id: 11,
    titulo: "Geometría analítica",
    descripcion: "Estudia rectas, planos y cónicas en el espacio cartesiano.",
    ejercicio: "Halla la ecuación de la recta que pasa por (1, -2) y es perpendicular a 3x + 4y - 7 = 0. Da la forma y = mx + b."
  },
  {
    id: 12,
    titulo: "Números complejos",
    descripcion: "Opera con números que incluyen la unidad imaginaria i.",
    ejercicio: "Simplifica (2 + 3i)(1 - 2i) y expresa el resultado en forma a + bi. Luego, calcula su módulo."
  },
  {
    id: 13,
    titulo: "Teoría de grafos",
    descripcion: "Modela relaciones y conexiones mediante vértices y aristas.",
    ejercicio: "En un grafo simple con 6 vértices, ¿cuál es el grado máximo posible de un vértice? Justifica tu respuesta."
  },
  {
    id: 14,
    titulo: "Optimización",
    descripcion: "Encuentra máximos y mínimos de funciones en distintos contextos.",
    ejercicio: "Maximiza f(x) = -x^2 + 6x - 5 en ℝ. Encuentra el vértice de la parábola y el valor máximo."
  },
  {
    id: 15,
    titulo: "Análisis numérico",
    descripcion: "Aplica métodos aproximados para resolver problemas matemáticos.",
    ejercicio: "Aprox. la raíz de f(x)=x^2-2 usando el método de bisección en [1,2] durante 3 iteraciones. Da los intervalos y el aproximado final."
  }
];

export default retos;
