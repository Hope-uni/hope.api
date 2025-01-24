

// getting the current date
const date = new Date();

const getFixtures = [
  {
    name: `Inicio de la comunicación`,
    description: `Se aprende a seleccionar una sola imagen por el elemento deseado.`,
    scoreActivities: 20,
    status: true,
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: `Distancia y Persistencia`,
    description: `Se aprende a generalizar la nueva habilidad, aumentando su capacidad para la selección de elementos en diferentes contextos.`,
    scoreActivities: 20,
    status: true,
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: `Discriminación de imagenes`,
    description: `Se aprende a seleccionar entre dos o más imágenes/tarjetas para pedir sus elementos favoritos.`,
    scoreActivities: 20,
    status: true,
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: `Estructura de la oración`,
    description: `Se aprende a construir oraciones simples utilizando una tarjeta de “principio de oración” y otra del elemento al que se refiere en ese momento.`,
    scoreActivities: 20,
    status: true,
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: `Responde a preguntas`,
    description: `El paciente pide espontáneamente variedad de objetos y contesta a la pregunta ¿Qué quieres?`,
    scoreActivities: 20,
    status: true,
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
  {
    name: `Comentar`,
    description: `Se aprende a aumentar y mejorar la respuesta a más variedad de preguntas, 
    creando una comunicación más funcional y con un reforzamiento más social y menos tangible.`,
    scoreActivities: 20,
    status: true,
    createdAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
    updatedAt: new Date(
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ),
  },
];



module.exports = {
  getFixtures
}